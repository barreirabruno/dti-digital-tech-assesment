export type UserDomainData = {
  id?: number
  username?: string
  email?: string
}

export default class UserDomainEntity {

  id?: number
  username?: string
  email?: string
  
  constructor (input: UserDomainData ) {
    this.id = input.id
    this.username = input.username
    this.email = input.email
  }
}
