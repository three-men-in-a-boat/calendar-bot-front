import Today from './today';
import {Telegraf} from 'telegraf';
import SelectedDate from './selected_date';
import CustomContext from '../Models/CustomContext';
import Next from "./next";
import CreateEvent from "./create_event";
import EventHandlers from "./events/event_handlers";

export default function Calendar(bot: Telegraf<CustomContext>) {
  Today(bot);
  SelectedDate(bot);
  Next(bot);
  CreateEvent(bot);
  EventHandlers(bot);
}
