import {Telegraf} from "telegraf";
import CustomContext from "../Models/CustomContext";
import axios from "axios";
import getId from "../utils/getId";
import getUserName from "../utils/get_user_name";

export default function EventHandlers(bot: Telegraf<CustomContext>) {
    bot.action(/event_user_accept/, ctx => {
        const data = JSON.parse(ctx.match.input)
        axios.get(`${process.env['BACKEND_URL']}/oauth/telegram/user/${getId(ctx)}/is_auth`)
            .then(resp => {
                ctx.redis_client.get(data.p, (err, redis_data) => {
                    if (redis_data) {
                        const parsed_data = JSON.parse(redis_data)
                        ctx.reply(`Пользователь ${getUserName(ctx)} идет на встречу с id = ${parsed_data.data.createEvent.uid}`);
                    }
                })

            })
            .catch(err => {
                ctx.reply('К сожалению вы еще не авторизованы в нашем сервисе')
            })


    })


    bot.action(/event_user_decline/, ctx => {
        const data = JSON.parse(ctx.match.input)
        axios.get(`${process.env['BACKEND_URL']}/oauth/telegram/user/${getId(ctx)}/is_auth`)
            .then(resp => {
                ctx.redis_client.get(data.p, (err, redis_data) => {
                    if (redis_data) {
                        const parsed_data = JSON.parse(redis_data)
                        ctx.reply(`Пользователь ${getUserName(ctx)} отклонил встречу с id = ${parsed_data.data.createEvent.uid}`);
                    }
                })

            })
            .catch(err => {
                ctx.reply('К сожалению вы еще не авторизованы в нашем сервисе')
            })
    })

}
