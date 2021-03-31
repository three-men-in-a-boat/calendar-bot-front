import axios from 'axios';
import CustomContext from "../Models/CustomContext";
import getChatType from "../utils/get_chat_type";

const whitelist = ['/today','/start','/start@three_man_in_a_boat_front_bot', '/today@three_man_in_a_boat_front_bot'];

export default async function GroupMiddleware(ctx: CustomContext, next: Function) {
    if (ctx.from) {
        if (ctx.message) {
            // Поле text есть - в типах не описано
            if (getChatType(ctx) === 'group') {
                // @ts-ignore
                if (whitelist.includes(ctx.message.text)) {
                    return next();
                }
                return ctx.reply('Эта функция еще не поддерживается в групповом чате.')
            }
        }
    }
    return next();
}
