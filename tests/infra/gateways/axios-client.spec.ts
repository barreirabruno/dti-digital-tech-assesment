import { describe, test, expect, jest } from '@jest/globals'
import axios from 'axios'

jest.mock('axios')

interface HttpGetClient {
  get: <T = unknown> (input: HttpGetClientInput) => Promise<T>
}

type HttpGetClientInput = {
  url: string,
  params: object
}

class AxiosHttpClient implements HttpGetClient {
  async get<T = unknown>(input: HttpGetClientInput): Promise<T> {
    const result = await axios.get(input.url, { params: input.params })
    return result.data
  }
}


describe('Axios http client', () => {
  let fakeAxios: jest.Mocked<typeof axios>
  let sut: AxiosHttpClient

  beforeAll(() => {
    fakeAxios = axios as jest.Mocked<typeof axios>
    fakeAxios.get.mockResolvedValue({
      statusCode: 200,
      data: {
        any_property: 'any_valid_value'
      }
    })
  })

  beforeEach(() => {
    sut = new AxiosHttpClient()
  })

  describe('get', () => {
    test('should call get with correct input', async () => {
      interface AnyUnitTestType {
        any_property: string;
      }
      const spyAxios = jest.spyOn(sut, 'get')
      const params = {
        url: 'http://any_url.com.br',
        params: {}
      }
      await sut.get<AnyUnitTestType>(params)
      expect(spyAxios).toHaveBeenCalled()
      expect(spyAxios).toHaveBeenCalledTimes(1)
      expect(spyAxios).toHaveBeenCalledWith({
        url: params.url,
        params: params.params
      })
    })
    test.todo('should return data on success')
    test.todo('should rethrow if get throws')
  })
})