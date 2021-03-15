import {Telegraf} from 'telegraf';
import {config} from 'dotenv';
import Base from './Base/base_index';
import Calendar from './Calendar/calendar_index';

config();

const token = process.env['TELEGRAM_BOT_TOKEN'];

if (!token) {
  console.log('.env file not found');
  throw new Error('Telegram token not found');
}

const bot = new Telegraf(token);

Base(bot);
Calendar(bot);

bot
  .launch()
  .then(() => {
    console.log('Bot started');
  })
  .catch(err => {
    console.log(`There was an error: ${err}`);
  });

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
