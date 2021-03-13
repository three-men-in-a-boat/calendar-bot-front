import {Context, Markup, Telegraf} from 'telegraf';

export default function Today(bot: Telegraf<Context>) {
    function todayCallback(ctx: Context) {
        const answerStr = 'Ваши встречи на сегодня';

        return ctx.reply(
            answerStr,
            Markup.inlineKeyboard([
                Markup.button.callback('События на завтра', 'tomorrow'),
            ])
        );
    }

    bot.command('today', ctx => {
        return todayCallback(ctx);
    });

    bot.action('today', ctx => {
        return todayCallback(ctx);
    });
}
