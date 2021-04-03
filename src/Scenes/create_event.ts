import {Scenes} from "telegraf";
import CustomContext from "../Models/CustomContext";
import getUserName from "../utils/get_user_name";
import getId from "../utils/getId";
import CreateEvent from "../Models/CreateEvent";
import moment from "moment";
import parseDate from "../utils/parse_date";
import axios, {AxiosError} from "axios";
import CreateEventCard from "../utils/create_event_card";
import getChatType from "../utils/get_chat_type";
import {uuid} from 'uuidv4';

const CreateEventScene = new Scenes.BaseScene<CustomContext>('create_event');

function genInlineKeyboard(event: CreateEvent, curr_step: string | undefined = undefined) {
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

    if (event.from && !event.to) {
        return {
            inline_keyboard: [
                [
                    {
                        text: '30 минут', callback_data: JSON.stringify({
                            a: 'create_event_add',
                            p: 30
                        })
                    },
                    {
                        text: '1 час', callback_data: JSON.stringify({
                            a: 'create_event_add',
                            p: 60
                        })
                    },
                ],
                [
                    {
                        text: '2 часа', callback_data: JSON.stringify({
                            a: 'create_event_add',
                            p: 120
                        })
                    },
                    {
                        text: '4 часа', callback_data: JSON.stringify({
                            a: 'create_event_add',
                            p: 240
                        })
                    }
                ],
                [
                    {
                        text: 'Отменить',
                        callback_data: 'create_event_stop',
                    }
                ]
            ]
        }
    }

    if (event.from && event.to || event.fullDay) {
        if (curr_step === 'USERS') {
            return {
                inline_keyboard: [
                    [
                        {
                            text: 'Создать событие',
                            callback_data: 'create_event_create',
                        }
                    ],
                    [
                        {
                            text: 'Добавить описание',
                            callback_data: 'create_event_desc_add'
                        }
                    ],
                    [
                        {
                            text: 'Отменить',
                            callback_data: 'create_event_stop',
                        }
                    ]
                ],
            }
        } else {
            return {
                inline_keyboard: [
                    [
                        {
                            text: 'Создать событие',
                            callback_data: 'create_event_create',
                        }
                    ],
                    [
                        {
                            text: 'Добавить участников',
                            callback_data: 'create_event_users_add'
                        }
                    ],
                    [
                        {
                            text: 'Отменить',
                            callback_data: 'create_event_stop',
                        }
                    ]
                ],
            }
        }
    }

    return {
        inline_keyboard: [[
            {
                text: 'Отменить',
                callback_data: 'create_event_stop',
            }
        ]],
    }
}

function genMessageText(event: CreateEvent, name: string | undefined = undefined, curr_step: string | undefined = undefined) {
    let retStr = '';
    if (name) {
        retStr += `${name} начинает создание события\n\n`;
    } else {
        retStr += 'Начинаем создавать событие\n\n'
    }

    if (!event.title) {
        retStr += "<b>Введите название события</b>"
    } else {
        retStr += `<b>Название: </b> ${event.title}`
        if (event.fullDay) {
            retStr += '\n<b>Весь день</b>'
            if (event.description) {
                retStr += `\n<b>Описание:</b> ${event.description}`;
            }
            if (event.attendees.length > 0) {
                retStr += '\n<b>Участники: </b>'
                event.attendees.forEach(curr => {
                    retStr += `\n${curr.email}`
                })
            }

            if (curr_step === 'USERS') {
                retStr += '\n\n<b>Введите введите почту пользователя, которого хотите добавить</b>'
            } else {
                retStr += '\n\n<b>Введите описание события</b>'
            }
        } else {
            if (event.from) {
                moment.locale('ru');
                retStr += `\n<b>Время начала: </b> ${moment(event.from).format('LL')} в ${moment(event.from).format('LT')}`
                if (event.to) {
                    retStr += `\n<b>Время окончания: </b> ${moment(event.to).format('LL')} в ${moment(event.to).format('LT')}`
                    if (event.description) {
                        retStr += `\n<b>Описание:</b> ${event.description}`;
                    }
                    if (event.attendees.length > 0) {
                        retStr += '\n<b>Участники: </b>'
                        event.attendees.forEach(curr => {
                            retStr += `\n${curr.email}`
                        })
                    }

                    if (curr_step === 'USERS') {
                        retStr += '\n\n<b>Введите введите почту пользователя, которого хотите добавить</b>'
                    } else {
                        retStr += '\n\n<b>Введите описание события</b>'
                    }
                } else {
                    retStr += "\n\n<b>Выберите продолжительность события или введите дату и время окончания события в формате ДД.ММ.ГГГГ ЧЧ.ММ</b> (23.03.2021 18:00)"
                }
            } else {
                retStr += "\n\n<b>Введите дату и время начала события в формате ДД.ММ.ГГГГ ЧЧ.ММ</b> (23.03.2021 18:00)"
            }
        }
    }

    if (name) {
        retStr += `\n\n<i>Только этот пользователь может взаимодействовать с этим сообщением.</i>`
    }

    return retStr
}

function genReply(ctx: CustomContext) {
    if (getChatType(ctx) === 'group') {
        return ctx.telegram.editMessageText(
            ctx.scene.session.create_event.cid,
            ctx.scene.session.create_event.mid,
            undefined,
            genMessageText(
                ctx.scene.session.create_event.event,
                getUserName(ctx)
                , ctx.scene.session.create_event.curr_step), {
                parse_mode: 'HTML',
                reply_markup: genInlineKeyboard(
                    ctx.scene.session.create_event.event,
                    ctx.scene.session.create_event.curr_step
                )
            })
    } else {
        return ctx.telegram.editMessageText(
            ctx.scene.session.create_event.cid,
            ctx.scene.session.create_event.mid,
            undefined,
            genMessageText(ctx.scene.session.create_event.event, undefined,
                ctx.scene.session.create_event.curr_step), {
                parse_mode: 'HTML',
                reply_markup: genInlineKeyboard(
                    ctx.scene.session.create_event.event,
                    ctx.scene.session.create_event.curr_step
                )
            })
    }


}

CreateEventScene.enter(ctx => {
    if (ctx.chat) {
        ctx.scene.session.create_event.cid = ctx.chat.id

        ctx.telegram.sendMessage(
            ctx.scene.session.create_event.cid,
            genMessageText(ctx.scene.session.create_event.event,
                getChatType(ctx) === 'group' ? getUserName(ctx) : undefined),
            {
                parse_mode: 'HTML',
                reply_markup: genInlineKeyboard(ctx.scene.session.create_event.event)
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
    switch (ctx.scene.session.create_event.curr_step) {
        case 'TITLE':
            ctx.scene.session.create_event.event.title = ctx.message.text;
            ctx.scene.session.create_event.curr_step = 'FROM'
            return genReply(ctx)
        case 'FROM':
            const date_from: Date | undefined = await parseDate(ctx, ctx.message.text)
            if (date_from) {
                ctx.scene.session.create_event.event.from = date_from.toISOString();
                ctx.scene.session.create_event.curr_step = 'TO';
                return genReply(ctx)
            }
            break;
        case 'TO':
            const date_to: Date | undefined = await parseDate(ctx, ctx.message.text)
            if (date_to) {
                ctx.scene.session.create_event.event.from = date_to.toISOString();
                ctx.scene.session.create_event.curr_step = 'DESC';
                return genReply(ctx)
            }
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
    ctx.scene.session.create_event.curr_step = 'DESC';
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
    ctx.scene.session.create_event.curr_step = 'DESC';
    return genReply(ctx);
})

CreateEventScene.action('create_event_users_add', ctx => {
    ctx.scene.session.create_event.curr_step = 'USERS';
    return genReply(ctx);
})

CreateEventScene.action('create_event_desc_add', ctx => {
    ctx.scene.session.create_event.curr_step = 'DESC';
    return genReply(ctx);
})

CreateEventScene.leave(ctx => {
    if (ctx.scene.session.create_event.created) {
        return CreateEventCard(ctx, ctx.scene.session.create_event.event.uid);
    } else {
        return ctx.editMessageText('Отмена создания события');
    }

})

export default CreateEventScene
