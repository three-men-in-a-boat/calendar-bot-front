enum Status {
  accepted = 'ACCEPTED',
  needs_action = 'NEEDS_ACTION',
  declined = 'DECLINED'
}

export default interface User {
  email: string,
  name: string,
  role: string,
  status: Status
}
