import CustomContext from "../Models/CustomContext";
import redis from 'redis';
import {uuid} from "uuidv4";

export default async function InitMiddleware(ctx: CustomContext, next: Function) {
    if (!ctx.redis_client) {
        ctx.redis_client = redis.createClient({db: 10})
    }

    if (ctx.scene && !ctx.scene.session.redis_client) {
        ctx.scene.session.redis_client = redis.createClient({db: 10})
    }

    if (ctx.scene) {

        ctx.scene.session.create_event ??= {
            created: false,
            curr: 'INIT',
            event: {
                uid: uuid(),
                title: "",
                description: "",
                from: "",
                to: "",
                fullDay: false,
                attendees: []
            },
            mid: 0,
            cid: 0,
            error_message_id: 0
        }

        ctx.scene.session.find_time ??= {
            founded: false,
            event: {
                uid: uuid(),
                title: "",
                description: "",
                from: "",
                to: "",
                fullDay: false,
                attendees: []
            },
            mid: 0,
            cid: 0,
            poll_mid: 0,
            error_message_id: 0,
            day_period: undefined,
            long: 0
        }
    }
    return next()
}
