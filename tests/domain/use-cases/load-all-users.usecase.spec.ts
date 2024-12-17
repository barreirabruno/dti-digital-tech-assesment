import { describe, test, expect, jest } from '@jest/globals'
import UserDomainEntity from '@/domain/entities/user.domain.entity'

// domain/contracts/repo
export default interface LoadUsersRepository {
  all: () => Promise<LoadUsersRepositoryOutput>
}
export type LoadUsersRepositoryOutput = UserDomainEntity[]

class StubUserPersistenceRepository implements LoadUsersRepository {
  async all (): Promise<LoadJSONPlaceholderUsersOutput> {
    return [
      new UserDomainEntity({}),
    ]
  }
}

// domain/contracts/gateway
export interface LoadJSONPlaceholderUsersGateway {
  all: () => Promise<LoadJSONPlaceholderUsersOutput>
}
export type LoadJSONPlaceholderUsersOutput = UserDomainEntity[]

class StubjsonPlaceholderUser implements LoadJSONPlaceholderUsersGateway {
  async all (): Promise<LoadJSONPlaceholderUsersOutput> {
    return [
      new UserDomainEntity({
        id: 1,
        username: 'any_valid_username',
        email: 'any@email.com.br'
      }),
    ]
  }
}

type Setup = (jsonPlaceholderUser: LoadJSONPlaceholderUsersGateway, userPersistenceRepository: LoadUsersRepository ) => LoadJSONPlaceholderUsers
type Output = { id?: number, username?: string, email?: string }[]
export type LoadJSONPlaceholderUsers = () => Promise<Output>

const setupLoadUsers: Setup = (jsonPlaceholderUser, userPersistenceRepository) => {
  return async () => {
    const fetchExternalApi = await jsonPlaceholderUser.all()
    if(fetchExternalApi.length !== 0) {
      return fetchExternalApi
    }
    const fetchUsersDatabase = await userPersistenceRepository.all()
    return fetchUsersDatabase 
  }
}

describe('Load all users usecase', () => {
  let userPersistenceRepository: LoadUsersRepository
  let jsonPlaceholder: LoadJSONPlaceholderUsersGateway 
  let sut: LoadJSONPlaceholderUsers

  beforeEach(() => {
    userPersistenceRepository = new StubUserPersistenceRepository()
    jsonPlaceholder = new StubjsonPlaceholderUser()
    sut = setupLoadUsers(jsonPlaceholder, userPersistenceRepository)
  })

  test.todo('ensure it calls database when httpClient fails to fetch users')
  test('ensure it calls httpClient to fetch users successfully', async () => {
    const spyUserPersistenceRepository = jest.spyOn(userPersistenceRepository, 'all')
    const spyJSONPlaceholderGateway = jest.spyOn(jsonPlaceholder, 'all')
    await sut()

    expect(spyJSONPlaceholderGateway).toHaveBeenCalled()
    expect(spyJSONPlaceholderGateway).toHaveBeenCalledTimes(1)
    expect(spyJSONPlaceholderGateway).toHaveBeenCalledWith()

    expect(spyUserPersistenceRepository).not.toHaveBeenCalled()
  })
  test.todo('ensure it throws when httpClient and database fails')
})