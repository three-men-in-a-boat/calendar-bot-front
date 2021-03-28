import {Context, Markup, Telegraf} from 'telegraf';

export default function Help(bot: Telegraf<Context>) {
    bot.help(ctx => {
        ctx.reply(
            'Это бот для работы с календарем. Сейчас доступны следующие команды',
            Markup.inlineKeyboard([
                [
                    Markup.button.callback('События на сегодня', 'today'),
                    Markup.button.callback('Следующее событие', 'next'),
                ],
                [
                    Markup.button.callback('Событие за определенную дату', 'date')
                ]
            ])
        );
    });
}
