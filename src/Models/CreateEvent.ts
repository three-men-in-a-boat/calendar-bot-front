import Attendee from "./Attendee";

export default interface CreateEvent {
    uid: string,
    title: string,
    from?: string,
    to?: string,
    fullDay: boolean
    description: string
    attendees: Attendee[]
}
