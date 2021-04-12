import {Telegraf} from "telegraf";
import CustomContext from "../Models/CustomContext";
import Event from "../Models/Event";
import axios, {AxiosError} from "axios";
import getChatType from "./get_chat_type";
import getId from "./getId";
import getUserName from "./get_user_name";
import {createFullHTMLStr, createShortHTMLStr} from "../Calendar/events/show_event_info";

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



function EventCard(ctx: CustomContext, event: Event, url: string) {
    let replyMdStr = createShortHTMLStr(event);
    let chatType = getChatType(ctx);


    if (chatType === "group") {
        let id = getId(ctx);
        let userName = getUserName(ctx);
        replyMdStr = createShortHTMLStr(event, id, userName);
        return ctx.reply(
            replyMdStr,
            {
                parse_mode: 'HTML'
            }
        )
    } else {
        return ctx.reply(
            replyMdStr,
            {
                parse_mode: 'HTML',
                reply_markup: renderButtons(event.uid, url)
            }
        )
    }


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

                let str = createFullHTMLStr(event);
                if (chatType === "group") {
                    str = createFullHTMLStr(event, id, userName);
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

                let str = createShortHTMLStr(event);
                if (chatType === "group") {
                    str = createShortHTMLStr(event, id, userName);
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
