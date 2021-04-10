import moment from "moment";

export default function GetDatetimeHTMLString(from: Date, fullday?: boolean, to?: Date, ) {

    let retStr = ''

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
        retStr += moment(from.toISOString()).format('LT')
        if (to) {
            retStr += ' - ';
            retStr += moment(to.toISOString()).format('LT')
        }
        retStr += '</u>'
    }

    return retStr
}
