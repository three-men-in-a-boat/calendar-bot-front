import Event from "./Event";

export default interface RedisCreateEventData {
    resp_data: {
        data: {
            createEvent: {
                uid: string,
                calendar: {
                    uid: string
                }
            }
        }
    }
    event_data: Event
}
