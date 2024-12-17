import { describe, test, expect, jest } from '@jest/globals'
import axios from 'axios'
import AxiosHttpClient from '@/infra/gateways/axios-client'

jest.mock('axios')

interface AnyUnitTestType {
  any_property: string;
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
    test('should return data on success', async () => {
      const params = {
        url: 'http://any_url.com.br',
        params: {}
      }
      const result = await sut.get<AnyUnitTestType>(params)
      expect(result).toMatchObject({
        any_property: 'any_valid_value'
      })
    })
    test('should rethrow if get throws', async () => {
      const expected = new Error('http_error')
      fakeAxios.get.mockRejectedValueOnce(expected)
      const params = {
        url: 'http://any_url.com.br',
        params: {}
      }
      const promise = sut.get(params)
      await expect(promise).rejects.toThrow(expected)
    })
  })
})