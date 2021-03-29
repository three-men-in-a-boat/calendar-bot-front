import {Context, Telegraf} from "telegraf";
import CustomContext from "../Models/CustomContext";
import {AxiosError, default as axios} from "axios";
import Event from "../Models/Meeting";
import {EventCard} from "../utils/event_card";
import getId from "../utils/getId";

function NextCallback(ctx: CustomContext) {
    axios.get(`${process.env['BACKEND_URL']}/telegram/user/${getId(ctx)}/events/closest`)
        .then(resp => {
            return EventCard(ctx, resp.data as Event, 'closest');
        })
        .catch((err:AxiosError) => {
            if (err.response?.status === 404) {
                return ctx.reply('У вас нет больше событий на сегодня');
            }
            return ctx.reply(`Next callback fall with error: ${err.message}`);
        })
}

export default function Next(bot: Telegraf<Context>) {

    bot.command('next', ctx => {
        return NextCallback(ctx);
    });

    bot.action('next', ctx => {
        return NextCallback(ctx);
    });
}
