import {Context, Telegraf} from 'telegraf';

export default function About(bot: Telegraf<Context>) {
    bot.command('about', ctx => {
        ctx.reply('Разработан командой 4 семестра образовательного проекта ' +
            'Mail.Ru Технопарк "Трое в лодке не считая дебага"');
    });
}
