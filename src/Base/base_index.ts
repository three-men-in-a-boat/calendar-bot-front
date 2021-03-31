import Help from './help';
import Start from './start';
import About from './about';
import {Context, Telegraf} from 'telegraf';
import Stop from "./stop";
import CustomContext from "../Models/CustomContext";

export default function Base(bot: Telegraf<CustomContext>) {
  Start(bot);
  Help(bot);
  About(bot);
  Stop(bot);
}
