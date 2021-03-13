import Help from './help';
import Start from './start';
import {Context, Telegraf} from 'telegraf';

export default function Base(bot: Telegraf<Context>) {
  Start(bot);
  Help(bot);
}
