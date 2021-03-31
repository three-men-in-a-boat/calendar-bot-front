import {Context, Telegraf} from 'telegraf';
import CustomContext from "../Models/CustomContext";

export default function About(bot: Telegraf<CustomContext>) {
  bot.command('about', ctx => {
    ctx.reply(
      'Разработан командой 4 семестра образовательного проекта ' +
        'Mail.Ru Технопарк "Трое в лодке не считая дебага"'
    );
  });
}
