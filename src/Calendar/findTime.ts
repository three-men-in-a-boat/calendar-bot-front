import {Telegraf} from "telegraf";
import CustomContext from "../Models/CustomContext";
import getChatType from "../utils/get_chat_type";

async function findTimeCallback(ctx: CustomContext) {
    if (getChatType(ctx) !== 'group') {
        return ctx.reply('Данная функция поддерживается только в групповых чатах');
    }

    return ctx.scene.enter('create_event', {find_time: true});
}

export default function FindTime(bot: Telegraf<CustomContext>) {
    bot.command('find_time', ctx => {
        return findTimeCallback(ctx);
    });

    bot.action('find_time', ctx => {
        return findTimeCallback(ctx);
    });
}
