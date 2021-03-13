import Today from './today';
import Tomorrow from './tomorrow';
import {Context, Telegraf} from 'telegraf';

export default function Calendar(bot: Telegraf<Context>) {
  Today(bot);
  Tomorrow(bot);
}
