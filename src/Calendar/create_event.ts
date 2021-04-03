import {Telegraf} from "telegraf";
import CustomContext from "../Models/CustomContext";
// @ts-ignore
import Calendar from 'telegraf-calendar-telegram';
import getChatType from "../utils/get_chat_type";


function CreateEventHandler(ctx: CustomContext) {
    return ctx.scene.enter('create_event');
}


export default function CreateEvent(bot: Telegraf<CustomContext>) {

    bot.command('create', ctx => {
        CreateEventHandler(ctx);
    })

    bot.action('create', ctx => {
        CreateEventHandler(ctx);
    })

}
