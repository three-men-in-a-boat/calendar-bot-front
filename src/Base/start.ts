import {Context, Markup, Telegraf} from 'telegraf';
import {default as axios, AxiosError} from 'axios';
import getId from "../utils/getId";
import CustomContext from "../Models/CustomContext";

function GenResp(ctx: CustomContext, name: string) {
    let helloMessage = `Здравствуйте, ${name}! Вы успешно авторизовались в телеграм боте ассистент календаря Mail.ru.` +
        `Теперь вы можете начать пользоваться ботом. Чтобы узнать какие функции доступны в боте - воспользуйтесь ` +
        `командой /help`

    return ctx.reply(helloMessage)

}

export default async function Start(bot: Telegraf<CustomContext>) {
    bot.start(async ctx => {
        if (ctx.startPayload) {
            axios.get(`${process.env['BACKEND_URL']}/oauth/telegram/user/${getId(ctx)}/info`)
                .then(res => {
                    GenResp(ctx, res.data.name);
                })
                .catch((err: AxiosError) => {
                    return ctx.reply(`Start callback with payload fall with error: ${err.message}`);
                })
        } else {
            axios.get(
                `${process.env['BACKEND_URL']}/oauth/telegram/user/${getId(ctx)}/ref`
            )
                .then(resp => {
                    return ctx.reply(
                        'Добрый день, пожалуйста авторизуйтесь для начала работы с календарем',
                        Markup.inlineKeyboard([Markup.button.url('Войти в аккаунт', resp.data)])
                    );
                })
                .catch((err: AxiosError) => {
                    return ctx.reply(`Start callback fall with error: ${err.message}`);
                })
        }
    });
}
