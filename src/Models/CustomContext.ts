import {Context, Scenes} from 'telegraf';
import CreateEvent from "./CreateEvent";

interface CreateEventData {
  created: boolean
  curr_step: 'TITLE' | 'FROM' | 'TO' | 'DESC'
  event: CreateEvent
  mid: number,
  cid: number,
  error_message_id: number
}

interface SessionData extends Scenes.SceneSessionData{
  actionName: string;
  create_event: CreateEventData
}

export default interface CustomContext extends Context {
  session_data: string

  scene: Scenes.SceneContextScene<CustomContext, SessionData>
}
