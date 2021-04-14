import CalendarInfo from "./CalendarInfo";
import Location from "./Location";
import Attendee from "./Attendee";

export default interface Event {
  uid: string
  title?: string;
  from?: string;
  to?: string;
  fullDay: boolean;
  description?: string;
  location?: Location;
  calendar?: CalendarInfo
  call?: string
  attendees: Attendee[]
  organizer?: Attendee
  payload?: string
  user_tg_id?: number
}
