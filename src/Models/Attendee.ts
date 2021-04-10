export default interface Attendee {
    email: string,
    role: string
    status?: 'ACCEPTED' | 'DECLINED' | 'NEEDS_ACTION',
    name?: string
}
