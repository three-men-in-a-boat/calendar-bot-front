import {Markup, Telegraf} from "telegraf";
import CustomContext from "../Models/CustomContext";
import Event from "../Models/Meeting";
import axios from "axios";

function renderButtons(id: string, url: string, extended: boolean = false, callLink: string|undefined = undefined) {
    if (!extended) {
        return Markup.inlineKeyboard([
            Markup.button.callback('🔻 Развернуть', JSON.stringify({a: 'show_more', p: url})),
        ])
    } else {
        if (callLink) {
            return Markup.inlineKeyboard([
                [Markup.button.url('📲 Ссылка на звонок', callLink)],
                [Markup.button.callback('🔺 Свернуть', JSON.stringify({a: 'show_less', p: url}))],
            ])
        } else {
            return Markup.inlineKeyboard([
                Markup.button.callback('🔺 Свернуть', JSON.stringify({a: 'show_less', p: url})),
            ])
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
    replyMdStr += event.title + '\n\n⏰ '
    if (event.fullDay) {
        replyMdStr += 'Весь день';
    } else {
        replyMdStr += from.toLocaleTimeString('ru', {hour: 'numeric', minute: 'numeric'});
        replyMdStr += ' - ';
        replyMdStr += to.toLocaleTimeString('ru', {hour: 'numeric', minute: 'numeric'});
    }

    return replyMdStr
}

function createShortMdStr(event: Event) {
    let replyMdStr = genHeader(event);

    replyMdStr += '\n';

    replyMdStr += '-------------------------------------\n';
    replyMdStr += `🗓 Календарь ${event.calendar.title}`

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
                replyMdStr += '✅ Участники:\n';
                sendTitleAtt = true;
            }
            replyMdStr += '\n' + user.name + ' (' + user.email + ') '
            if (event.organizer.email === user.email) {
                replyMdStr += ' - Организатор'
            }
        }
    }
    replyMdStr += '\n'


    if (event.description) {
        replyMdStr += '-------------------------------------\n';
        replyMdStr += '📋 Описание\n\n';
        replyMdStr += event.description;
        replyMdStr += '\n'
    }



    replyMdStr += '-------------------------------------\n';
    replyMdStr += `🗓 Календарь ${event.calendar.title}`

    return replyMdStr
}

function EventCard(ctx: CustomContext, event: Event, url: string) {
    const replyMdStr = createShortMdStr(event);

    return ctx.reply(
        replyMdStr,
        renderButtons(event.uid, url)
    )

}

function EventCardHandler(bot: Telegraf<CustomContext>) {
    bot.action(/show_more/, async ctx => {
        const data = JSON.parse(ctx.match.input);

        let resp = null;
        let err = null;
        try {
            resp = await axios.get(`${process.env['BACKEND_URL']}/telegram/user/${ctx.update.callback_query.from.id}/events/${data.p}`);
        } catch (e) {
            err = e;
        }

        if (resp) {
            // @ts-ignore
            const title = ctx.update.callback_query.message.text.split('\n')[0]

            let event: Event;
            if (resp.data.data) {
                let eventsArray:Array<Event> = resp.data.data.events;
                event = eventsArray.filter(curr => {
                    return curr.title === title;
                })[0]
            } else {
                event = resp.data as Event;
            }

            ctx.editMessageText(
                createFullMdStr(event),
                renderButtons(event.uid, data.p, true, event.call)
            )
        } else {
            ctx.reply(`${err}`)
        }
    });
    bot.action(/show_less/, async ctx => {
        const data = JSON.parse(ctx.match.input);

        let resp = null;
        let err = null;
        try {
            resp = await axios.get(`${process.env['BACKEND_URL']}/telegram/user/${ctx.update.callback_query.from.id}/events/${data.p}`);
        } catch (e) {
            err = e;
        }

        if (resp) {
            // @ts-ignore
            const title = ctx.update.callback_query.message.text.split('\n')[0]

            let event: Event;
            if (resp.data.data) {
                let eventsArray:Array<Event> = resp.data.data.events;
                event = eventsArray.filter(curr => {
                    return curr.title === title;
                })[0]
            } else {
                event = resp.data as Event;
            }

            ctx.editMessageText(
                createShortMdStr(event),
                renderButtons(event.uid, data.p)
            )
        } else {
            ctx.reply(`${err}`)
        }
    })
}

export {EventCardHandler, EventCard};
