import {Context, Markup, Telegraf} from 'telegraf';
import {default as axios} from 'axios';
import Event from '../Models/Meeting';
import {callback} from 'telegraf/typings/button';

function renderKeyboard(events: Array<Event>) {
    return Markup.inlineKeyboard(
        events.map((meet, idx) => {
            let from = new Date();
            let to = new Date();
            if (!meet.fullDay) {
                from = new Date(meet.from!);
                to = new Date(meet.to!)
            }
            return [
                Markup.button.callback(
                    `${meet.title}
            ${
                        meet.fullDay
                            ? 'весь день'
                            : `${from.toLocaleTimeString('ru', {hour: 'numeric', minute: 'numeric'})} - ` +
                            `${to.toLocaleTimeString('ru', {hour: 'numeric', minute: 'numeric'})}`
                    }`,
                    JSON.stringify({a: 'show_full', p: idx})
                ),
            ];
        })
    )
}

export default function Today(bot: Telegraf<Context>) {
    async function todayCallback(ctx: Context) {
        let resp = null;
        let err = null;
        try {
            resp = await axios.get(
                `${process.env['BACKEND_URL']}/telegram/user/${ctx.message!.from.id}/events/today`
            );
        } catch (e) {
            err = e;
        }

        if (resp) {

            if (resp.status !== 200) {
                return ctx.reply('Что-то пошло не так, попробуйте повторно авторизоваться с помощью команды /start')
            }

            const events: Array<Event> = resp.data.data.events;


            return ctx.reply(
                'События на сегодня',
                renderKeyboard(events)
            );
        } else {
            return ctx.reply(`${err}`)
        }
    }

    bot.command('today', ctx => {
        return todayCallback(ctx);
    });

    bot.action('today', ctx => {
        return todayCallback(ctx);
    });

    bot.action(/show_full/, ctx => {
        const info = JSON.parse(ctx.match.input);

        ctx.editMessageText(
            'm.name',
            Markup.inlineKeyboard([Markup.button.callback('Назад', 'today_upd')])
        );
    });

    bot.action('today_upd', ctx => {
        return ctx.editMessageText(
            'События на сегодня'
        )
    });
}
