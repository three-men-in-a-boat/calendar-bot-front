import {session, Telegraf} from 'telegraf';
import CustomContext from './Models/CustomContext';
import {config} from 'dotenv';
import Base from './Base/base_index';
import AuthMiddleware from './Middlewares/auth';
import {EventCardHandler} from "./utils/event_card";
import Calendar from "./Calendar/calendar_index";
import InitMiddleware from "./Middlewares/init";
import stage from "./Scenes/scenes_index";
import GroupMiddleware from "./Middlewares/group";

config();

const token = process.env['TELEGRAM_BOT_TOKEN'];

if (!token) {
  console.log('.env file not found');
  throw new Error('Telegram token not found');
}

const bot = new Telegraf<CustomContext>(token);

bot.use(session());
bot.use(stage.middleware());
bot.use(InitMiddleware);
bot.use(AuthMiddleware);
bot.use(GroupMiddleware)


Base(bot);
Calendar(bot)
EventCardHandler(bot);

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
