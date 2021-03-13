import {Context, Telegraf} from 'telegraf';
import {default as axios} from "axios";

export default function Tomorrow(bot: Telegraf<Context>) {
  async function tomorrowCallback(ctx: Context) {
    let answerStr = 'Ваши встречи на завтра';

    const resp = await axios.get('https://calendarbot.xyz/api/v1/oauth/telegram/events')
    const meetings: Array<Object> = resp.data


    meetings.forEach((curr, idx) => {
      // @ts-ignore
      let pars = curr.participants[0].split(',').join('\n\t\t\t')
      // @ts-ignore
      answerStr += `\n\n${idx + 1}) ${curr.name} ${curr.time} with \n\t\t\t ${pars}`
    })

    return ctx.reply(answerStr);
  }

  bot.action('tomorrow', ctx => {
    return tomorrowCallback(ctx);
  });

  bot.command('tomorrow', ctx => {
    return tomorrowCallback(ctx);
  });
}
