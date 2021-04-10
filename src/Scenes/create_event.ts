import {Scenes} from "telegraf";
import CustomContext from "../Models/CustomContext";
import getUserName from "../utils/get_user_name";
import getId from "../utils/getId";
import {createFullHTMLStr, createShortHTMLStr} from "../Calendar/events/show_event_info";
import axios, {AxiosError} from "axios";
import CreateEventCard from "../Calendar/events/create_event_card";
import getChatType from "../utils/get_chat_type";
import {uuid} from 'uuidv4';
import getMessageId from "../utils/get_message_id";
import sendError from "../utils/send_error";

const CreateEventScene = new Scenes.BaseScene<CustomContext>('create_event');

function genInlineKeyboard(ctx: CustomContext) {
    const inline_keyboard = [];

    switch (ctx.scene.session.create_event.curr){
        case 'INIT':
            break;
    }

    inline_keyboard.push([{
        text: 'Отменить',
        callback_data: 'create_event_stop'
    }])

    return {inline_keyboard}

    // if (event.title && !event.from && !event.fullDay) {
    //     return {
    //         inline_keyboard: [
    //             [
    //                 {
    //                     text: 'Весь день',
    //                     callback_data: 'create_event_fullday',
    //                 }
    //             ],
    //             [
    //                 {
    //                     text: 'Отменить',
    //                     callback_data: 'create_event_stop',
    //                 }
    //             ]
    //         ],
    //     }
    // }
    // if (event.from && !event.to) {
    //     return {
    //         inline_keyboard: [
    //             [
    //                 {
    //                     text: '30 минут', callback_data: JSON.stringify({
    //                         a: 'create_event_add',
    //                         p: 30
    //                     })
    //                 },
    //                 {
    //                     text: '1 час', callback_data: JSON.stringify({
    //                         a: 'create_event_add',
    //                         p: 60
    //                     })
    //                 },
    //             ],
    //             [
    //                 {
    //                     text: '2 часа', callback_data: JSON.stringify({
    //                         a: 'create_event_add',
    //                         p: 120
    //                     })
    //                 },
    //                 {
    //                     text: '4 часа', callback_data: JSON.stringify({
    //                         a: 'create_event_add',
    //                         p: 240
    //                     })
    //                 }
    //             ],
    //             [
    //                 {
    //                     text: 'Отменить',
    //                     callback_data: 'create_event_stop',
    //                 }
    //             ]
    //         ]
    //     }
    // }
    //
    // if (event.from && event.to || event.fullDay) {
    //     if (curr === 'USERS') {
    //         return {
    //             inline_keyboard: [
    //                 [
    //                     {
    //                         text: 'Создать событие',
    //                         callback_data: 'create_event_create',
    //                     }
    //                 ],
    //                 [
    //                     {
    //                         text: 'Добавить описание',
    //                         callback_data: 'create_event_desc_add'
    //                     }
    //                 ],
    //                 [
    //                     {
    //                         text: 'Отменить',
    //                         callback_data: 'create_event_stop',
    //                     }
    //                 ]
    //             ],
    //         }
    //     } else {
    //         return {
    //             inline_keyboard: [
    //                 [
    //                     {
    //                         text: 'Создать событие',
    //                         callback_data: 'create_event_create',
    //                     }
    //                 ],
    //                 [
    //                     {
    //                         text: 'Добавить участников',
    //                         callback_data: 'create_event_users_add'
    //                     }
    //                 ],
    //                 [
    //                     {
    //                         text: 'Отменить',
    //                         callback_data: 'create_event_stop',
    //                     }
    //                 ]
    //             ],
    //         }
    //     }
    // }
    //
    // return {
    //     inline_keyboard: [[
    //         {
    //             text: 'Отменить',
    //             callback_data: 'create_event_stop',
    //         }
    //     ]],
    // }
}

function genMessageText(ctx: CustomContext) {
    let retStr = '';
    switch (ctx.scene.session.create_event.curr) {
        case 'INIT':
            retStr += '\n<b>Введите время события</b>:';
            retStr += '\n\nНапример <pre>завтра в 12:00 </pre>или<pre> 22 марта</pre>';

            if (getChatType(ctx) != 'private') {
                retStr += `\nТолько ${getUserName(ctx)} может взаимодействовать с этим сообщением`;
            }

            break;
        case 'TO':
            retStr +=  `\n<b>Выберите продолжительность события или введите время окончания события</b>`;

    }


    if (ctx.scene.session.create_event.curr === 'INIT') {
        return retStr;
    }

    const event = ctx.scene.session.create_event.event;

    retStr += '\n\nСобытие:\n';
    retStr += createFullHTMLStr(event)

    if (getChatType(ctx) != 'private') {
        retStr += `\nТолько ${getUserName(ctx)} может взаимодействовать с этим сообщением`;
    }

    return retStr
}

function genReply(ctx: CustomContext) {
    return ctx.telegram.editMessageText(
        ctx.scene.session.create_event.cid,
        ctx.scene.session.create_event.mid,
        undefined,
        genMessageText(ctx), {
            parse_mode: 'HTML',
            reply_markup: genInlineKeyboard(ctx)
        })

}

CreateEventScene.enter(ctx => {
    if (ctx.chat) {
        ctx.scene.session.create_event.cid = ctx.chat.id

        ctx.telegram.sendMessage(
            ctx.scene.session.create_event.cid,
            genMessageText(ctx),
            {
                parse_mode: 'HTML',
                reply_markup: genInlineKeyboard(ctx)
            }
        ).then(m => {
            ctx.scene.session.create_event.mid = m.message_id;
        })

        return;
    } else {
        return ctx.reply('CreateEventScene error: Can\'t find chat id')
    }
})

CreateEventScene.action('create_event_stop', ctx => {
    return ctx.scene.leave();
})

CreateEventScene.on('text', async ctx => {
    if (ctx.message.text[0] === '/') {
        return ctx.telegram.sendMessage(
            ctx.scene.session.create_event.cid,
            "Нельзя пользоваться командами пока вы создаете событие. Отменить создание события?",
            {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [{
                            text: 'Отменить создание события',
                            callback_data: 'create_event_stop'
                        }]
                    ]
                }
            }
        )
    }
    switch (ctx.scene.session.create_event.curr) {
        case 'INIT':
            axios.put(`${process.env['BACKEND_URL']}/parse/date`,
                {text: ctx.message.text})
                .then(async resp => {
                    let event = ctx.scene.session.create_event.event;
                    event.title = 'Без названия';
                    if (resp.data.date) {
                        event.from = resp.data.date;
                    } else {
                        return sendError(ctx, 'Дата не распознана, попробуйте еще раз');
                    }
                    ctx.scene.session.create_event.curr = 'TO';
                    if (ctx.scene.session.create_event.error_message_id !== 0) {
                        ctx.telegram.deleteMessage(ctx.scene.session.create_event.cid,
                            ctx.scene.session.create_event.error_message_id);
                        ctx.scene.session.create_event.error_message_id = 0;
                    }
                    return genReply(ctx)
                })
                .catch((err: AxiosError) => {
                    console.log(`Create init error: ${err.message}`);
                })
            break;
        case 'TITLE':
            ctx.scene.session.create_event.event.title = ctx.message.text;
            ctx.scene.session.create_event.curr = 'FROM'
            return genReply(ctx)
        case 'FROM':


            break;
        case 'TO':

            break;
        case 'DESC':
            ctx.scene.session.create_event.event.description = ctx.message.text;
            return genReply(ctx);

        case 'USERS':
            ctx.scene.session.create_event.event.attendees.push({
                email: ctx.message.text,
                role: 'REQUIRED'
            })
            return genReply(ctx);
    }
})

CreateEventScene.action(/create_event_add/, ctx => {
    const data = JSON.parse(ctx.match.input)
    let dateTo = new Date(ctx.scene.session.create_event.event.from!)
    dateTo.setMinutes(dateTo.getMinutes() + data.p)
    ctx.scene.session.create_event.event.to = dateTo.toISOString();
    ctx.scene.session.create_event.curr = 'DESC';
    return genReply(ctx);
})

CreateEventScene.action('create_event_create', ctx => {
    const id = uuid()
    ctx.scene.session.create_event.event.uid = id;
    axios.post(
        `${process.env['BACKEND_URL']}/telegram/user/${getId(ctx)}/events/event/create`,
        ctx.scene.session.create_event.event
    )
        .then(resp => {
            ctx.scene.session.create_event.created = true;
            ctx.scene.session.redis_client.set(id.slice(0, 20), resp.data);
            return ctx.scene.leave();
        })
        .catch(async (err: AxiosError) => {
            await ctx.reply(`Can't create event - err: ${err.message}`);
            return ctx.scene.leave();
        })


})

CreateEventScene.action('create_event_fullday', ctx => {
    ctx.scene.session.create_event.event.fullDay = true;
    ctx.scene.session.create_event.curr = 'DESC';
    return genReply(ctx);
})

CreateEventScene.action('create_event_users_add', ctx => {
    ctx.scene.session.create_event.curr = 'USERS';
    return genReply(ctx);
})

CreateEventScene.action('create_event_desc_add', ctx => {
    ctx.scene.session.create_event.curr = 'DESC';
    return genReply(ctx);
})

CreateEventScene.leave(ctx => {
    if (ctx.scene.session.create_event.created) {
        return CreateEventCard(ctx, ctx.scene.session.create_event.event.uid);
    } else {
        if (getMessageId(ctx) && getMessageId(ctx) !== ctx.scene.session.create_event.mid) {
            ctx.editMessageText('Создание события отменено. Повторите команду, которую вы хотели выполнить ' +
                '(можно нажать на предыдущее сообщение)')
            return ctx.telegram.editMessageText(
                ctx.scene.session.create_event.cid,
                ctx.scene.session.create_event.mid,
                undefined,
                'Отмена создания события');
        }
        return ctx.editMessageText('Отмена создания события');
    }

})

CreateEventScene.on('message', async ctx => {
    ctx.telegram.sendMessage(
        ctx.scene.session.create_event.cid,
        "Отменить создание события?",
        {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: 'Да',
                        callback_data: 'create_event_stop'
                    }]
                ]
            }
        }
    )
        .then(m => {
            ctx.scene.session.create_event.error_message_id = m.message_id
        })
})

export default CreateEventScene
