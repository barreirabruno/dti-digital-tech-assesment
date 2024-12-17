import { describe, test, expect } from '@jest/globals'
import type { LoadJSONPlaceholderUsersGateway, LoadJSONPlaceholderUsersOutput } from '@/domain/contracts/gateways/json-placeholder-users.gateway'
import type HttpGetClient from '@/infra/gateways/get-http-client'

import type { MockProxy } from 'jest-mock-extended'
import { mock } from 'jest-mock-extended'
import UserDomainEntity from '@/domain/entities/user.domain.entity'

class LoadUsersJSONPlaceholder implements LoadJSONPlaceholderUsersGateway {
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

describe('Load users from JSON Placeholder api', () => {
  let httpClient: MockProxy<HttpGetClient>
  let sut: LoadUsersJSONPlaceholder

  beforeAll(() => {
    httpClient = mock()
  })

  beforeEach(() => {
    httpClient.get
      .mockResolvedValueOnce([{
        'id': 1,
        'name': 'Leanne Graham',
        'username': 'Bret',
        'email': 'Sincere@april.biz',
        'address': {
          'street': 'Kulas Light',
          'suite': 'Apt. 556',
          'city': 'Gwenborough',
          'zipcode': '92998-3874',
          'geo': {
            'lat': '-37.3159',
            'lng': '81.1496'
          }
        },
        'phone': '1-770-736-8031 x56442',
        'website': 'hildegard.org',
        'company': {
          'name': 'Romaguera-Crona',
          'catchPhrase': 'Multi-layered client-server neural-net',
          'bs': 'harness real-time e-markets'
        }
      }])
    sut = new LoadUsersJSONPlaceholder(httpClient)
  })

  test('should return JSON Placeholder user list', async () => {
    const result = await sut.all()
    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 1,
          username: 'Bret',
          email: 'Sincere@april.biz'
        })
      ])
    )
  })
})
