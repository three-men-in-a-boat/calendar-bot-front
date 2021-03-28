import {Markup, Telegraf} from "telegraf";
import CustomContext from "../Models/CustomContext";
import Event from "../Models/Meeting";
import axios, {AxiosError} from "axios";

function renderButtons(id: string, url: string, extended: boolean = false, callLink: string | undefined = undefined) {
    if (!extended) {
        return {
            inline_keyboard: [[
                {
                    text: '🔻 Развернуть',
                    callback_data: JSON.stringify({a: 'show_more', p: url})
                }
            ]]
        }
    } else {
        if (callLink) {

            return {
                inline_keyboard: [
                    [{text: '📲 Ссылка на звонок', callback_data: callLink}],
                    [{text: '🔺 Свернуть', callback_data: JSON.stringify({a: 'show_less', p: url})}]
                ]
            }
        } else {

            return {
                inline_keyboard: [[
                    {
                        text: '🔺 Свернуть',
                        callback_data: JSON.stringify({a: 'show_less', p: url})
                    }
                ]]
            }
        }

    }
}

function genHeader(event: Event) {
    let from = new Date();
    let to = new Date();

    if (!event) {
        return ''
    }

    if (!event.fullDay) {
        from = new Date(event.from!);
        to = new Date(event.to!);
    }

    let replyMdStr = ''
    replyMdStr += `<b>${event.title}</b>` + '\n\n⏰ '
    if (event.fullDay) {
        replyMdStr += 'Весь день';
    } else {
        if (from.getDate() === new Date().getDate()) {
            replyMdStr += 'Cегодня '
        } else if (from.getDate() === new Date().getDate() + 1) {
            replyMdStr += 'Завтра '
        } else if (from.getDate() === new Date().getDate() - 1) {
            replyMdStr += 'Вчера '
        } else {
            replyMdStr += from.toLocaleDateString('ru', {day: 'numeric', month: 'long'})
            if (from.getDay() !== to.getDay()) {
                replyMdStr += ' - ' + to.toLocaleDateString('ru', {day: 'numeric', month: 'long'})
            }
        }

        replyMdStr += ' <u>'
        replyMdStr += from.toLocaleTimeString('ru', {hour: 'numeric', minute: 'numeric', timeZone: 'UTC'});
        replyMdStr += ' - ';
        replyMdStr += to.toLocaleTimeString('ru', {hour: 'numeric', minute: 'numeric', timeZone: 'UTC'});
        replyMdStr += '</u>'
    }

    return replyMdStr
}

function genFooter(event: Event) {
    let replyMdStr = ''
    replyMdStr += '-------------------------------------\n';
    replyMdStr += `🗓 Календарь ${event.calendar.title}`

    return replyMdStr
}

function createShortMdStr(event: Event) {
    let replyMdStr = genHeader(event);

    replyMdStr += '\n';

    replyMdStr += genFooter(event);

    return replyMdStr
}

function createFullMdStr(event: Event) {
    let replyMdStr = genHeader(event);

    if (event.location?.description) {
        replyMdStr += ' - ' + event.location.description;
    }

    replyMdStr += '\n';

    let sendTitleAtt: boolean = false
    for (let user of event.attendees) {
        if (user.email !== 'calendar@internal') {
            if (!sendTitleAtt) {
                replyMdStr += '-------------------------------------\n';
                replyMdStr += '✅ <u><i>Участники:</i></u>\n\n';
                sendTitleAtt = true;
            }
            replyMdStr += '\n' + (user.name ? user.name : '') + ' (' + user.email + ') '
            if (event.organizer.email === user.email) {
                replyMdStr += ' - Организатор'
            }
        }
    }
    replyMdStr += '\n'


    if (event.description) {
        replyMdStr += '-------------------------------------\n';
        replyMdStr += '📋 <u><i>Описание</i></u>\n\n';
        replyMdStr += event.description;
        replyMdStr += '\n'
    }


    replyMdStr += genFooter(event);

    return replyMdStr
}

function EventCard(ctx: CustomContext, event: Event, url: string) {
    const replyMdStr = createShortMdStr(event);

    return ctx.reply(
        replyMdStr,
        {
            parse_mode: 'HTML',
            reply_markup: renderButtons(event.uid, url)
        }
    )

}


function EventCardHandler(bot: Telegraf<CustomContext>) {
    bot.action(/show_more/, async ctx => {
        const data = JSON.parse(ctx.match.input);

        axios.get(`${process.env['BACKEND_URL']}/telegram/user/${ctx.update.callback_query.from.id}/events/${data.p}`)
            .then(resp => {

                // @ts-ignore
                const title = ctx.update.callback_query.message.text.split('\n')[0]

                let event: Event;
                if (resp.data.data) {
                    let eventsArray: Array<Event> = resp.data.data.events;
                    event = eventsArray.filter(curr => {
                        return curr.title === title;
                    })[0]
                } else {
                    event = resp.data as Event;
                }
                ctx.editMessageText(
                    createFullMdStr(event),
                    {
                        parse_mode: 'HTML',
                        reply_markup: renderButtons(event.uid, data.p, true, event.call)
                    }
                )
            })
            .catch((err: AxiosError) => {
                ctx.reply(`Show more callback error: ${err.message}`)
            })
    })


    bot.action(/show_less/, async ctx => {
        const data = JSON.parse(ctx.match.input);

        axios.get(`${process.env['BACKEND_URL']}/telegram/user/${ctx.update.callback_query.from.id}/events/${data.p}`)
            .then(resp => {

                // @ts-ignore
                const title = ctx.update.callback_query.message.text.split('\n')[0]

                let event: Event;
                if (resp.data.data) {
                    let eventsArray: Array<Event> = resp.data.data.events;
                    event = eventsArray.filter(curr => {
                        return curr.title === title;
                    })[0]
                } else {
                    event = resp.data as Event;
                }

                ctx.editMessageText(
                    createShortMdStr(event),
                    {
                        parse_mode: 'HTML',
                        reply_markup: renderButtons(event.uid, data.p)
                    }
                )
            })
            .catch((err: AxiosError) => {
                ctx.reply(`Show less callback fall with err: ${err.message}`);
            })
    })
}

export {EventCardHandler, EventCard};
