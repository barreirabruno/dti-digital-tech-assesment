import axios from 'axios'
import type HttpGetClient from './get-http-client'
import type { HttpGetClientInput } from './get-http-client'

export default class AxiosHttpClient implements HttpGetClient {
  async get<T = unknown>(input: HttpGetClientInput): Promise<T> {
    const result = await axios.get(input.url, { params: input.params })
    return result.data
  }
}