import {Context, Markup, Telegraf} from 'telegraf';
import {default as axios} from 'axios';
import Event from '../Models/Meeting';
import {callback} from 'telegraf/typings/button';
import {EventCard} from "../utils/event_card";


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

            for (let event of events) {
                await EventCard(ctx, event, 'today');
            }
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



    bot.action('today_upd', ctx => {
        return ctx.editMessageText(
            'События на сегодня'
        )
    });
}
