import Help from './help';
import Start from './start';
import About from './about';
import {Context, Telegraf} from 'telegraf';
import Stop from "./stop";
import CustomContext from "../Models/CustomContext";
import onText from "./onText";

export default function Base(bot: Telegraf<CustomContext>) {
  Start(bot);
  Help(bot);
  About(bot);
  Stop(bot);
  onText(bot);
}
