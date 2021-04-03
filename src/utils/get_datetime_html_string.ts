import moment from "moment";

export default function GetDatetimeHTMLString(from: Date, to: Date) {

    let retStr = ''

    if (from.getDate() === new Date().getDate()) {
        retStr += 'Cегодня'
    } else if (from.getDate() === new Date().getDate() + 1) {
        retStr += 'Завтра'
    } else if (from.getDate() === new Date().getDate() - 1) {
        retStr += 'Вчера'
    } else {
        retStr += moment(from.toISOString()).format('D MMMM YYYY')
        if (from.getDay() !== to.getDay()) {
            retStr += ' - ' + moment(to.toISOString()).format('D MMMM YYYY')
        }
    }

    retStr += ', <u>'
    retStr += moment(from.toISOString()).format('LT')
    retStr += ' - ';
    retStr += moment(to.toISOString()).format('LT')
    retStr += '</u>'

    return retStr
}
