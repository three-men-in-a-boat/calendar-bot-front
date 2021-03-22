import User from './User';

export default interface Meeting {
  name: string;
  time_from?: string;
  time_to?: string;
  all_day: boolean;
  repeating: boolean;
  repeating_info?: string;
  participants: Array<string>;
  call_link?: string;
  description?: string;
  calendar: string;
  remember_info?: string;
  place?: string;
}
