import CustomContext from '../Models/CustomContext';
import {genDatepicker} from '../utils/date_picker';
import {Markup, Telegraf} from 'telegraf';
import axios from "axios";
import {EventCard} from "../utils/event_card";
import Event from "../Models/Meeting";

export default function SelectedDate(bot: Telegraf<CustomContext>) {
    bot.command('date', ctx => {
        return genDatepicker(ctx, 'selected');
    });

    bot.action(/selected/, async ctx => {
        const data = JSON.parse(ctx.match.input);

        if (ctx.update.callback_query.message) {
            await ctx.deleteMessage(ctx.update.callback_query.message.message_id);
        }

        const rfc3339 = new Date(data.p).toISOString();

        const resp = await axios.get(`${process.env['BACKEND_URL']}/telegram/user/${ctx.update.callback_query.from.id}/events/date/${rfc3339}`)
        const events: Array<Event> = resp.data.data.events;

        if (events.length === 0) {
            return ctx.reply('У вас нет событий в этот день',
                Markup.inlineKeyboard(
                    [Markup.button.callback('Просмотреть ближайшее событие', 'next')]
                )
            )
        } else {
            for (let event of events) {
                await EventCard(ctx, event, `date/${rfc3339}`);
            }
        }

    });
}
