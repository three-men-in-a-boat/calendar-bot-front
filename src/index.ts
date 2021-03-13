import {Telegraf} from 'telegraf';
import {config} from 'dotenv';

config();

const token = process.env['TELEGRAM_BOT_TOKEN'];

if (!token) {
  console.log('.env file not found');
  throw new Error('Telegram token not found');
}

const bot = new Telegraf(token);
bot.start(ctx => ctx.reply('Welcome'));
bot.help(ctx => {
  ctx.reply('Send me a sticker');
});
bot.on('sticker', ctx => ctx.reply('👍'));
bot.hears('hi', ctx => ctx.reply('Hey there'));
bot
  .launch()
  .then(() => {
    console.log('Bot started');
  })
  .catch(err => {
    console.log(`There was an error: ${err}`);
  });

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
