import {Scenes} from "telegraf";
import CustomContext from "../Models/CustomContext";
import getMessageId from "../utils/get_message_id";
import axios, {AxiosError} from "axios";

const FindTimeScene = new Scenes.BaseScene<CustomContext>('find_time_scene');

function genButtons() {
    return {
        inline_keyboard: [
            [{
                text: 'Отменить',
                callback_data: 'find_time_stop'
            }]
        ]
    }
}

FindTimeScene.enter(ctx => {
    if (ctx.chat) {
        ctx.scene.session.find_time.cid = ctx.chat.id

        ctx.telegram.sendMessage(
            ctx.scene.session.find_time.cid,
            '<b>Введите дату события</b>\nНапример сегодня или 22 марта',
            {
                parse_mode: 'HTML',
                reply_markup: genButtons()
            }
        ).then(m => {
            ctx.scene.session.find_time.mid = m.message_id;
        })

        return;
    } else {
        return ctx.reply('CreateEventScene error: Can\'t find chat id')
    }
})

FindTimeScene.action('find_time_stop', ctx => {
    if (ctx.scene.session.find_time.error_message_id !== 0) {
        ctx.deleteMessage(ctx.scene.session.find_time.error_message_id);
        ctx.scene.session.find_time.error_message_id = 0;
    }
    return ctx.scene.leave();
})


FindTimeScene.leave(ctx => {
    if (ctx.scene.session.find_time.founded) {
        return ctx.telegram.editMessageText(ctx.scene.session.find_time.cid,
            ctx.scene.session.find_time.mid,
            undefined,
            'Founded');
    }
    return ctx.telegram.editMessageText(ctx.scene.session.find_time.cid,
        ctx.scene.session.find_time.mid,
        undefined,
        'Поиск общего времени отменен');
})


FindTimeScene.on('text', ctx => {
    if (!ctx.scene.session.find_time.event.from) {
        axios.put(`${process.env['BACKEND_URL']}/parse/date`,
            {text: ctx.message.text})
            .then(resp => {
                if (!resp.data.date) {
                    if (ctx.scene.session.find_time.error_message_id !== 0) {
                        ctx.deleteMessage(ctx.scene.session.find_time.error_message_id);
                    }
                    ctx.telegram.sendMessage(
                        ctx.scene.session.find_time.cid,
                        "Мы не смогли распознать время, попробуйте еще раз или отмените поиск общего времени",
                        {
                            reply_markup: {
                                inline_keyboard: [
                                    [{
                                        text: 'Отменить поиск',
                                        callback_data: 'find_time_stop'
                                    }]
                                ]
                            }
                        }
                    ).then(m => {
                        ctx.scene.session.find_time.error_message_id = m.message_id
                    })
                } else {
                    ctx.scene.session.find_time.event.from = new Date(resp.data.date).toISOString();
                    ctx.reply(resp.data.date)
                }
            })
            .catch((err: AxiosError) => {
                ctx.reply(`Inner error find time: ${err.message}`)
            })
    }
})

FindTimeScene.on('message', async ctx => {
    ctx.telegram.sendMessage(
        ctx.scene.session.find_time.cid,
        "Отменить поиск общего времени?",
        {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: 'Да',
                        callback_data: 'find_time_stop'
                    }]
                ]
            }
        }
    )
        .then(m => {
            ctx.scene.session.find_time.error_message_id = m.message_id
        })
})


export default FindTimeScene;
