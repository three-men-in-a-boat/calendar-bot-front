import {Context, Markup, Telegraf} from 'telegraf';
import {default as axios} from 'axios';
import Meeting from '../Models/Meeting';

export default function Today(bot: Telegraf<Context>) {
  async function todayCallback(ctx: Context) {
    let answerStr = 'Ваши встречи на сегодня\n';

    const resp = await axios.get(
      'https://calendarbot.xyz/api/v1/oauth/telegram/events'
    );
    const meetings: Array<Meeting> = resp.data;

    meetings.forEach((curr, idx) => {
      const pars = curr.participants[0].split(',').join('\n\t\t\t');
      answerStr += `\n\n${idx + 1}) ${curr.name} ${
        curr.time
      } with \n\t\t\t ${pars}`;
    });

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
