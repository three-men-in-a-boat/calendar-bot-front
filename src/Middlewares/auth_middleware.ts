import axios from 'axios';
import {Context} from 'telegraf';

const whitelist = ['/start'];

export default async function AuthMiddleware(ctx: Context, next: Function) {
    if (ctx.from && ctx.message) {
        if (ctx.message) {
            // Поле text есть - в типах не описано

            // @ts-ignore
            if (whitelist.includes(ctx.message.text)) {
                return next();
            }
        }
        const res = await axios.get(`${process.env['BACKEND_URL']}/oauth/telegram/user/${ctx.from.id}/is_auth`);
        if (res.status !== 200) {
            return ctx.reply(
                'К сожалению вы не авторизованы. Войдите в систему с помощью команды ' +
                '/start'
            );
        }
    }

    return next();
}
