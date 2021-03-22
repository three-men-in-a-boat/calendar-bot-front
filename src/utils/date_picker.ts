import {Telegraf, Markup} from 'telegraf';
import CustomContext from '../Models/ISession';

function getWeekByDate(date: Date): Array<Date> {
  const buff = new Date(date);

  if (buff.getDay()) {
    date.setDate(date.getDate() - date.getDay() + 1);
  } else {
    date.setDate(date.getDate() - 6);
  }
  date.setHours(10, 0, 0, 0);

  const arr = [];
  if (buff.getMonth() === date.getMonth()) {
    arr.push(new Date(date));
  }

  while (date.getDay() !== 0) {
    date.setDate(date.getDate() + 1);
    if (buff.getMonth() === date.getMonth()) {
      arr.push(new Date(date));
    }
  }

  return arr;
}

function DatePicker(bot: Telegraf<CustomContext>) {
  bot.action(/nextWeek/, ctx => {
    const data = JSON.parse(ctx.match.input);
    const prevMonday = new Date(data.p);
    const month = prevMonday.getMonth();
    prevMonday.setDate(prevMonday.getDate() + 7);
    const nextWeek = getWeekByDate(prevMonday);

    return ctx.editMessageText(
      'Выберите дату',
      renderInlineWeekKeyboard(nextWeek, month, ctx.session!.actionName)
    );
  });

  bot.command('test', ctx => {
    const date = new Date();
    date.setMonth(1, 1);

    return ctx.reply(String(getWeekByDate(date)));
  });

  bot.action(/prevWeek/, ctx => {
    const data = JSON.parse(ctx.match.input);
    const nextSunday = new Date(data.p);
    const month = nextSunday.getMonth();
    nextSunday.setDate(nextSunday.getDate() - 1);
    const prevWeek = getWeekByDate(nextSunday);

    return ctx.editMessageText(
      'Выберете дату',
      renderInlineWeekKeyboard(prevWeek, month, ctx.session!.actionName)
    );
  });

  bot.action('selectMonth', ctx => {
    const currDate = new Date();

    return ctx.editMessageText(
      `Выберите месяц ${currDate.getFullYear()}`,
      renderInlineMonthKeyboard()
    );
  });

  bot.action(/showWeek/, ctx => {
    const data = JSON.parse(ctx.match.input);

    const date = new Date();
    date.setMonth(data.p, 2);

    const week = getWeekByDate(new Date(date));

    return ctx.editMessageText(
      'Выберите день',
      renderInlineWeekKeyboard(week, date.getMonth(), ctx.session!.actionName)
    );
  });
}

function normalizeStr(str: string): string {
  return str[0].toLocaleUpperCase() + str.slice(1).toLocaleLowerCase();
}

function isEqualDates(lhs: Date, rhs: Date): boolean {
  return (
    lhs.getDate() === rhs.getDate() &&
    lhs.getMonth() === rhs.getMonth() &&
    lhs.getFullYear() === rhs.getFullYear()
  );
}

function renderDay(date: Date): string {
  const currDate = new Date();

  if (isEqualDates(currDate, date)) {
    return `>> ${date.getDate()} - ${normalizeStr(
      date.toLocaleString('ru', {weekday: 'long'})
    )} <<`;
  } else {
    return `${date.getDate()} - ${normalizeStr(
      date.toLocaleString('ru', {weekday: 'long'})
    )}`;
  }
}

function renderArrows(week: Array<Date>) {
  if (week.length < 7 || week[0].getDate() === 1 || week[6].getDate() === 31) {
    if (week[0].getDate() === 1) {
      return [
        Markup.button.callback(
          '>>',
          JSON.stringify({a: 'nextWeek', p: week[0]})
        ),
      ];
    } else {
      return [
        Markup.button.callback(
          '<<',
          JSON.stringify({a: 'prevWeek', p: week[0]})
        ),
      ];
    }
  }

  return [
    Markup.button.callback('<<', JSON.stringify({a: 'prevWeek', p: week[0]})),
    Markup.button.callback('>>', JSON.stringify({a: 'nextWeek', p: week[0]})),
  ];
}

function renderInlineWeekKeyboard(
  week: Array<Date>,
  month: number,
  actionName: string
) {
  const date = new Date();
  date.setMonth(month);

  return Markup.inlineKeyboard([
    [
      Markup.button.callback(
        `<< ${normalizeStr(
          date.toLocaleString('ru', {month: 'long'})
        )} ${date.getFullYear()}`,
        'selectMonth'
      ),
    ],
    ...week.map(curr => {
      return [
        Markup.button.callback(
          renderDay(curr),
          JSON.stringify({a: actionName, p: curr})
        ),
      ];
    }),
    renderArrows(week),
  ]);
}

function genMonthButtons() {
  const months = [
    'Январь',
    'Февраль',
    'Март',
    'Апрель',
    'Май',
    'Июнь',
    'Июль',
    'Август',
    'Сентябрь',
    'Октябрь',
    'Ноябрь',
    'Декабрь',
  ];

  const res = [];
  for (let i = 0; i < months.length; ++i) {
    res.push([
      Markup.button.callback(months[i], JSON.stringify({a: 'showWeek', p: i})),
      Markup.button.callback(
        months[i + 1],
        JSON.stringify({a: 'showWeek', p: i + 1})
      ),
    ]);
    ++i;
  }

  return res;
}

function renderInlineMonthKeyboard() {
  return Markup.inlineKeyboard(genMonthButtons());
}

function genDatepicker(ctx: CustomContext, actionName: string) {
  const week = getWeekByDate(new Date());
  const currDate = new Date();

  ctx.session = {actionName: actionName};

  return ctx.reply(
    'Выберите дату:',
    renderInlineWeekKeyboard(week, currDate.getMonth(), actionName)
  );
}

export {genDatepicker, DatePicker};
