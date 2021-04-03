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

const CreateEventScene = new Scenes.BaseScene<CustomContext>('create_event');

function genInlineKeyboard(event: CreateEvent) {
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

    if (event.from && event.to) {
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
                        text: 'Отменить',
                        callback_data: 'create_event_stop',
                    }
                ]
            ],
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

function genMessageText(event: CreateEvent,name: string|undefined = undefined) {
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
        if (event.from) {
            moment.locale('ru');
            retStr += `\n<b>Время начала: </b> ${moment(event.from).format('LL')} в ${moment(event.from).format('LT')}`
            if (event.to) {
                retStr += `\n<b>Время окончания: </b> ${moment(event.to).format('LL')} в ${moment(event.to).format('LT')}`
                if (event.description) {
                    retStr += `\n<b>Описание:</b> ${event.description}`;
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
            genMessageText(ctx.scene.session.create_event.event,getUserName(ctx)), {
                parse_mode: 'HTML',
                reply_markup: genInlineKeyboard(ctx.scene.session.create_event.event)
            })
    } else {
        return ctx.telegram.editMessageText(
            ctx.scene.session.create_event.cid,
            ctx.scene.session.create_event.mid,
            undefined,
            genMessageText(ctx.scene.session.create_event.event), {
                parse_mode: 'HTML',
                reply_markup: genInlineKeyboard(ctx.scene.session.create_event.event)
            })
    }


}

CreateEventScene.enter(ctx => {
    if (ctx.chat) {
        ctx.scene.session.create_event.cid = ctx.chat.id

            ctx.telegram.sendMessage(
                ctx.scene.session.create_event.cid,
                genMessageText(ctx.scene.session.create_event.event,
                    getChatType(ctx) === 'group' ? getUserName(ctx) : undefined ),
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
            ctx.scene.session.create_event.curr_step = 'DONE'
            return genReply(ctx);
    }
})

CreateEventScene.action(/create_event_add/, ctx => {
    const data = JSON.parse(ctx.match.input)
    let dateTo = new Date(ctx.scene.session.create_event.event.from)
    dateTo.setMinutes(dateTo.getMinutes() + data.p)
    ctx.scene.session.create_event.event.to = dateTo.toISOString();
    ctx.scene.session.create_event.curr_step = 'DESC';
    return genReply(ctx);
})

CreateEventScene.action('create_event_create', ctx => {
    axios.post(
        `${process.env['BACKEND_URL']}/telegram/user/${getId(ctx)}/events/event/create`,
        ctx.scene.session.create_event.event
    )
        .then(resp => {
            ctx.scene.session.create_event.created = true;
            return ctx.scene.leave();
        })
        .catch(async (err: AxiosError) => {
            await ctx.reply(`Can't create event - err: ${err.message}`);
            return ctx.scene.leave();
        })


})

CreateEventScene.leave(ctx => {
    if (ctx.scene.session.create_event.created) {
        return CreateEventCard(ctx);
    } else {
        return ctx.editMessageText('Отмена создания события');
    }

})

export default CreateEventScene
