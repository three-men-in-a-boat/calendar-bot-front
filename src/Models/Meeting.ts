import User from './User';
import CalendarInfo from "./CalendarInfo";

export default interface Event {
  uuid: string
  title: string;
  from?: string;
  to?: string;
  fullDay: boolean;
  description?: string;
  location?: string;
  calendar: CalendarInfo
  call?: string
  attendees: Array<User>
  organizer: User
  payload?: string
}
