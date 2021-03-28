import Help from './help';
import Start from './start';
import About from './about';
import {Context, Telegraf} from 'telegraf';
import Stop from "./stop";

export default function Base(bot: Telegraf<Context>) {
  Start(bot);
  Help(bot);
  About(bot);
  Stop(bot);
}
