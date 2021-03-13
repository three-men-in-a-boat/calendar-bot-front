import {Context, Markup, Telegraf} from 'telegraf';
import {default as axios} from 'axios'

export default async function Start(bot: Telegraf<Context>) {
    bot.start(async ctx => {

        const userTelegramId: number = ctx.message!.from.id;
        const resp = await axios.get(`https://calendarbot.xyz/api/v1/oauth/telegram/${userTelegramId}/ref`);
        const userUrl = resp.data

        return ctx.reply(
            'Добрый день, пожалуйста авторизуйтесь для начала работы с календарем',
            Markup.inlineKeyboard([
                Markup.button.url(
                    'Войти в аккаунт',
                    userUrl
                ),
            ])
        );
    });
}
