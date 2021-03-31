import {Markup, Telegraf} from "telegraf";
import CustomContext from "../Models/CustomContext";
import Event from "../Models/Event";
import axios, {AxiosError} from "axios";
import moment from 'moment';
import getChatType from "./get_chat_type";
import getId from "./getId";
import getUserName from "./get_user_name";

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
                    [{text: '📲 Ссылка на звонок', url: callLink}],
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
    moment.locale('ru');
    if (event.fullDay) {
        replyMdStr += 'Весь день';
    } else {
        if (from.getDate() === new Date().getDate()) {
            replyMdStr += 'Cегодня'
        } else if (from.getDate() === new Date().getDate() + 1) {
            replyMdStr += 'Завтра'
        } else if (from.getDate() === new Date().getDate() - 1) {
            replyMdStr += 'Вчера'
        } else {
            replyMdStr += moment(event.from!).format('D MMMM YYYY')
            if (from.getDay() !== to.getDay()) {
                replyMdStr += ' - ' + moment(event.to!).format('D MMMM YYYY')
            }
        }

        replyMdStr += ', <u>'
        replyMdStr += moment(event.from!).format('LT')
        replyMdStr += ' - ';
        replyMdStr += moment(event.to!).format('LT')
        replyMdStr += '</u>'
    }

    return replyMdStr
}

function genFooter(event: Event, user_id?: number, user_name?: string) {
    let replyMdStr = ''
    replyMdStr += '-------------------------------------\n';
    replyMdStr += `🗓 Календарь <b>${event.calendar.title}</b>`
    if (user_id && user_name) {
        replyMdStr += ` пользователя <a href="tg://user?id=${user_id}">${user_name}</a>`
    }

    return replyMdStr
}

function createShortMdStr(event: Event, user_id?: number, user_name?: string) {
    let replyMdStr = genHeader(event);

    replyMdStr += '\n';

    replyMdStr += genFooter(event, user_id, user_name);

    return replyMdStr
}

function createFullMdStr(event: Event, user_id?: number, user_name?: string) {
    let replyMdStr = genHeader(event);

    if (event.location?.description) {
        replyMdStr += '\n📍 ' + event.location.description;
    }

    replyMdStr += '\n';

    let sendTitleAtt: boolean = false
    for (let user of event.attendees) {
        if (user.email !== 'calendar@internal') {
            if (!sendTitleAtt) {
                replyMdStr += '-------------------------------------\n';
                replyMdStr += '<u><i>Участники:</i></u>\n';
                sendTitleAtt = true;
            }
            replyMdStr += '\n' + (user.name ? user.name : '') + ' (' + user.email + ') '
            if (event.organizer.email === user.email) {
                replyMdStr += ' - Организатор'
            } else {
                if (user.status === 'ACCEPTED') {
                    replyMdStr += ' ✅'
                } else if (user.status === 'NEEDS_ACTION') {
                    replyMdStr += ' �'
                } else {
                    replyMdStr += ' ❌'
                }
            }
        }
    }
    replyMdStr += '\n'


    if (event.description) {
        replyMdStr += '-------------------------------------\n';
        replyMdStr += '<u><i>Описание</i></u>\n\n';
        replyMdStr += event.description;
        replyMdStr += '\n'
    }


    replyMdStr += genFooter(event, user_id, user_name);

    return replyMdStr
}

function EventCard(ctx: CustomContext, event: Event, url: string) {
    let replyMdStr = createShortMdStr(event);
    let chatType = getChatType(ctx);
    let id = getId(ctx);
    let userName = getUserName(ctx);

    if (chatType === "group") {
        replyMdStr = createShortMdStr(event, id, userName);
    }

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
                //TODO тестировать что будет если ткнет другой пользователь
                let chatType = getChatType(ctx);
                let id = getId(ctx);
                let userName = getUserName(ctx);

                let str = createFullMdStr(event);
                if (chatType === "group") {
                    str = createFullMdStr(event, id, userName);
                }

                ctx.editMessageText(
                    str,
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


                let chatType = getChatType(ctx);
                let id = getId(ctx);
                let userName = getUserName(ctx);

                let str =  createShortMdStr(event);
                if (chatType === "group") {
                    str = createShortMdStr(event, id, userName);
                }

                ctx.editMessageText(
                   str,
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
