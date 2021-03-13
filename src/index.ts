import {Telegraf, Markup} from 'telegraf';
import {config} from 'dotenv';

config();

const token = process.env['TELEGRAM_BOT_TOKEN'];

if (!token) {
    console.log('.env file not found');
    throw new Error('Telegram token not found');
}

const bot = new Telegraf(token);
bot.start(
    async ctx =>  {
        return ctx.reply('Добрый день, пожалуйста авторизуйтесь для начала работы с календарем',
            Markup.inlineKeyboard([
                Markup.button.url('Войти в аккаунт', 'https://oauth.mail.ru/xlogin?' +
                    'client_id=885a013d102b40c7a46a994bc49e68f1&' +
                    'response_type=code&scope=&' +
                    'redirect_uri=https://calendarbot.xyz/api/v1/login&' +
                    'state=some_state')
            ]))
    })
bot.help(ctx => {
    ctx.reply('Send me a sticker');
});
bot.on('sticker', ctx => ctx.reply('👍'));
bot.hears('hi', ctx => ctx.reply('Hey there'));


bot
    .launch()
    .then(() => {
        console.log('Bot started');
    })
    .catch(err => {
        console.log(`There was an error: ${err}`);
    });

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
