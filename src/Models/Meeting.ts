import User from './User';
import CalendarInfo from "./CalendarInfo";
import Location from "./Location";

export default interface Event {
  uid: string
  title: string;
  from?: string;
  to?: string;
  fullDay: boolean;
  description?: string;
  location?: Location;
  calendar: CalendarInfo
  call?: string
  attendees: Array<User>
  organizer: User
  payload?: string
}
