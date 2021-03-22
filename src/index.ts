import {session, Telegraf} from 'telegraf';
import CustomContext from "./Models/ISession";
import {config} from 'dotenv';
import Base from './Base/base_index';
import Calendar from './Calendar/calendar_index';
import AuthMiddleware from "./Middlewares/auth_middleware";
import {DatePicker} from "./utils/date_picker";

config();

const token = process.env['TELEGRAM_BOT_TOKEN'];

if (!token) {
  console.log('.env file not found');
  throw new Error('Telegram token not found');
}



const bot = new Telegraf<CustomContext>(token);

bot.use(session());
// bot.use(AuthMiddleware);

Base(bot);
Calendar(bot);
DatePicker(bot);

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
