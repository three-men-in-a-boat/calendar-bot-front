import CustomContext from '../Models/CustomContext';
import {Markup, Telegraf} from 'telegraf';
import axios, {AxiosError} from "axios";
import {EventCard} from "../utils/event_card";
import Event from "../Models/Event";
import getId from "../utils/getId";
// @ts-ignore
import Calendar from 'telegraf-calendar-telegram';

export default function SelectedDate(bot: Telegraf<CustomContext>) {

    const calendar = new Calendar(bot,{
        startWeekDay: 1,
        weekDayNames: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
        monthNames: [
            "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
            "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
        ],
        minDate: new Date(new Date().getFullYear(), 0, 1),
        maxDate: new Date(new Date().getFullYear(), 11, 31)
    });

    calendar.setDateListener(async (ctx: CustomContext, date: string) => {
        if ("callback_query" in ctx.update && ctx.update.callback_query.message) {
            await ctx.deleteMessage(ctx.update.callback_query.message.message_id);
        }

        const rfc3339 = new Date(date).toISOString();
        const id = getId(ctx);

        axios.get(`${process.env['BACKEND_URL']}/telegram/user/${id}/events/date/${rfc3339}`)
            .then(async resp => {
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
            })
            .catch((err: AxiosError) => {
                if (err.response?.status === 404) {
                    return ctx.reply('На выбранную дату у вас нет событий');
                }
                return ctx.reply(`Select date fall with err: ${err.message}`)
            })

    })

    bot.command('date', ctx => {

        return ctx.reply('Выберите дату', calendar.getCalendar());
    });

    bot.action('date', ctx => {

    })
}
