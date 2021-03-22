import CustomContext from '../Models/ISession';
import {genDatepicker} from '../utils/date_picker';
import {Telegraf} from 'telegraf';

export default function SelectedDate(bot: Telegraf<CustomContext>) {
  bot.command('date', ctx => {
    return genDatepicker(ctx, 'selected');
  });

  bot.action(/selected/, ctx => {
    const data = JSON.parse(ctx.match.input);

    return ctx.reply(data.p);
  });
}
