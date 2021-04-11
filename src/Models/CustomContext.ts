import {Context, Scenes} from 'telegraf';
import redis from 'redis';
import Event from "./Event";

interface CreateEventData {
    created: boolean
    curr: 'INIT' | 'TITLE' | 'FROM' | 'TO' | 'DESC' | 'DONE' | 'USERS'
    event: Event
    mid: number,
    cid: number,
    error_message_id: number
}

interface FindTimeData {
    founded: boolean
    event: Event
    mid: number,
    poll_mid: number,
    cid: number,
    error_message_id: number,
    day_period: 'm' | 'd' | 'e' | 'n' | undefined,
    long: number
}

interface SessionData extends Scenes.SceneSessionData {
    create_event: CreateEventData
    find_time: FindTimeData
    redis_client: redis.RedisClient
}

export default interface CustomContext extends Context {
    actionName: string;
    redis_client: redis.RedisClient;

    scene: Scenes.SceneContextScene<CustomContext, SessionData>
}
