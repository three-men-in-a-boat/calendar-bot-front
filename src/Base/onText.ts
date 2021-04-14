import {Telegraf} from "telegraf";
import CustomContext from "../Models/CustomContext";
import axios from "axios";
import ParsedEvent from "../Models/ParsedEvent";

export default function onText(bot: Telegraf<CustomContext>) {
    bot.on('text', ctx => {
        axios.put(`${process.env['BACKEND_URL']}/parse/event`,
            {
                text: ctx.message.text
            })
            .then(resp => {
                if (Object.keys(resp.data).length === 0) {
                    return ctx.reply('Простите, но мы не смогли распознать событие в вашем сообщении. ' +
                        'Воспользуйтесь командой /create, если хотите создать событие.')
                }
                ctx.scene.enter('create_event');
                const event_info = resp.data as ParsedEvent;
                const event = ctx.scene.session.create_event.event;


                if (event_info.event_start) {
                    event.from = new Date(event_info.event_start).toISOString();
                    ctx.scene.session.create_event.curr = 'TO';
                }

                if (event_info.event_end) {
                    event.to = new Date(event_info.event_end).toISOString();
                    ctx.scene.session.create_event.curr = 'TITLE';
                }

                if (event_info.event_name === "") {
                    event.title = "Без названия";
                    ctx.scene.session.create_event.curr = 'TITLE';
                } else {
                    event.title = event_info.event_name
                    if (event_info.event_end) {
                        ctx.scene.session.create_event.curr = 'DESC';
                    }
                }


            })
            .catch(err => {
                console.log(err)
            })
    })
}
