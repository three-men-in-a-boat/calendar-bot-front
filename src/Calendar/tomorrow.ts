import {Context, Telegraf} from 'telegraf';

export default function Tomorrow(bot: Telegraf<Context>) {
  async function tomorrowCallback(ctx: Context) {
    const answerStr = 'Ваши встречи на завтра';

    return ctx.reply(answerStr);
  }

  bot.action('tomorrow', ctx => {
    return tomorrowCallback(ctx);
  });

  bot.command('tomorrow', ctx => {
    return tomorrowCallback(ctx);
  });
}
