import {Telegraf, Markup} from 'telegraf';
import CustomContext from "../Models/ISession";

function getWeekByDate(date: Date): Array<Date> {
    const buff = new Date(date);

    date.setDate(date.getDate() - date.getDay() + 1);

    let arr = [];
    if (buff.getMonth() === date.getMonth()) {
        arr.push(new Date(date))
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
        prevMonday.setDate(prevMonday.getDate() + 7)
        const nextWeek = getWeekByDate(prevMonday);

        return ctx.editMessageText('Выберете дату',
            renderInlineWeekKeyboard(nextWeek, data.an)
        )

    })

    bot.action(/prevWeek/, ctx => {
        const data = JSON.parse(ctx.match.input);
        const nextMonday = new Date(data.p);
        nextMonday.setDate(nextMonday.getDate() - 7)
        const prevWeek = getWeekByDate(nextMonday);

        return ctx.editMessageText('Выберете дату',
            renderInlineWeekKeyboard(prevWeek,data.an)
        )

    })


}

function normalizeStr(str: string): string {
    return str[0].toLocaleUpperCase() + str.slice(1).toLocaleLowerCase();
}

function isEqualDates(lhs: Date, rhs: Date): boolean {
    return lhs.getDate() === rhs.getDate() && lhs.getMonth() === rhs.getMonth()
        && lhs.getFullYear() === rhs.getFullYear();
}

function renderDay(date: Date): string {
    const currDate = new Date()

    if (isEqualDates(currDate, date)) {
        return `>> ${date.getDate()} - ${
            normalizeStr(date.toLocaleString('ru', {weekday: 'long'}))
        } <<`
    } else {
        return `${date.getDate()} - ${
            normalizeStr(date.toLocaleString('ru', {weekday: 'long'}))
        }`
    }


}

function renderArrows(week: Array<Date>, actionName: string) {
    if (week.length < 7 || week[0].getDate() === 1) {
        if (week[0].getDate() === 1) {
            return [Markup.button.callback('>>', JSON.stringify({a: 'nextWeek', p: week[0]}))]
        } else {
            return [Markup.button.callback('<<', JSON.stringify({a: 'prevWeek', p: week[0]}))]
        }
    }

    return [
        Markup.button.callback('<<', JSON.stringify({a: 'prevWeek', p: week[0], an: actionName})),
        Markup.button.callback('>>', JSON.stringify({a: 'nextWeek', p: week[0], an: actionName}))
    ]
}

function renderInlineWeekKeyboard(week: Array<Date>, actionName: string) {

    const currentDate = new Date();

    return Markup.inlineKeyboard(
        [
            [Markup.button.callback(`${
                normalizeStr(currentDate.toLocaleString('ru', {month: 'long'}))
            } ${
                currentDate.getFullYear()
            }`, 'test')],
            ...week.map(curr => {
                return [Markup.button.callback(renderDay(curr), JSON.stringify({a:actionName, p: curr}))]
            }),
            renderArrows(week, actionName)
        ],
    )
}

function genDatepicker(ctx: CustomContext, actionName: string) {
    const week = getWeekByDate(new Date());

    return ctx.reply('Выберите дату:',
        renderInlineWeekKeyboard(week, actionName)
    );

}

export {genDatepicker, DatePicker};
