export default interface Attendee {
    email: string,
    role: 'REQUIRED' | string
    status?: 'ACCEPTED' | 'DECLINED' | 'NEEDS_ACTION',
    name?: string
}
