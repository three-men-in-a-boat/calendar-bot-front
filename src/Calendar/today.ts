import {Context, Markup, Telegraf} from 'telegraf';
import {default as axios} from 'axios';
import Meeting from '../Models/Meeting';
import {callback} from 'telegraf/typings/button';

const meetings: Array<Meeting> = [
  {
    name: 'Встреча 1',
    time_from: '18:00',
    time_to: '18:30',
    all_day: false,
    repeating: false,
    participants: ['Alex', 'Gabe', 'Nick'],
    call_link: 'https://call_link.ru',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ' +
      'ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris' +
      ' nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit' +
      ' esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in' +
      ' culpa qui officia deserunt mollit anim id est laborum.',
    calendar: 'Main',
    remember_info: '15 minutes before',
  },
  {
    name: 'Встреча 2',
    all_day: true,
    repeating: true,
    repeating_info: 'Every weak',
    participants: ['Alex', 'Gabe', 'Nick'],
    call_link: 'https://call_link.ru',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ' +
      'ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris' +
      ' nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit' +
      ' esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in' +
      ' culpa qui officia deserunt mollit anim id est laborum.',
    calendar: 'Main',
    remember_info: '15 minutes before',
  },
  {
    name: 'Встреча 3',
    time_from: '20:00',
    time_to: '20:30',
    all_day: false,
    repeating: false,
    participants: ['Alex', 'Gabe', 'Nick'],
    call_link: 'https://call_link.ru',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ' +
      'ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris' +
      ' nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit' +
      ' esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in' +
      ' culpa qui officia deserunt mollit anim id est laborum.',
    calendar: 'Main',
    remember_info: '15 minutes before',
  },
];

export default function Today(bot: Telegraf<Context>) {
  async function todayCallback(ctx: Context) {
    // const resp = await axios.get(
    //   'https://calendarbot.xyz/api/v1/oauth/telegram/events'
    // );

    // meetings.forEach((curr, idx) => {
    //     const pars = curr.participants[0].split(',').join('\n\t\t\t');
    //     answerStr += `\n\n${idx + 1}) ${curr.name} ${
    //         curr.time
    //     } with \n\t\t\t ${pars}`;
    // });


    return ctx.reply(
      'События на сегодня',
      Markup.inlineKeyboard(
        meetings.map((meet, idx) => {
          return [
            Markup.button.callback(
              `${meet.name} 
                ${
                  meet.all_day
                    ? 'весь день'
                    : `${meet.time_from} - ${meet.time_to}`
                }`,
              JSON.stringify({a: 'show_full', p: idx})
            ),
          ];
        })
      )
    );
  }

  bot.command('today', ctx => {
    return todayCallback(ctx);
  });

  bot.action('today', ctx => {
    return todayCallback(ctx);
  });

  bot.action(/show_full/, ctx => {
    const info = JSON.parse(ctx.match.input);
    const m: Meeting = meetings[info.p];
    ctx.editMessageText(
      m.name,
      Markup.inlineKeyboard([Markup.button.callback('Назад', 'today_upd')])
    );
  });

  bot.action('today_upd', ctx => {
    return ctx.editMessageText(
      'События на сегодня',
      Markup.inlineKeyboard(
        meetings.map((meet, idx) => {
          return [
            Markup.button.callback(
              `${meet.name} 
                ${
                  meet.all_day
                    ? 'весь день'
                    : `${meet.time_from} - ${meet.time_to}`
                }`,
              JSON.stringify({a: 'show_full', p: idx})
            ),
          ];
        })
      )
    );
  });
}
