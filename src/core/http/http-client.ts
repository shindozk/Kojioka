import { KojiokaError } from '../errors'
import { Logger } from '../logger'

export interface HttpRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  headers?: Record<string, string>
  body?: unknown
  timeout?: number
}

export interface HttpResponse<T = unknown> {
  data: T
  status: number
  headers: Record<string, string>
}

export class HttpClient {
  private baseUrl: string
  private defaultHeaders: Record<string, string>
  private timeout: number
  private logger: Logger

  constructor(baseUrl: string, options: { timeout?: number; headers?: Record<string, string>; logger?: Logger } = {}) {
    this.baseUrl = baseUrl.replace(/\/$/, '')
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'User-Agent': 'Kojioka-JS-Client/2.7.5',
      ...options.headers,
    }
    this.timeout = options.timeout ?? 15_000
    this.logger = options.logger ?? { debug: () => {}, info: () => {}, warn: () => {}, error: () => {} }
  }

  async request<T>(path: string, options: HttpRequestOptions = {}): Promise<HttpResponse<T>> {
    const url = `${this.baseUrl}${path}`
    const method = options.method ?? 'GET'
    const timeout = options.timeout ?? this.timeout

    this.logger.debug(`${method} ${url}`)

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(url, {
        method,
        headers: { ...this.defaultHeaders, ...options.headers },
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
      })

      clearTimeout(timer)

      const headers: Record<string, string> = {}
      response.headers.forEach((value, key) => {
        headers[key] = value
      })

      let data: T
      const contentType = headers['content-type'] ?? ''
      if (contentType.includes('application/json')) {
        data = (await response.json()) as T
      } else {
        data = (await response.text()) as unknown as T
      }

      if (!response.ok) {
        if (response.status === 429) {
          throw KojiokaError.rateLimited('Rate limited by server', {
            endpoint: path,
            statusCode: response.status,
          })
        }
        if (response.status === 404) {
          throw KojiokaError.notFound(`Not found: ${path}`, {
            endpoint: path,
            statusCode: response.status,
          })
        }
        throw KojiokaError.networkError(`HTTP ${response.status}: ${response.statusText}`, {
          endpoint: path,
          statusCode: response.status,
        })
      }

      return { data, status: response.status, headers }
    } catch (error) {
      clearTimeout(timer)

      if (error instanceof KojiokaError) {
        throw error
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw KojiokaError.timeout(`Request timed out after ${timeout}ms`, { endpoint: path })
        }
        throw KojiokaError.networkError(error.message, { endpoint: path })
      }

      throw KojiokaError.networkError('Unknown network error', { endpoint: path })
    }
  }

  async get<T>(path: string, options?: HttpRequestOptions): Promise<HttpResponse<T>> {
    return this.request<T>(path, { ...options, method: 'GET' })
  }

  async post<T>(path: string, body?: unknown, options?: HttpRequestOptions): Promise<HttpResponse<T>> {
    return this.request<T>(path, { ...options, method: 'POST', body })
  }
}
