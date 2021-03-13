import {Context, Telegraf} from 'telegraf';

export default function Help(bot: Telegraf<Context>) {
  bot.help(ctx => {
    ctx.reply('Send me a sticker');
  });
}
