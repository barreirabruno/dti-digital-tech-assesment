import type { LoadJSONPlaceholderUsersGateway, LoadJSONPlaceholderUsersOutput } from '@/domain/contracts/gateways/json-placeholder-users.gateway'
import UserDomainEntity from '@/domain/entities/user.domain.entity'
import type HttpGetClient from '@/infra/gateways/get-http-client'

export default class LoadUsersJSONPlaceholder implements LoadJSONPlaceholderUsersGateway {
  private readonly baseUrl = 'https://jsonplaceholder.typicode.com'

  constructor (
    private readonly httpClient: HttpGetClient
  ) {}

  async all (): Promise<LoadJSONPlaceholderUsersOutput> {
    try {
      const url = `${this.baseUrl}/users`
      const response: { id: number, username: string, email: string}[] = await this.httpClient.get({
        url: url,
        params: {}
      })
      return response.map(user => {
        return new UserDomainEntity({
          id: user.id,
          username: user.username,
          email: user.email
        })
      })
    } catch (error) {
      console.log('[ERROR]: ', error)
      return undefined
    }
  }
}