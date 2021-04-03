import {Telegraf} from "telegraf";
import CustomContext from "../Models/CustomContext";

export default function EventHandlers(bot: Telegraf<CustomContext>){
    bot.action('event_user_accept', ctx => {
        ctx.reply('accept');
    })


    bot.action('event_user_decline', ctx => {
        ctx.reply('decline');
    })

}
