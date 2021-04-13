import {Telegraf} from "telegraf";
import CustomContext from "../../Models/CustomContext";
import axios from "axios";
import getId from "../../utils/getId";
import getUserName from "../../utils/get_user_name";
import Attendee from "../../Models/Attendee";
import UserInfo from "../../Models/UserInfo";
import CreateEventCard from "./create_event_card";
import RedisCreateEventData from "../../Models/RedisCreateEventData";

export default function EventHandlers(bot: Telegraf<CustomContext>) {
    bot.action(/event_user/, ctx => {
        const data = JSON.parse(ctx.match.input)
        axios.get(`${process.env['BACKEND_URL']}/oauth/telegram/user/${getId(ctx)}/is_auth`)
            .then(_ => {
                axios.get(`${process.env['BACKEND_URL']}/oauth/telegram/user/${getId(ctx)}/info`)
                    .then(resp => {
                        ctx.redis_client.get(data.p, async (err, redis_data) => {
                            if (redis_data) {
                                const parsed_data = JSON.parse(redis_data) as RedisCreateEventData;
                                const userInfo = resp.data as UserInfo;
                                let attendee: Attendee =  {
                                    email: userInfo.email,
                                    role: 'REQUIRED',
                                    status: data.a === 'event_user_accept' ? 'ACCEPTED' : 'DECLINED',
                                    name: userInfo.name
                                }

                                const isUserInEvent = parsed_data.event_data.attendees.filter(curr => {
                                    return curr.email === attendee.email
                                })

                                if (isUserInEvent.length !== 0) {
                                    if (isUserInEvent[0].status === attendee.status) {
                                        return;
                                    } else {
                                        parsed_data.event_data.attendees.forEach(curr => {
                                            if (curr.email === attendee.email) {
                                                curr.status = attendee.status;
                                                (async () => {
                                                const resp_status = await axios.put(`${process.env['BACKEND_URL']}/telegram/user/${getId(ctx)}/events/calendar/change/attendee/status`,
                                                    {
                                                        eventID: parsed_data.resp_data.data.createEvent.uid,
                                                        calendarID: parsed_data.resp_data.data.createEvent.calendar.uid,
                                                        status: attendee.status
                                                    })
                                                })()
                                            }
                                        })
                                    }
                                } else {
                                    const resp_add = await axios.put(`${process.env['BACKEND_URL']}/telegram/user/${getId(ctx)}/events/calendar/add/attendee`,
                                        {
                                            eventID: parsed_data.resp_data.data.createEvent.uid,
                                            calendarID: parsed_data.resp_data.data.createEvent.calendar.uid,
                                            email: attendee.email,
                                            role: attendee.role
                                        })

                                    const resp_status = await axios.put(`${process.env['BACKEND_URL']}/telegram/user/${getId(ctx)}/events/calendar/change/attendee/status`,
                                        {
                                            eventID: parsed_data.resp_data.data.createEvent.uid,
                                            calendarID: parsed_data.resp_data.data.createEvent.calendar.uid,
                                            status: attendee.status
                                        })
                                    parsed_data.event_data.attendees.push(attendee);
                                }
                                const typedContext = ctx as CustomContext;
                                typedContext.redis_client.set(parsed_data.resp_data.data.createEvent.uid.slice(0,20),
                                    JSON.stringify(parsed_data))
                                return  CreateEventCard(ctx, parsed_data.resp_data.data.createEvent.uid,
                                    parsed_data.event_data);
                            } else {
                                return Promise.reject(new Error('Не найдена локальная информация о событии'))
                            }
                        })
                    })
                    .catch(err => {
                        ctx.reply(`Inner error: ${err.message}`)
                    })
            }).catch(err => {
                ctx.reply('К сожалению вы еще не авторизованы в нашем сервисе')
            })
    })
}
