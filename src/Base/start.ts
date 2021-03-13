import {Context, Markup, Telegraf} from 'telegraf';

export default function Start(bot: Telegraf<Context>) {
  bot.start(async ctx => {
    return ctx.reply(
      'Добрый день, пожалуйста авторизуйтесь для начала работы с календарем',
      Markup.inlineKeyboard([
        Markup.button.url(
          'Войти в аккаунт',
          'https://oauth.mail.ru/xlogin?' +
            'client_id=885a013d102b40c7a46a994bc49e68f1&' +
            'response_type=code&scope=&' +
            'redirect_uri=https://calendarbot.xyz/api/v1/login&' +
            'state=some_state'
        ),
      ])
    );
  });
}
