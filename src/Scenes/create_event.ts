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
import moment from "moment";
import ParsedEvent from "../Models/ParsedEvent";
import UserInfo from "../Models/UserInfo";
import Attendee from "../Models/Attendee";

const CreateEventScene = new Scenes.BaseScene<CustomContext>('create_event');


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

function getDayText(date: string) {
    let retStr = ''
    moment.locale('ru');
    const from = new Date();
    if (from.getDate() === new Date(date).getDate()) {
        retStr += 'сегодня'
    } else if (from.getDate() === new Date().getDate() + 1) {
        retStr += 'завтра'
    } else {
        retStr += moment(date).format('D MMMM YYYY')
    }

    return retStr;
}

function genChooseDaytimeText(ctx: CustomContext): string {
    let retStr = '<b>Событие будет '

    retStr += getDayText(ctx.scene.session.find_time.event.from!)

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
            initTime.setHours(6, 0, 0);
            break;
        case 'd':
            initTime.setHours(12, 0, 0);
            break;
        case 'e':
            initTime.setHours(18, 0, 0);
            break;
        case 'n':
            initTime.setHours(0, 0, 0);
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
    let step = (60 * len - ctx.scene.session.find_time.long * 60) / 6

    endTime.setHours(initTime.getHours(), initTime.getMinutes() + ctx.scene.session.find_time.long * 60, 0);
    while (endTime.getHours() <= initTime.getHours() + len) {
        opts.push(`с ${moment(startTime.toISOString()).format('LT')} до ${moment(endTime.toISOString()).format('LT')}`);
        startTime.setHours(startTime.getHours(), startTime.getMinutes() + step);
        endTime.setHours(startTime.getHours(), startTime.getMinutes() + ctx.scene.session.find_time.long * 60);
    }


    return opts;
}

function genInlineKeyboard(ctx: CustomContext) {
    const inline_keyboard = [];

    const curr = ctx.scene.session.create_event.curr;

    if (curr === 'INIT') {
        inline_keyboard.push([{
            text: 'Отменить',
            callback_data: 'create_event_stop'
        }])

        return {inline_keyboard};
    }

    if (curr === 'TO') {
        inline_keyboard.push([
            {
                text: 'Весь день',
                callback_data: 'create_event_fullday'
            }
        ])
        inline_keyboard.push([
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
        ]);
        inline_keyboard.push(
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
            ]);
        inline_keyboard.push([{
            text: 'Отменить',
            callback_data: 'create_event_stop'
        }])

        return {inline_keyboard}
    }

    inline_keyboard.push([{
        text: 'Создать событие',
        callback_data: 'create_event_create'
    }])

    if (curr !== 'TITLE') {
        if (ctx.scene.session.create_event.event.title === 'Без названия') {
            inline_keyboard.push([{
                text: 'Добавить название',
                callback_data: 'create_event_title_add'
            }])
        } else {
            inline_keyboard.push([{
                text: 'Изменить название',
                callback_data: 'create_event_title_add'
            }])
        }
    }
    if (curr !== 'DESC') {
        if (ctx.scene.session.create_event.event.description) {
            inline_keyboard.push([{
                text: 'Изменить описание',
                callback_data: 'create_event_desc_add'
            }])
        } else {
            inline_keyboard.push([{
                text: 'Добавить описание',
                callback_data: 'create_event_desc_add'
            }])
        }
    }
    if (curr !== 'USERS') {
        inline_keyboard.push([{
            text: 'Добавить пользователей',
            callback_data: 'create_event_users_add'
        }])
    }

    inline_keyboard.push([{
        text: 'Отменить',
        callback_data: 'create_event_stop'
    }])

    return {inline_keyboard}
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
            retStr += `\n<b>Выберите продолжительность события или введите время окончания события</b>`;
            break;
        case 'TITLE':
            retStr += `\n<b>Введите название события</b>`;
            break;
        case 'DESC':
            retStr += `\n<b>Введите описание события</b>`;
            break;
        case 'USERS':
            retStr += `\n<b>Введите почту пользователя, которого хотите добавить</b>`;
            break;

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

CreateEventScene.enter(async ctx => {
    //@ts-ignore
    if (ctx.scene.state.find_time) {
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
    }
    if (ctx.chat) {
        ctx.scene.session.create_event.cid = ctx.chat.id;
        const m = await ctx.reply(
            genMessageText(ctx),
            {
                parse_mode: 'HTML',
                reply_markup: genInlineKeyboard(ctx)
            }
        )

        if (ctx.scene.session.create_event) {
            ctx.scene.session.create_event.mid = m.message_id
        }
        return;
    } else {
        return ctx.reply('CreateEventScene error: Can\'t find chat id')
    }
})

CreateEventScene.action('create_event_stop', ctx => {
    return ctx.scene.leave();
})


CreateEventScene.on('text', async ctx => {
    // @ts-ignore
    if (ctx.scene.state.find_time) {
        if (!ctx.scene.session.find_time.event.from) {
            axios.put(`${process.env['BACKEND_URL']}/parse/date`,
                {
                    timezone: "Europe/Moscow",
                    text: ctx.message.text
                })
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
    } else {
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
                    {
                        timezone: "Europe/Moscow",
                        text: ctx.message.text
                    })
                    .then(async resp => {
                        let event = ctx.scene.session.create_event.event;
                        event.title = 'Без названия';
                        if (resp.data.date) {
                            event.from = new Date(resp.data.date).toISOString();
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
                break;
            case 'TITLE':
                ctx.scene.session.create_event.event.title = ctx.message.text;
                return genReply(ctx)
            case 'TO':
                axios.put(`${process.env['BACKEND_URL']}/parse/date`,
                    {
                        timezone: "Europe/Moscow",
                        text: ctx.message.text
                    })
                    .then(async resp => {
                        let event = ctx.scene.session.create_event.event;
                        if (resp.data.date) {
                            event.to = new Date(resp.data.date).toISOString();
                        } else {
                            return sendError(ctx, 'Дата не распознана, попробуйте еще раз');
                        }
                        ctx.scene.session.create_event.curr = 'TITLE';
                        if (ctx.scene.session.create_event.error_message_id !== 0) {
                            ctx.telegram.deleteMessage(ctx.scene.session.create_event.cid,
                                ctx.scene.session.create_event.error_message_id);
                            ctx.scene.session.create_event.error_message_id = 0;
                        }
                        return genReply(ctx)
                    })

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
        .then(async resp => {
            ctx.scene.session.create_event.created = true;

            const resp_info = await axios.get(`${process.env['BACKEND_URL']}/oauth/telegram/user/${getId(ctx)}/info`)

            const userInfo = resp_info.data as UserInfo;
            const organizer: Attendee = {
                role: 'REQUIRED',
                email: userInfo.email,
                name: userInfo.name,
                status: 'ACCEPTED'
            }
            ctx.scene.session.create_event.event.organizer = organizer;
            ctx.scene.session.create_event.event.attendees.push(organizer);
            ctx.scene.session.create_event.event.user_tg_id = getId(ctx);

            const redis_data = {
                event_data: ctx.scene.session.create_event.event,
                resp_data: JSON.parse(resp.data)
            };
            ctx.scene.session.redis_client.set(id.slice(0, 20), JSON.stringify(redis_data));
            return ctx.scene.leave();
        })
        .catch(async (err: AxiosError) => {
            await ctx.reply(`Can't create event - err: ${err.message}`);
            return ctx.scene.leave();
        })


})

CreateEventScene.action('create_event_fullday', ctx => {
    ctx.scene.session.create_event.event.fullDay = true;
    let date_from = new Date(ctx.scene.session.create_event.event.from!);
    ctx.scene.session.create_event.event.to = new Date(date_from.setDate(date_from.getDate() + 1)).toISOString()
    ctx.scene.session.create_event.curr = 'TITLE';
    return genReply(ctx);
})

CreateEventScene.action('create_event_users_add', ctx => {
    ctx.scene.session.create_event.curr = 'USERS';
    return genReply(ctx);
})

CreateEventScene.action('create_event_title_add', ctx => {
    ctx.scene.session.create_event.curr = 'TITLE';
    return genReply(ctx);
})

CreateEventScene.action('create_event_desc_add', ctx => {
    ctx.scene.session.create_event.curr = 'DESC';
    return genReply(ctx);
})

CreateEventScene.action('find_time_stop', ctx => {
    if (ctx.scene.session.find_time.error_message_id !== 0) {
        ctx.deleteMessage(ctx.scene.session.find_time.error_message_id);
        ctx.scene.session.find_time.error_message_id = 0;
    }
    return ctx.scene.leave();
})

CreateEventScene.action('find_time_create', ctx => {

    let text = '';
    let count = -1;
    //@ts-ignore
    ctx.update.callback_query.message!.poll.options.forEach(curr => {
        if (curr.voter_count > count) {
            count = curr.voter_count;
            text = curr.text
        }
    })
    const text_in = `${getDayText(ctx.scene.session.find_time.event.from!)} в${text.slice(1)}`

    axios.put(`${process.env['BACKEND_URL']}/parse/event`,
        {
            timezone: "Europe/Moscow",
            text: text_in
        })
        .then(async res => {
            const info = res.data as ParsedEvent;
            ctx.scene.session.find_time.event.from = new Date(info.event_start!).toISOString()
            ctx.scene.session.find_time.event.to = new Date(info.event_end!).toISOString()
            ctx.scene.session.find_time.founded = true;
            ctx.stopPoll(ctx.update.callback_query.message!.message_id);
            ctx.scene.session.create_event.event = ctx.scene.session.find_time.event;
            ctx.scene.session.create_event.event.title = 'Без названия';
            ctx.scene.session.create_event.curr = 'TITLE';
            ctx.scene.session.create_event.cid = ctx.scene.session.find_time.cid;
            // @ts-ignore
            ctx.scene.state.find_time = false;
            const m = await ctx.reply(
                genMessageText(ctx),
                {
                    parse_mode: 'HTML',
                    reply_markup: genInlineKeyboard(ctx)
                }
            )

            if (ctx.scene.session.create_event) {
                ctx.scene.session.create_event.mid = m.message_id
            }
            return;

        })
})

CreateEventScene.action(/day_period/, ctx => {
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

CreateEventScene.action(/choose_long/, ctx => {
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

CreateEventScene.leave(ctx => {
    // @ts-ignore
    if (ctx.scene.state.find_time) {
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
    } else {
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
    }
})

CreateEventScene.on('message', async ctx => {
    // @ts-ignore
    if (ctx.scene.state.find_time) {
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
    } else {
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
    }
})

export default CreateEventScene
