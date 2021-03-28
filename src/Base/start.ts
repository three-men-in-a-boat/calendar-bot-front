import {Context, Markup, Telegraf} from 'telegraf';
import {default as axios, AxiosError} from 'axios';
import getId from "../utils/getId";
import CustomContext from "../Models/CustomContext";

export default async function Start(bot: Telegraf<CustomContext>) {
    bot.start(async ctx => {
        axios.get(
            `${process.env['BACKEND_URL']}/oauth/telegram/user/${getId(ctx)}/ref`
        )
            .then(resp => {
                return ctx.reply(
                    'Добрый день, пожалуйста авторизуйтесь для начала работы с календарем',
                    Markup.inlineKeyboard([Markup.button.url('Войти в аккаунт', resp.data)])
                );
            })
            .catch((err:AxiosError) => {
                return ctx.reply(`Start callback fall with error: ${err.message}`);
            })


    });
}
