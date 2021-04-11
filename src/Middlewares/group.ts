import axios from 'axios';
import CustomContext from "../Models/CustomContext";
import getChatType from "../utils/get_chat_type";

const whitelist = ['/start', '/today', '/next', '/date', '/create', '/find_time'];

export default async function GroupMiddleware(ctx: CustomContext, next: Function) {
    if (ctx.from) {
        if (ctx.message) {
            // Поле text есть - в типах не описано
            if (getChatType(ctx) === 'group') {
                // @ts-ignore
                if (ctx.message.text.includes(process.env['BOT_NAME'])) {// @ts-ignore
                    let parsed_message = ctx.message.text.split('@')
                    if (parsed_message.length === 2 && parsed_message[1] === process.env['BOT_NAME']) {
                        if (whitelist.includes(parsed_message[0])) {
                            return next();
                        } else {
                            return ctx.reply('Эта функция еще не поддерживается в групповом чате.')
                        }
                    }
                //@ts-ignore
                    parsed_message = ctx.message.text.split(' ');
                    if (parsed_message[0] === `@${process.env['BOT_NAME']}`) {
                        // @ts-ignore
                        ctx.message.text = parsed_message.reduce((prev, curr) => {
                            if (curr !== `@${process.env['BOT_NAME']}`){
                                return prev += ` ${curr}`;
                            }
                            return prev;
                        }, '')
                        return next();
                    }
                }
            } else {
                return next();
            }
        } else {
            return next();
        }
    }
}
