import { describe, test, expect, jest } from '@jest/globals'
import UserDomainEntity from '@/domain/entities/user.domain.entity'
import type LoadUsersRepository from '@/domain/contracts/repos/load-users.repo'
import type { LoadJSONPlaceholderUsersGateway, LoadJSONPlaceholderUsersOutput } from '@/domain/contracts/gateways/json-placeholder-users.gateway'
import type { LoadJSONPlaceholderUsers} from '@/domain/use-cases/load-users.usecase'
import { setupLoadUsers } from '@/domain/use-cases/load-users.usecase'

class StubUserPersistenceRepository implements LoadUsersRepository {
  async all (): Promise<LoadJSONPlaceholderUsersOutput> {
    return [
      new UserDomainEntity({}),
    ]
  }
}

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

describe('Load all users usecase', () => {
  let userPersistenceRepository: LoadUsersRepository
  let jsonPlaceholder: LoadJSONPlaceholderUsersGateway 
  let sut: LoadJSONPlaceholderUsers

  beforeEach(() => {
    userPersistenceRepository = new StubUserPersistenceRepository()
    jsonPlaceholder = new StubjsonPlaceholderUser()
    sut = setupLoadUsers(jsonPlaceholder, userPersistenceRepository)
  })

  test('ensure it calls database when httpClient fails to fetch users', async () => {
    const spyUserPersistenceRepository = jest.spyOn(userPersistenceRepository, 'all')
    const spyJSONPlaceholderGateway = jest.spyOn(jsonPlaceholder, 'all').mockResolvedValueOnce([])
    await sut()

    expect(spyJSONPlaceholderGateway).toHaveBeenCalled()
    expect(spyJSONPlaceholderGateway).toHaveBeenCalledTimes(1)
    expect(spyJSONPlaceholderGateway).toHaveBeenCalledWith()

    expect(spyUserPersistenceRepository).toHaveBeenCalled()
    expect(spyUserPersistenceRepository).toHaveBeenCalledTimes(1)
    expect(spyUserPersistenceRepository).toHaveBeenCalledWith()
  })
  test('ensure it calls httpClient to fetch users successfully', async () => {
    const spyUserPersistenceRepository = jest.spyOn(userPersistenceRepository, 'all')
    const spyJSONPlaceholderGateway = jest.spyOn(jsonPlaceholder, 'all')
    await sut()

    expect(spyJSONPlaceholderGateway).toHaveBeenCalled()
    expect(spyJSONPlaceholderGateway).toHaveBeenCalledTimes(1)
    expect(spyJSONPlaceholderGateway).toHaveBeenCalledWith()

    expect(spyUserPersistenceRepository).not.toHaveBeenCalled()
  })
  test('ensure it rethrows if database throws', async () => {
    jest.spyOn(userPersistenceRepository, 'all').mockRejectedValueOnce(new Error('Some database error'))
    const spyJSONPlaceholderGateway = jest.spyOn(jsonPlaceholder, 'all').mockResolvedValueOnce([])
    await expect(sut()).rejects.toThrow()

    expect(spyJSONPlaceholderGateway).toHaveBeenCalled()
    expect(spyJSONPlaceholderGateway).toHaveBeenCalledTimes(1)
    expect(spyJSONPlaceholderGateway).toHaveBeenCalledWith()
  })
})