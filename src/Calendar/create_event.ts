import {Telegraf} from "telegraf";
import CustomContext from "../Models/CustomContext";
// @ts-ignore
import Calendar from 'telegraf-calendar-telegram';
import getChatType from "../utils/get_chat_type";

export default function CreateEvent(bot: Telegraf<CustomContext>) {

    bot.command('create', ctx => {
        return ctx.scene.enter('create_event');
    })

    bot.action('create', ctx =>{
        return ctx.scene.enter('create_event');
    })

}
