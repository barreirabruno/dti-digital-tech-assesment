export default interface HttpGetClient {
  get: <T = unknown> (input: HttpGetClientInput) => Promise<T>
}

export type HttpGetClientInput = {
  url: string,
  params: object
}
