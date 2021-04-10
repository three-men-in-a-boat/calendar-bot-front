import GetDatetimeHTMLString from "../../utils/get_datetime_html_string";
import CustomContext from "../../Models/CustomContext";
import getUserName from "../../utils/get_user_name";
import getChatType from "../../utils/get_chat_type";
import Event from "../../Models/Event";

function genEventReply(event: Event, name: string | undefined = undefined) {
    let retStr = `<b>${name ? name : 'Вы'} создали событие ${event.title}</b>\n\n`;

    retStr += '⏰ '
    if (event.fullDay) {
        retStr += 'Весь день\n'
    } else {
        retStr += GetDatetimeHTMLString(new Date(event.from!), false, new Date(event.to!));
    }

    return retStr
}


function genEventKeyboard(uid: string) {
    return {
        inline_keyboard: [[
            {
                text: '✅ Я иду',
                callback_data: JSON.stringify({
                    a: 'event_user_accept',
                    p: uid.slice(0, 20)
                })
            },

            {
                text: '❌ Я не иду',
                callback_data: JSON.stringify({
                    a: 'event_user_decline',
                    p: uid.slice(0, 20)
                })
            },

        ]]
    }
}

export default function CreateEventCard(ctx: CustomContext, uid: string) {
    if (getChatType(ctx) === 'group') {
        return ctx.editMessageText(genEventReply(ctx.scene.session.create_event.event, getUserName(ctx)), {
            parse_mode: 'HTML',
            reply_markup: genEventKeyboard(uid)
        })
    } else {
        return ctx.editMessageText(genEventReply(ctx.scene.session.create_event.event), {
            parse_mode: 'HTML',
        })
    }
}
