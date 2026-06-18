import { HttpClient } from '../../core/http'
import { MemoryCache } from '../../core/cache'
import { Logger } from '../../core/logger'
import { ServerStatus } from '../../types'

export class StatusModule {
  private http: HttpClient
  private cache: MemoryCache
  private logger: Logger

  constructor(http: HttpClient, cache: MemoryCache, logger: Logger) {
    this.http = http
    this.cache = cache
    this.logger = logger
  }

  async getStatus(): Promise<ServerStatus> {
    const cacheKey = 'server:status'
    const cached = this.cache.get<ServerStatus>(cacheKey)
    if (cached) return cached

    this.logger.debug('Fetching server status')

    const { data } = await this.http.get<ServerStatus>('/status')
    this.cache.set(cacheKey, data, 10_000)
    return data
  }

  async isOnline(): Promise<boolean> {
    try {
      const status = await this.getStatus()
      return status.serverStatus === 'online'
    } catch {
      return false
    }
  }
}
