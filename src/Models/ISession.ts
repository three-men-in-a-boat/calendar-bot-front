import {Context} from "telegraf";

interface SessionData {
    selectedDate: Date
}

export default interface CustomContext extends Context {
    session?: SessionData
}
