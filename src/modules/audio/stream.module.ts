import { HttpClient } from '../../core/http'
import { MemoryCache } from '../../core/cache'
import { RetryManager } from '../../core/retry'
import { Logger } from '../../core/logger'
import { StreamOptions, StreamResult, StreamStatus, WaitForStreamOptions, Platform } from '../../types'

interface ApiStreamResponse {
  success: boolean
  taskId: string
  message: string
  statusUrl: string
}

interface ApiStatusResponse {
  success: boolean
  status: string
  progress: number
  result?: { streamUrl: string; message: string }
  error?: string
  trackInfo?: { id: string; title: string; artist: string; platform?: string; url?: string; thumbnail?: string; album?: string; duration?: number }
}

export class StreamModule {
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

  async getStreamUrl(query: string, options: StreamOptions = {}): Promise<StreamResult> {
    this.logger.info(`Getting stream for: ${query}`)

    const result = await this.retry.execute(() => this.fetchStream(query, options))
    return result
  }

  async getStreamBySearchId(searchId: string, options: StreamOptions = {}): Promise<StreamResult> {
    this.logger.info(`Getting stream by search ID: ${searchId}`)

    const result = await this.retry.execute(() => this.fetchStreamById(searchId, options))
    return result
  }

  async getStatus(taskId: string): Promise<StreamStatus> {
    const { data } = await this.http.get<ApiStatusResponse>(`/api/audio/status/${taskId}`)

    return {
      taskId,
      status: data.status as StreamStatus['status'],
      progress: data.progress,
      error: data.error,
      trackInfo: data.trackInfo ? {
        title: data.trackInfo.title,
        artist: data.trackInfo.artist,
        album: data.trackInfo.album,
        duration: data.trackInfo.duration,
        thumbnail: data.trackInfo.thumbnail,
      } : undefined,
      result: data.result ? {
        streamUrl: data.result.streamUrl,
        taskId,
        platform: (data.trackInfo?.platform as Platform) ?? 'youtube-music',
        expiresAt: Date.now() + 3600_000,
        metadata: data.trackInfo ? {
          title: data.trackInfo.title,
          artist: data.trackInfo.artist,
          album: data.trackInfo.album,
          duration: data.trackInfo.duration,
          thumbnail: data.trackInfo.thumbnail,
        } : undefined,
      } : undefined,
    }
  }

  async pollUntilComplete(taskId: string, options: WaitForStreamOptions = {}): Promise<StreamStatus> {
    const interval = options.interval ?? 3000
    const maxAttempts = options.maxAttempts ?? 40

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const status = await this.getStatus(taskId)

      if (options.onProgress) {
        options.onProgress(status)
      }

      if (status.status === 'completed') return status
      if (status.status === 'failed') {
        throw new Error(status.error ?? 'Stream processing failed')
      }

      this.logger.debug(`Task ${taskId}: ${status.status} ${status.progress ?? 0}% (${attempt + 1}/${maxAttempts})`)
      await this.sleep(interval)
    }

    throw new Error(`Task ${taskId} timed out after ${maxAttempts} attempts`)
  }

  private async fetchStream(query: string, options: StreamOptions): Promise<StreamResult> {
    const params = new URLSearchParams({ q: query })
    if (options.artist) params.set('artist', options.artist)
    if (options.platform) params.set('platform', options.platform)

    const { data } = await this.http.get<ApiStreamResponse>(`/api/audio/get-stream?${params}`)

    return {
      streamUrl: '',
      taskId: data.taskId,
      platform: options.platform ?? 'youtube-music',
      expiresAt: Date.now() + 3600_000,
    }
  }

  private async fetchStreamById(searchId: string, options: StreamOptions): Promise<StreamResult> {
    const params = new URLSearchParams({ id: searchId })
    if (options.platform) params.set('platform', options.platform)
    if (options.index !== undefined) params.set('index', String(options.index))

    const { data } = await this.http.get<ApiStreamResponse>(`/api/audio/get-stream?${params}`)

    return {
      streamUrl: '',
      taskId: data.taskId,
      platform: options.platform ?? 'youtube-music',
      expiresAt: Date.now() + 3600_000,
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
