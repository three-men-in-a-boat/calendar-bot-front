import axios from 'axios';
import CustomContext from "../Models/CustomContext";
import getChatType from "../utils/get_chat_type";

const whitelist = ['/start', '/today', '/next', '/date', '/create'];

export default async function GroupMiddleware(ctx: CustomContext, next: Function) {
    if (ctx.from) {
        if (ctx.message) {
            // Поле text есть - в типах не описано
            if (getChatType(ctx) === 'group') {
                // @ts-ignore
                const parsed_message = ctx.message.text.split('@')
                if (parsed_message.length === 2 && parsed_message[1] === process.env['BOT_NAME']) {
                    if (whitelist.includes(parsed_message[0])) {
                        return next();
                    } else {
                        return ctx.reply('Эта функция еще не поддерживается в групповом чате.')
                    }
                }

            }
        }
    }
    return next();
}
