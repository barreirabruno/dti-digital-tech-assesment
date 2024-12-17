import { describe, test, expect } from '@jest/globals'
import type HttpGetClient from '@/infra/gateways/get-http-client'
import LoadUsersJSONPlaceholder from '@/infra/gateways/load-users-json-placeholder'

import type { MockProxy } from 'jest-mock-extended'
import { mock } from 'jest-mock-extended'

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
  test('should return undefined if HTTPGetClient throws', async () => {
    httpClient.get.mockReset().mockRejectedValueOnce(new Error('json_placeholder error'))
    const result = await sut.all()
    expect(result).toBeUndefined()
  })
})
