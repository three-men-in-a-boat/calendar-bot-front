import {Context, Telegraf} from "telegraf";
import CustomContext from "../Models/CustomContext";
import {default as axios} from "axios";
import Event from "../Models/Meeting";
import {EventCard} from "../utils/event_card";

async function NextCallback(ctx: CustomContext) {
    let resp = null;
    let err = null;
    try {
        if (ctx.message) {
            resp = await axios.get(
                `${process.env['BACKEND_URL']}/telegram/user/${ctx.message!.from.id}/events/closest`
            );
        } else {
            if ("callback_query" in ctx.update) {
                resp = await axios.get(
                    `${process.env['BACKEND_URL']}/telegram/user/${ctx.update.callback_query.from.id}/events/closest`
                );
            }
        }
    } catch (e) {
        err = e;
    }

    if (resp) {

        if (resp.status !== 200) {
            return ctx.reply('Что-то пошло не так, попробуйте повторно авторизоваться с помощью команды /start')
        }

        const event: Event = resp.data;

        return EventCard(ctx, event, 'closest');
    } else {
        return ctx.reply(`${err}`)
    }
}

export default function Next(bot: Telegraf<Context>) {

    bot.command('next', ctx => {
        return NextCallback(ctx);
    });

    bot.action('next', ctx => {
        return NextCallback(ctx);
    });
}
