import Event from "../../Models/Event";
import moment from "moment";
import GetDatetimeHTMLString from "../../utils/get_datetime_html_string";

function genHeader(event: Event) {
    let from = new Date();
    let to = new Date();

    if (!event) {
        return ''
    }

    if (event.from) {
        from = new Date(event.from);
    }

    if (!event.fullDay) {
        if (event.to) {
            to = new Date(event.to);
        }
    }

    let replyMdStr = ''
    replyMdStr += `<b>${event.title}</b>` + '\n\n⏰ '
    moment.locale('ru');
    if (event.fullDay) {
        replyMdStr += GetDatetimeHTMLString(from, true)
        replyMdStr += ' весь день';
    } else {
        if (event.to) {
            replyMdStr += GetDatetimeHTMLString(from, false, to);
        } else {
            replyMdStr += GetDatetimeHTMLString(from)
        }
    }

    return replyMdStr
}

function genFooter(event: Event, user_id?: number, user_name?: string) {
    let replyMdStr = ''
    if (event.calendar) {

        replyMdStr += '-------------------------------------\n';
        replyMdStr += `🗓 Календарь <b>${event.calendar.title}</b>`
        if (user_id && user_name) {
            replyMdStr += ` пользователя <a href="tg://user?id=${user_id}">${user_name}</a>`
        }
    }

    return replyMdStr
}

function createShortHTMLStr(event: Event, user_id?: number, user_name?: string) {
    let replyMdStr = genHeader(event);

    replyMdStr += '\n';

    replyMdStr += genFooter(event, user_id, user_name);

    return replyMdStr
}

function createFullHTMLStr(event: Event, user_id?: number, user_name?: string) {
    let replyMdStr = genHeader(event);

    if (event.location?.description) {
        replyMdStr += '\n📍 ' + event.location.description;
    }

    replyMdStr += '\n';

    let sendTitleAtt: boolean = false
    for (let user of event.attendees) {
        if (user.email !== 'calendar@internal') {
            if (!sendTitleAtt) {
                replyMdStr += '-------------------------------------\n';
                replyMdStr += '<u><i>Участники:</i></u>\n';
                sendTitleAtt = true;
            }
            replyMdStr += '\n' + (user.name ? user.name : '') + ' (' + user.email + ') '
            if (event.organizer && event.organizer.email === user.email) {
                replyMdStr += ' - Организатор'
            } else {
                if (user.status === 'ACCEPTED') {
                    replyMdStr += ' ✅'
                } else if (user.status === 'NEEDS_ACTION') {
                    replyMdStr += ' �'
                } else {
                    replyMdStr += ' ❌'
                }
            }
        }
    }
    replyMdStr += '\n'


    if (event.description) {
        replyMdStr += '-------------------------------------\n';
        replyMdStr += '<u><i>Описание</i></u>\n\n';
        replyMdStr += event.description;
        replyMdStr += '\n'
    }


    replyMdStr += genFooter(event, user_id, user_name);

    return replyMdStr
}

export {createFullHTMLStr, createShortHTMLStr};
