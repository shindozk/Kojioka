import {
  Platform,
  Track,
  SearchOptions,
  SearchResult,
  StreamStatus,
  ServerStatus,
  KojiokaError,
  ErrorCode,
} from './types'

export type {
  Platform,
  Track,
  SearchOptions,
  SearchResult,
  StreamStatus,
  ServerStatus,
  ErrorCode,
}

export { KojiokaError }

// ─── Options ──────────────────────────────────────────────

export interface KojiokaOptions {
  baseUrl?: string
  timeout?: number
}

export interface DownloadOptions {
  platform?: Platform
  artist?: string
  quality?: '128' | '192' | '256' | '320'
  format?: 'mp3' | 'm4a' | 'ogg' | 'flac' | 'opus' | 'mp4'
  onProgress?: (status: StreamStatus) => void
  interval?: number
  maxAttempts?: number
}

export interface PlaylistOptions {
  platform?: Platform
  quality?: '128' | '192' | '256' | '320'
  format?: 'mp3' | 'm4a' | 'ogg' | 'flac' | 'opus' | 'mp4'
  onProgress?: (status: StreamStatus) => void
}

export interface SearchOptionsExtended extends SearchOptions {
  artist?: string
  limit?: number
  platform?: Platform
}

// ─── Internal Types ───────────────────────────────────────

interface ApiSearchResponse {
  success: boolean
  tracks: Track[]
  platform: Platform
  query: string
  searchId: string
  total?: number
  sourcePlatform?: Platform
  fallbackPlatform?: Platform
}

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
  trackInfo?: Track
}

// ─── Kojioka Client ───────────────────────────────────────

export class Kojioka {
  private baseUrl: string
  private timeout: number

  constructor(options: KojiokaOptions = {}) {
    this.baseUrl = (options.baseUrl ?? 'https://kojioka-api.onrender.com').replace(/\/$/, '')
    this.timeout = options.timeout ?? 15_000
  }

  /**
   * Search for tracks across platforms.
   *
   * @example
   * const results = await kojioka.search('bohemian rhapsody')
   * const results = await kojioka.search('never back down', { artist: 'neffex' })
   */
  async search(query: string, options: SearchOptionsExtended = {}): Promise<SearchResult> {
    const params = new URLSearchParams({ q: query })
    if (options.artist) params.set('artist', options.artist)
    if (options.platform) params.set('platform', options.platform)
    if (options.limit) params.set('limit', String(options.limit))

    const data = await this.get<ApiSearchResponse>(`/api/audio/search?${params}`)
    return {
      query: data.query ?? query,
      platform: data.platform ?? 'youtube-music',
      tracks: data.tracks ?? [],
      total: data.total ?? (data.tracks ?? []).length,
      searchId: data.searchId ?? '',
      sourcePlatform: data.sourcePlatform,
      fallbackPlatform: data.fallbackPlatform,
    }
  }

  /**
   * Download a track and wait for completion.
   * Returns the final StreamStatus with streamUrl when done.
   *
   * @example
   * // Simple - just download
   * const result = await kojioka.download('never back down', { artist: 'neffex' })
   * console.log(result.streamUrl)
   *
   * // With progress
   * const result = await kojioka.download('never back down', {
   *   onProgress: (s) => console.log(`${s.progress}% - ${s.trackInfo?.artist}`)
   * })
   *
   * // From a search result
   * const search = await kojioka.search('queen')
   * const result = await kojioka.download(search.tracks[0])
   */
  async download(trackOrQuery: string | Track, options: DownloadOptions = {}): Promise<StreamStatus> {
    const query = typeof trackOrQuery === 'string'
      ? trackOrQuery
      : trackOrQuery.title

    const artist = typeof trackOrQuery === 'object'
      ? trackOrQuery.artist
      : options.artist

    const params = new URLSearchParams({ q: query })
    if (artist) params.set('artist', artist)
    if (options.platform) params.set('platform', options.platform)
    if (options.quality) params.set('quality', options.quality)
    if (options.format) params.set('format', options.format)

    const data = await this.get<ApiStreamResponse>(`/api/audio/get-stream?${params}`)
    return this.pollTask(data.taskId, options)
  }

  /**
   * Download a video (MP4).
   */
  async downloadVideo(trackOrQuery: string | Track, options: Omit<DownloadOptions, 'format'> = {}): Promise<StreamStatus> {
    return this.download(trackOrQuery, { ...options, format: 'mp4' })
  }

  /**
   * Download all tracks from a YouTube Music playlist.
   *
   * @example
   * const result = await kojioka.downloadPlaylist('https://music.youtube.com/playlist?list=PLxxxx')
   */
  async downloadPlaylist(playlistUrl: string, options: PlaylistOptions = {}): Promise<StreamStatus> {
    const params = new URLSearchParams({ url: playlistUrl })
    if (options.platform) params.set('platform', options.platform)
    if (options.quality) params.set('quality', options.quality)
    if (options.format) params.set('format', options.format)

    const data = await this.get<ApiStreamResponse>(`/api/audio/get-playlist?${params}`)
    return this.pollTask(data.taskId, { ...options, onProgress: options.onProgress })
  }

  /**
   * Create a stream task without waiting for completion.
   * Use stream.complete() to wait, or stream.status() to check progress.
   *
   * @example
   * const stream = await kojioka.stream('never back down', { artist: 'neffex' })
   * console.log(stream.taskId)
   * const result = await stream.complete()
   * console.log(result.streamUrl)
   */
  async stream(query: string, options: Omit<DownloadOptions, 'onProgress'> = {}): Promise<StreamTask> {
    const params = new URLSearchParams({ q: query })
    if (options.artist) params.set('artist', options.artist)
    if (options.platform) params.set('platform', options.platform)

    const data = await this.get<ApiStreamResponse>(`/api/audio/get-stream?${params}`)

    return new StreamTask(this, data.taskId, options)
  }

  /**
   * Get server status.
   *
   * @example
   * const status = await kojioka.status()
   * console.log(`${status.memory.used} / ${status.memory.total}`)
   */
  async status(): Promise<ServerStatus> {
    return this.get<ServerStatus>('/status')
  }

  /**
   * Check if the API is online.
   */
  async isOnline(): Promise<boolean> {
    try {
      const s = await this.status()
      return s.serverStatus === 'online'
    } catch {
      return false
    }
  }

  /**
   * Get YouTube cookie status.
   */
  async cookieStatus(): Promise<{ exists: boolean; valid: boolean; size: number; expiresAt: string | null; domain: string | null }> {
    return this.get('/api/kojioka/cookie-status')
  }

  /**
   * Upload YouTube cookies.
   */
  async uploadCookies(cookies: string): Promise<{ message: string }> {
    return this.post('/api/kojioka/upload-cookies', { cookies })
  }

  // ─── Internal ───────────────────────────────────────────

  private async pollTask(taskId: string, options: DownloadOptions): Promise<StreamStatus> {
    const interval = options.interval ?? 3000
    const maxAttempts = options.maxAttempts ?? 40

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const data = await this.get<ApiStatusResponse>(`/api/audio/status/${taskId}`)
      const status: StreamStatus = {
        taskId,
        status: data.status as StreamStatus['status'],
        progress: data.progress,
        error: data.error,
        trackInfo: data.trackInfo,
        result: data.result
          ? { taskId, streamUrl: data.result.streamUrl, platform: (data.trackInfo?.platform as Platform) ?? 'youtube-music', expiresAt: Date.now() + 3_600_000, trackInfo: data.trackInfo }
          : undefined,
      }

      options.onProgress?.(status)

      if (status.status === 'completed') return status
      if (status.status === 'failed') {
        throw KojiokaError.streamFailed(status.error ?? 'Stream failed', { taskId })
      }

      await this.sleep(interval)
    }

    throw KojiokaError.timeout(`Stream timed out after ${maxAttempts} attempts`, { taskId })
  }

  private async get<T>(path: string): Promise<T> {
    const url = `${this.baseUrl}${path}`
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), this.timeout)

    try {
      const res = await fetch(url, { signal: controller.signal })
      clearTimeout(timer)
      if (!res.ok) {
        if (res.status === 429) throw KojiokaError.rateLimited('Rate limited', { path })
        if (res.status === 404) throw KojiokaError.notFound(`Not found: ${path}`, { path })
        throw KojiokaError.networkError(`HTTP ${res.status}`, { path })
      }
      return res.json() as Promise<T>
    } catch (err) {
      clearTimeout(timer)
      if (err instanceof KojiokaError) throw err
      if (err instanceof Error) {
        if (err.name === 'AbortError') throw KojiokaError.timeout(`Timeout after ${this.timeout}ms`, { path })
        throw KojiokaError.networkError(err.message, { path })
      }
      throw KojiokaError.networkError('Unknown error', { path })
    }
  }

  private async post<T>(path: string, body: unknown): Promise<T> {
    const url = `${this.baseUrl}${path}`
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), this.timeout)

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      })
      clearTimeout(timer)
      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as Record<string, unknown>
        throw KojiokaError.networkError((data.error as string) ?? `HTTP ${res.status}`, { path })
      }
      return res.json() as Promise<T>
    } catch (err) {
      clearTimeout(timer)
      if (err instanceof KojiokaError) throw err
      if (err instanceof Error) {
        if (err.name === 'AbortError') throw KojiokaError.timeout(`Timeout after ${this.timeout}ms`, { path })
        throw KojiokaError.networkError(err.message, { path })
      }
      throw KojiokaError.networkError('Unknown error', { path })
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

// ─── Stream Task ──────────────────────────────────────────

export class StreamTask {
  readonly taskId: string
  private client: Kojioka
  private opts: Omit<DownloadOptions, 'onProgress'>

  constructor(client: Kojioka, taskId: string, opts: Omit<DownloadOptions, 'onProgress'> = {}) {
    this.client = client
    this.taskId = taskId
    this.opts = opts
  }

  /**
   * Wait for the download to complete.
   *
   * @example
   * const result = await stream.complete()
   * console.log(result.streamUrl)
   */
  async complete(options?: { interval?: number; maxAttempts?: number; onProgress?: (status: StreamStatus) => void }): Promise<StreamStatus> {
    const interval = options?.interval ?? 3000
    const maxAttempts = options?.maxAttempts ?? 40
    const onProgress = options?.onProgress

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const data = await this.client['get']<ApiStatusResponse>(`/api/audio/status/${this.taskId}`)
      const status: StreamStatus = {
        taskId: this.taskId,
        status: data.status as StreamStatus['status'],
        progress: data.progress,
        error: data.error,
        trackInfo: data.trackInfo,
        result: data.result
          ? { taskId: this.taskId, streamUrl: data.result.streamUrl, platform: (data.trackInfo?.platform as Platform) ?? 'youtube-music', expiresAt: Date.now() + 3_600_000, trackInfo: data.trackInfo }
          : undefined,
      }

      onProgress?.(status)

      if (status.status === 'completed') return status
      if (status.status === 'failed') {
        throw KojiokaError.streamFailed(status.error ?? 'Stream failed', { taskId: this.taskId })
      }

      await new Promise((r) => setTimeout(r, interval))
    }

    throw KojiokaError.timeout(`Stream timed out after ${maxAttempts} attempts`, { taskId: this.taskId })
  }

  /**
   * Check current status without waiting.
   */
  async status(): Promise<StreamStatus> {
    return this.client['pollTask'](this.taskId, this.opts) as Promise<StreamStatus>
  }
}
