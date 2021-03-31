import {Context, Markup, Telegraf} from 'telegraf';
import {AxiosError, default as axios} from 'axios';
import Event from '../Models/Event';
import {EventCard} from "../utils/event_card";
import getId from "../utils/getId";
import CustomContext from "../Models/CustomContext";

async function todayCallback(ctx: CustomContext) {
    axios.get(`${process.env['BACKEND_URL']}/telegram/user/${getId(ctx)}/events/today`)
        .then(async resp => {
            const events: Array<Event> = resp.data.data.events;

            for (let event of events) {
                await EventCard(ctx, event, 'today');
            }
        })
        .catch((err:AxiosError) => {
            if (err.response?.status === 404) {
                return ctx.reply('У вас больше нет событий на сегодня');
            }
            return ctx.reply(`${err.message}`)
        })

}

export default function Today(bot: Telegraf<CustomContext>) {
    bot.command('today', ctx => {
        return todayCallback(ctx);
    });

    bot.action('today', ctx => {
        return todayCallback(ctx);
    });
}
