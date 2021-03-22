import Today from './today';
import Tomorrow from './tomorrow';
import {Telegraf} from 'telegraf';
import SelectedDate from './selected_date';
import CustomContext from '../Models/ISession';

export default function Calendar(bot: Telegraf<CustomContext>) {
  Today(bot);
  Tomorrow(bot);
  SelectedDate(bot);
}
