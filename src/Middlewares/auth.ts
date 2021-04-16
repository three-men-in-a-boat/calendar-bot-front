import axios from 'axios';
import CustomContext from "../Models/CustomContext";
import getChatType from "../utils/get_chat_type";

const whitelist = ['/start'];

export default async function AuthMiddleware(ctx: CustomContext, next: Function) {
    if (!ctx.scene) {
        return next();
    }

    if (ctx.from) {
        if (ctx.message) {
            // Поле text есть - в типах не описано

            // @ts-ignore
            if (whitelist.includes(ctx.message.text)) {
                return next();
            }
        }
        axios.get(`${process.env['BACKEND_URL']}/oauth/telegram/user/${ctx.from.id}/is_auth`)
            .then(res => {
                return next();
            })
            .catch(err => {
                if (getChatType(ctx) === 'group') {
                    // @ts-ignore
                    if (ctx.message.text && ctx.message.text.includes(process.env['BOT_NAME'])) {
                        return ctx.reply(
                            'К сожалению вы не авторизованы. Войдите в систему в личном чате с ботом.'
                        );
                    }
                } else {
                    return ctx.reply(
                        'К сожалению вы не авторизованы. Войдите в систему с помощью команды ' +
                        '/start'
                    );
                }
            })
    } else {
        return ctx.reply('Auth middleware error: ctx.from is undefined');
    }
}
