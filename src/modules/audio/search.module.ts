import { HttpClient } from '../../core/http'
import { MemoryCache } from '../../core/cache'
import { RetryManager } from '../../core/retry'
import { Logger } from '../../core/logger'
import { Track, SearchOptions, SearchResult, Platform } from '../../types'

interface ApiSearchResponse {
  success: boolean
  tracks: Track[]
  platform: Platform
  query: string
}

export class SearchModule {
  private http: HttpClient
  private cache: MemoryCache
  private retry: RetryManager
  private logger: Logger

  constructor(http: HttpClient, cache: MemoryCache, retry: RetryManager, logger: Logger) {
    this.http = http
    this.cache = cache
    this.retry = retry
    this.logger = logger
  }

  async search(query: string, options: SearchOptions = {}): Promise<SearchResult> {
    const provider = options.provider ?? 'lastfm'
    const cacheKey = `search:${provider}:${query}`

    const cached = this.cache.get<SearchResult>(cacheKey)
    if (cached) {
      this.logger.debug(`Cache hit for search: ${query}`)
      return cached
    }

    this.logger.info(`Searching "${query}" on ${provider}`)

    const result = await this.retry.execute(() => this.fetchSearch(query, provider))

    this.cache.set(cacheKey, result, 60_000)
    return result
  }

  private async fetchSearch(query: string, provider: Platform): Promise<SearchResult> {
    const params = new URLSearchParams({ q: query })
    if (provider) params.set('platform', provider)

    const { data } = await this.http.get<ApiSearchResponse>(`/api/audio/search?${params}`)

    return {
      query: data.query ?? query,
      provider: data.platform ?? provider,
      tracks: data.tracks ?? [],
      total: (data.tracks ?? []).length,
    }
  }
}
