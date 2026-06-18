import { HttpClient } from '../core/http'
import { MemoryCache } from '../core/cache'
import { RetryManager } from '../core/retry'
import { ConsoleLogger, LogLevel, Logger } from '../core/logger'
import { SearchModule, StreamModule, StatusModule } from '../modules'
import { SearchOptions, SearchResult, StreamOptions, StreamResult, StreamStatus, ServerStatus, Platform } from '../types'

export interface KojiokaClientOptions {
  timeout?: number
  logLevel?: LogLevel
  logger?: Logger
  cache?: {
    maxSize?: number
    defaultTtl?: number
  }
  retry?: {
    maxAttempts?: number
    baseDelay?: number
    maxDelay?: number
  }
}

export class KojiokaClient {
  readonly search: SearchModule
  readonly stream: StreamModule
  readonly status: StatusModule

  private http: HttpClient
  private cache: MemoryCache
  private retry: RetryManager
  private logger: Logger

  constructor(options: KojiokaClientOptions = {}) {
    const baseUrl = 'https://kojioka-api.onrender.com'
    this.logger = options.logger ?? new ConsoleLogger(options.logLevel ?? LogLevel.INFO)

    this.http = new HttpClient(baseUrl, {
      timeout: options.timeout ?? 15_000,
      logger: this.logger,
    })

    this.cache = new MemoryCache({
      maxSize: options.cache?.maxSize ?? 500,
      defaultTtl: options.cache?.defaultTtl ?? 300_000,
    })

    this.retry = new RetryManager(
      {
        maxAttempts: options.retry?.maxAttempts ?? 3,
        baseDelay: options.retry?.baseDelay ?? 1000,
        maxDelay: options.retry?.maxDelay ?? 10_000,
      },
      this.logger
    )

    this.search = new SearchModule(this.http, this.cache, this.retry, this.logger)
    this.stream = new StreamModule(this.http, this.cache, this.retry, this.logger)
    this.status = new StatusModule(this.http, this.cache, this.logger)

    this.logger.info(`Kojioka client initialized → ${baseUrl}`)
  }

  async searchMusic(query: string, options?: SearchOptions): Promise<SearchResult> {
    return this.search.search(query, options)
  }

  async getSearchById(searchId: string): Promise<SearchResult> {
    return this.search.getSearchById(searchId)
  }

  async getStream(query: string, options?: StreamOptions): Promise<StreamResult> {
    return this.stream.getStreamUrl(query, options)
  }

  async getStreamBySearchId(searchId: string, options?: StreamOptions): Promise<StreamResult> {
    return this.stream.getStreamBySearchId(searchId, options)
  }

  async getStreamStatus(taskId: string): Promise<StreamStatus> {
    return this.stream.getStatus(taskId)
  }

  async waitForStream(taskId: string, options?: { interval?: number; maxAttempts?: number }): Promise<StreamStatus> {
    return this.stream.pollUntilComplete(taskId, options)
  }

  async getServerStatus(): Promise<ServerStatus> {
    return this.status.getStatus()
  }

  async isOnline(): Promise<boolean> {
    return this.status.isOnline()
  }

  clearCache(): void {
    this.cache.clear()
    this.logger.debug('Cache cleared')
  }
}
