import {Context} from "telegraf";

interface SessionData {
    actionName: string
}

export default interface CustomContext extends Context {
    session?: SessionData
}
