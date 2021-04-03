import {Context, Scenes} from 'telegraf';
import CreateEvent from "./CreateEvent";
import redis from 'redis';

interface CreateEventData {
  created: boolean
  curr_step: 'TITLE' | 'FROM' | 'TO' | 'DESC' | 'DONE' | 'USERS'
  event: CreateEvent
  mid: number,
  cid: number,
  error_message_id: number
}

interface SessionData extends Scenes.SceneSessionData{
  create_event: CreateEventData
  redis_client: redis.RedisClient
}

export default interface CustomContext extends Context {
  actionName: string;
  redis_client: redis.RedisClient;

  scene: Scenes.SceneContextScene<CustomContext, SessionData>
}
