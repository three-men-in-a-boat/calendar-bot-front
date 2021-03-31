import {Scenes} from 'telegraf';
import CustomContext from "../Models/CustomContext";
import CreateEvent from "../Models/CreateEvent";
import moment from "moment";
import axios, {AxiosError} from "axios";
import getId from "../utils/getId";

const CreateEventScene = new Scenes.BaseScene<CustomContext>('create_event');

function genMessageText(event: CreateEvent): string {
    let retStr = 'Входим в режим создания события\nЧтобы прекратить создание события - ' +
        'нажмите на кнопку <i>Отменить.</i>\n\n'

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
                retStr += "\n\n<b>Введите дату и время окончания события в формате ДД.ММ.ГГГГ ЧЧ.ММ</b> (23.03.2021 18:00)"
            }
        } else {
            retStr += "\n\n<b>Введите дату и время начала события в формате ДД.ММ.ГГГГ ЧЧ.ММ</b> (23.03.2021 18:00)"
        }
    }

    return retStr
}

function genInlineKeyboard(event: CreateEvent) {
    if (event.title && event.from && event.to) {
        return [
            [
                {
                    text: 'Создать событие',
                    callback_data: 'create_event_create'
                }
            ],
            [
                {
                    text: 'Отменить',
                    callback_data: 'create_event_stop'
                }
            ]
        ]
    }
    return [
        [{
            text: 'Отменить',
            callback_data: 'create_event_stop'
        }]
    ]
}

CreateEventScene.enter(ctx => {
    if (ctx.chat) {
        ctx.scene.session.create_event.cid = ctx.chat.id
        ctx.telegram.sendMessage(
            ctx.scene.session.create_event.cid,
            genMessageText(ctx.scene.session.create_event.event),
            {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: genInlineKeyboard(ctx.scene.session.create_event.event)
                }
            }
        ).then(m => {
            ctx.scene.session.create_event.mid = m.message_id;
        })
        return;
    } else {
        return ctx.reply("Can't create chat")
    }
})

CreateEventScene.action('create_event_stop', ctx => {
    return ctx.scene.leave();
})

async function sendDateError(ctx: CustomContext) {
    if (ctx.scene.session.create_event.error_message_id !== 0) {
        await ctx.telegram.deleteMessage(ctx.scene.session.create_event.cid,
            ctx.scene.session.create_event.error_message_id)
    }
    ctx.telegram.sendMessage(
        ctx.scene.session.create_event.cid,
        'Введите дату по фомат ДД.ММ.ГГГГ ЧЧ.ММ (21.03.2021 18:00)')
        .then(m => {
            ctx.scene.session.create_event.error_message_id = m.message_id;
        })
}

async function parseDate(ctx:CustomContext, message: string): Promise<Date|undefined> {
    let parsed_date = message.split(' ');
    if (parsed_date.length !== 2) {
        await sendDateError(ctx);
        return undefined;
    }
    let parsed_buf = parsed_date[0].split('.');
    if (parsed_buf.length !== 3){
        await sendDateError(ctx);
        return undefined;
    }
    const buf = parsed_buf[0];
    parsed_buf[0] = parsed_buf[2];
    parsed_buf[2] = buf;
    parsed_date[0] = parsed_buf.join('.');
    const date = new Date(parsed_date.join(' '));
    if (date) {
        if (ctx.scene.session.create_event.error_message_id !== 0) {
            await ctx.telegram.deleteMessage(ctx.scene.session.create_event.cid,
                ctx.scene.session.create_event.error_message_id)
        }
        return date
    } else {
        await sendDateError(ctx);
        return undefined;
    }
}

CreateEventScene.on('text', async ctx => {


    switch (ctx.scene.session.create_event.curr_step) {
        case 'TITLE':
            ctx.scene.session.create_event.event.title = ctx.message.text;
            ctx.scene.session.create_event.curr_step = 'FROM'
            return ctx.telegram.editMessageText(
                ctx.scene.session.create_event.cid,
                ctx.scene.session.create_event.mid,
                undefined,
                genMessageText(ctx.scene.session.create_event.event), {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: genInlineKeyboard(ctx.scene.session.create_event.event)
                    }
                })

        case 'FROM':
            const date_from:Date|undefined = await parseDate(ctx, ctx.message.text)
            if (date_from) {
                ctx.scene.session.create_event.event.from = date_from.toISOString();
                ctx.scene.session.create_event.curr_step = 'TO';
                return ctx.telegram.editMessageText(
                    ctx.scene.session.create_event.cid,
                    ctx.scene.session.create_event.mid,
                    undefined,
                    genMessageText(ctx.scene.session.create_event.event), {
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: genInlineKeyboard(ctx.scene.session.create_event.event)
                        }
                    })
            }
            break;

        case 'TO':
            const date_to:Date|undefined = await parseDate(ctx, ctx.message.text)
            if (date_to) {
                ctx.scene.session.create_event.event.to = date_to.toISOString();
                ctx.scene.session.create_event.curr_step = 'DESC';
                return ctx.telegram.editMessageText(
                    ctx.scene.session.create_event.cid,
                    ctx.scene.session.create_event.mid,
                    undefined,
                    genMessageText(ctx.scene.session.create_event.event), {
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: genInlineKeyboard(ctx.scene.session.create_event.event)
                        }
                    })
            }
            break;
        case 'DESC':
            ctx.scene.session.create_event.event.description = ctx.message.text;
            return ctx.telegram.editMessageText(
                ctx.scene.session.create_event.cid,
                ctx.scene.session.create_event.mid,
                undefined,
                genMessageText(ctx.scene.session.create_event.event), {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: genInlineKeyboard(ctx.scene.session.create_event.event)
                    }
                })
    }
})

CreateEventScene.on('message', ctx => {
    //TODO handle non text messages
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
        .catch(async (err:AxiosError) => {
            await ctx.reply(`Can't create event - err: ${err.message}`);
            return ctx.scene.leave();
        })


})

CreateEventScene.leave(ctx => {
    if (!ctx.scene.session.create_event.created) {
        return ctx.editMessageText('Отмена создания события');
    } else {
        return ctx.editMessageText('Событие успешно создано');
    }
})

export default CreateEventScene;
