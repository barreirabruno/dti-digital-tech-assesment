import type { LoadJSONPlaceholderUsersGateway } from '@/domain/contracts/gateways/json-placeholder-users.gateway'
import type LoadUsersRepository from '@/domain/contracts/repos/load-users.repo'

type Setup = (jsonPlaceholderUser: LoadJSONPlaceholderUsersGateway, userPersistenceRepository: LoadUsersRepository ) => LoadJSONPlaceholderUsers
type Output = { id?: number, username?: string, email?: string }[] | Error
export type LoadJSONPlaceholderUsers = () => Promise<Output>

export const setupLoadUsers: Setup = (jsonPlaceholderUser, userPersistenceRepository) => {
  return async () => {
    const fetchExternalApi = await jsonPlaceholderUser.all()
    if(fetchExternalApi.length !== 0) {
      return fetchExternalApi
    }
    const fetchUsersDatabase = await userPersistenceRepository.all()
    return fetchUsersDatabase
  }
}