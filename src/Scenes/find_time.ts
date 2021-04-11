import {Scenes} from "telegraf";
import CustomContext from "../Models/CustomContext";
import getMessageId from "../utils/get_message_id";
import axios, {AxiosError} from "axios";
import Event from "../Models/Event";
import moment from "moment";

const FindTimeScene = new Scenes.BaseScene<CustomContext>('find_time_scene');

function genChooseDaytimeButtons() {
    return {
        inline_keyboard: [
            [
                {
                    text: 'Утром',
                    callback_data: JSON.stringify({a: 'day_period', p: 'm'})
                },
                {
                    text: 'Днем',
                    callback_data: JSON.stringify({a: 'day_period', p: 'd'})
                }
            ],
            [
                {
                    text: 'Вечером',
                    callback_data: JSON.stringify({a: 'day_period', p: 'e'})
                },
                {
                    text: 'Ночью',
                    callback_data: JSON.stringify({a: 'day_period', p: 'n'})
                }
            ],
            [
                {
                    text: 'Отменить',
                    callback_data: 'find_time_stop'
                }
            ]
        ]
    }
}

function genInitButtons() {
    return {
        inline_keyboard: [
            [{
                text: 'Отменить',
                callback_data: 'find_time_stop'
            }]
        ]
    }
}

function genChooseLongButtons() {
    return {
        inline_keyboard: [
            [
                {
                    text: '30  мин',
                    callback_data: JSON.stringify({a: 'choose_long', p: 0.5})
                },
                {
                    text: '1  час',
                    callback_data: JSON.stringify({a: 'choose_long', p: 1})
                },
                {
                    text: '2  часа',
                    callback_data: JSON.stringify({a: 'choose_long', p: 2})
                },
            ],
            [
                {
                    text: '3  часа',
                    callback_data: JSON.stringify({a: 'choose_long', p: 3})
                },
                {
                    text: '4  часа',
                    callback_data: JSON.stringify({a: 'choose_long', p: 4})
                },
                {
                    text: '6  часов',
                    callback_data: JSON.stringify({a: 'choose_long', p: 6})
                }
            ],
            [
                {
                    text: '8 часов',
                    callback_data: JSON.stringify({a: 'choose_long', p: 8})
                },
                {
                    text: '10 часов',
                    callback_data: JSON.stringify({a: 'choose_long', p: 10})
                },
                {
                    text: '12 часов',
                    callback_data: JSON.stringify({a: 'choose_long', p: 12})
                }
            ],
            [
                {
                    text: 'Отменить',
                    callback_data: 'find_time_stop'
                }
            ]
        ]
    }
}

function genPollButtons() {
    return {
        inline_keyboard: [
            [{
                text: 'Создать',
                callback_data: 'find_time_create'
            }],
            [{
                text: 'Отменить',
                callback_data: 'find_time_stop'
            }]
        ]
    }
}

function genChooseDaytimeText(ctx: CustomContext): string {
    let retStr = '<b>Событие будет '
    moment.locale('ru');
    const from = new Date(ctx.scene.session.find_time.event.from!);
    if (from.getDate() === new Date().getDate()) {
        retStr += 'сегодня'
    } else if (from.getDate() === new Date().getDate() + 1) {
        retStr += 'завтра'
    } else {
        retStr += moment(from.toISOString()).format('D MMMM YYYY')
    }


    if (!ctx.scene.session.find_time.day_period) {
        retStr += '</b>\n';
        retStr += '\nВыберите период дня для выбора'
    } else {
        switch (ctx.scene.session.find_time.day_period) {
            case 'm':
                retStr += ' утром';
                break;
            case 'd':
                retStr += ' днем'
                break;
            case 'e':
                retStr += ' вечером';
                break;
            case 'n':
                retStr += ' ночью'
                break;
        }
        retStr += '</b>\n';
        retStr += '\nВыберите продолжительность события'
    }
    return retStr;
}

function genOptions(ctx: CustomContext) {
    const opts: string[] = [];
    const initTime = new Date(ctx.scene.session.find_time.event.from!);
    switch (ctx.scene.session.find_time.day_period) {
        case 'm':
            initTime.setHours(6,0,0);
            break;
        case 'd':
            initTime.setHours(12,0,0);
            break;
        case 'e':
            initTime.setHours(18,0,0);
            break;
        case 'n':
            initTime.setHours(0,0,0);
    }
    const startTime = new Date(initTime);
    const endTime = new Date(initTime);
    moment.locale('ru');
    let len = 6;
    if (ctx.scene.session.find_time.long >= 6) {
        len = 12;
    }
    if (ctx.scene.session.find_time.long >= 10) {
        len = 16;
    }
    let step = (60*len-ctx.scene.session.find_time.long*60)/6

    endTime.setHours(initTime.getHours(), initTime.getMinutes() + ctx.scene.session.find_time.long*60,0);
    while (endTime.getHours() <= initTime.getHours() + len) {
        opts.push(`с ${moment(startTime.toISOString()).format('LT')} до ${moment(endTime.toISOString()).format('LT')}`);
        startTime.setHours(startTime.getHours(), startTime.getMinutes() + step);
        endTime.setHours(startTime.getHours(), startTime.getMinutes() + ctx.scene.session.find_time.long*60);
    }


    return opts;
}

FindTimeScene.enter(ctx => {
    if (ctx.chat) {
        ctx.scene.session.find_time.cid = ctx.chat.id

        ctx.telegram.sendMessage(
            ctx.scene.session.find_time.cid,
            '<b>Введите дату события</b>\nНапример сегодня или 22 марта',
            {
                parse_mode: 'HTML',
                reply_markup: genInitButtons()
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

FindTimeScene.action('find_time_create', ctx => {
    console.log(ctx)
})

FindTimeScene.on('poll', (ctx) => console.log('Poll update', ctx.poll))
FindTimeScene.on('poll_answer', (ctx) => console.log('Poll answer', ctx.pollAnswer))

FindTimeScene.leave(ctx => {
    if (ctx.scene.session.find_time.founded) {
        return ctx.telegram.editMessageText(ctx.scene.session.find_time.cid,
            ctx.scene.session.find_time.mid,
            undefined,
            'Founded');
    }

    if (ctx.scene.session.find_time.poll_mid !== 0) {
        ctx.deleteMessage(ctx.scene.session.find_time.poll_mid)
    }

    if (ctx.scene.session.find_time.mid !== 0) {
        return ctx.telegram.editMessageText(ctx.scene.session.find_time.cid,
            ctx.scene.session.find_time.mid,
            undefined,
            'Поиск общего времени отменен');
    } else {
        return ctx.reply('Поиск общего времени отменен');
    }

})

FindTimeScene.action(/day_period/, ctx => {
    const data = JSON.parse(ctx.match.input);
    ctx.scene.session.find_time.day_period = data.p;
    ctx.telegram.editMessageText(
        ctx.scene.session.find_time.cid,
        ctx.scene.session.find_time.mid,
        undefined,
        genChooseDaytimeText(ctx),
        {
            parse_mode: 'HTML',
            reply_markup: genChooseLongButtons()
        }
    )
})

FindTimeScene.action(/choose_long/, ctx => {
    const data = JSON.parse(ctx.match.input);
    ctx.scene.session.find_time.long = data.p;
    ctx.deleteMessage()
    ctx.scene.session.find_time.mid = 0;
    ctx.telegram.sendPoll(
        ctx.scene.session.find_time.cid,
        'Выберите удобное для вас время',
        genOptions(ctx),
        {
            reply_markup: genPollButtons(),
            allows_multiple_answers: true,
            is_anonymous: false
        }
    )
        .then(m => {
            ctx.scene.session.find_time.poll_mid = m.message_id
        })
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
                    ctx.telegram.editMessageText(
                        ctx.scene.session.find_time.cid,
                        ctx.scene.session.find_time.mid,
                        undefined,
                        genChooseDaytimeText(ctx),
                        {
                            reply_markup: genChooseDaytimeButtons(),
                            parse_mode: 'HTML'
                        }
                    )
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
