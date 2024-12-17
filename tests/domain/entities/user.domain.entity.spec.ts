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

  test('ensure it successfully instantiate a User model only with username', () => {
    const params = {
      username: 'any_valid_username',
    }
    sut = new UserDomainEntity(params)
    expect(sut).toBeInstanceOf(UserDomainEntity)
    expect(sut.id).toBeUndefined()
    expect(sut.username).toEqual(params.username)
    expect(sut.email).toBeUndefined()
  })
  test('ensure it successfully instantiate a User model with all properties', () => {
    const params = {
      id: 1,
      username: 'any_valid_username',
      email: 'any_valid_email'
    }
    sut = new UserDomainEntity(params)
    expect(sut).toBeInstanceOf(UserDomainEntity)
    expect(sut.id).toEqual(params.id)
    expect(sut.username).toEqual(params.username)
    expect(sut.email).toEqual(params.email)
  })
  test('ensure it successfully instantiate a User model empty', () => {
    sut = new UserDomainEntity({})
    expect(sut).toBeInstanceOf(UserDomainEntity)
    Object.values(sut).map(prop => {
      expect(prop).toBeUndefined()
    })
  })
})