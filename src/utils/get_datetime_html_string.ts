import moment from "moment";

export default function GetDatetimeHTMLString(from: Date, fullday?: boolean, to?: Date, ) {

    let retStr = ''

    moment.locale('ru');
    //TODO исправить формат вывода 22 марта - 24 марта 18:00-20:00
    if (from.getDate() === new Date().getDate()) {
        retStr += 'Cегодня'
    } else if (from.getDate() === new Date().getDate() + 1) {
        retStr += 'Завтра'
    } else if (from.getDate() === new Date().getDate() - 1) {
        retStr += 'Вчера'
    } else {

        retStr += moment(from.toISOString()).format('D MMMM YYYY')
        if (to) {

            if (from.getDay() !== to.getDay()) {
                retStr += ' - ' + moment(to.toISOString()).format('D MMMM YYYY')
            }
        }
    }

    if (!fullday) {
        retStr += ', <u>'
        from.setHours(from.getHours()+3);
        retStr += moment(from.toISOString()).format('LT')
        if (to) {
            to.setHours(to.getHours()+3);
            retStr += ' - ';
            retStr += moment(to.toISOString()).format('LT')
        }
        retStr += '</u>'
    }

    return retStr
}
