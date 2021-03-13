import {Context, Markup, Telegraf} from 'telegraf';

export default function Today(bot: Telegraf<Context>) {
  bot.command('today', ctx => {
    const answerStr = 'Ваши встречи на сегодня';

    ctx.reply(
      answerStr,
      Markup.inlineKeyboard([
        Markup.button.callback('События на завтра', 'tomorrow'),
      ])
    );
  });
}
