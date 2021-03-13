import Help from './help';
import Start from './start';
import About from "./about";
import {Context, Telegraf} from 'telegraf';

export default function Base(bot: Telegraf<Context>) {
  Start(bot);
  Help(bot);
  About(bot)
}
