import {Telegraf} from "telegraf";
import CustomContext from "../Models/CustomContext";
import getId from "../utils/getId";
import {AxiosError, default as axios} from "axios";


function StopHandler(ctx: CustomContext) {
    axios.delete(`${process.env['BACKEND_URL']}/oauth/telegram/user/${getId(ctx)}`)
        .then(resp => {
            if (resp.status !== 200) {
                return ctx.reply('Вы уже вышли из бота');
            } else {
                return ctx.reply('Вы успешно разлогинились из бота. Чтобы снова начать работу с ботом введите /start');
            }
        })
        .catch((err:AxiosError) => {
            return ctx.reply(`Stop callback fall with err: ${err.message}`)
        })
}

export default function Stop(bot: Telegraf<CustomContext>) {
    bot.command('stop', ctx => {
        StopHandler(ctx);
    })

    bot.action('stop', ctx => {
        StopHandler(ctx);
    })

}
