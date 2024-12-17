import { describe, test, expect } from '@jest/globals'

export type UserDomainData = {
  id?: number
  username?: string
  email?: string
}

class UserDomainEntity {

  id?: number
  username?: string
  email?: string
  
  constructor (input: UserDomainData ) {
    this.id = input.id
    this.username = input.username
    this.email = input.email
  }
}

describe('User domain entity', () => {
  let sut: UserDomainEntity

  test.todo('ensure it successfully instantiate a User model only with username')
  test.todo('ensure it successfully instantiate a User model with all properties')
  test('ensure it successfully instantiate a User model empty', () => {
    sut = new UserDomainEntity({})
    expect(sut).toBeInstanceOf(UserDomainEntity)
    Object.values(sut).map(prop => {
      expect(prop).toBeUndefined()
    })
  })
})