import CustomContext from "../Models/CustomContext";
import redis from 'redis';
import {uuid} from "uuidv4";

export default async function InitMiddleware(ctx: CustomContext, next: Function) {
    if (!ctx.redis_client) {
        const client = redis.createClient({db:10})
        ctx.redis_client ??= client
        ctx.scene.session.redis_client ??= client
    }

    ctx.scene.session.create_event ??= {
        created: false,
        curr: 'INIT',
        event: {
            uid:uuid(),
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
    return next()
}
