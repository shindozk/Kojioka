import {
  Platform,
  Track,
  SearchOptions,
  SearchResult,
  StreamOptions,
  StreamResult,
  StreamStatus,
  WaitForStreamOptions,
  ServerStatus,
  KojiokaError,
  ErrorCode,
} from './types'

export type {
  Platform,
  Track,
  SearchOptions,
  SearchResult,
  StreamOptions,
  StreamResult,
  StreamStatus,
  WaitForStreamOptions,
  ServerStatus,
  ErrorCode,
}

export { KojiokaError }

export interface KojiokaOptions {
  baseUrl?: string
  timeout?: number
}

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

export class KojiokaClient {
  private baseUrl: string
  private timeout: number

  constructor(options: KojiokaOptions = {}) {
    this.baseUrl = (options.baseUrl ?? 'https://kojioka-api.onrender.com').replace(/\/$/, '')
    this.timeout = options.timeout ?? 15_000
  }

  // ─── Search ─────────────────────────────────────────────

  async search(query: string, options: SearchOptions = {}): Promise<SearchResult> {
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

  // ─── Stream ─────────────────────────────────────────────

  async getStream(query: string, options: StreamOptions = {}): Promise<StreamResult> {
    const params = new URLSearchParams({ q: query })
    if (options.artist) params.set('artist', options.artist)
    if (options.platform) params.set('platform', options.platform)

    const data = await this.get<ApiStreamResponse>(`/api/audio/get-stream?${params}`)
    return {
      taskId: data.taskId,
      streamUrl: '',
      platform: options.platform ?? 'youtube-music',
      expiresAt: Date.now() + 3_600_000,
    }
  }

  async getStreamBySearchId(searchId: string, options: StreamOptions = {}): Promise<StreamResult> {
    const params = new URLSearchParams({ id: searchId })
    if (options.platform) params.set('platform', options.platform)

    const data = await this.get<ApiStreamResponse>(`/api/audio/get-stream?${params}`)
    return {
      taskId: data.taskId,
      streamUrl: '',
      platform: options.platform ?? 'youtube-music',
      expiresAt: Date.now() + 3_600_000,
    }
  }

  async getStreamStatus(taskId: string): Promise<StreamStatus> {
    const data = await this.get<ApiStatusResponse>(`/api/audio/status/${taskId}`)
    return {
      taskId,
      status: data.status as StreamStatus['status'],
      progress: data.progress,
      error: data.error,
      trackInfo: data.trackInfo,
      result: data.result
        ? {
            taskId,
            streamUrl: data.result.streamUrl,
            platform: (data.trackInfo?.platform as Platform) ?? 'youtube-music',
            expiresAt: Date.now() + 3_600_000,
            trackInfo: data.trackInfo,
          }
        : undefined,
    }
  }

  async waitForStream(taskId: string, options: WaitForStreamOptions = {}): Promise<StreamStatus> {
    const interval = options.interval ?? 3000
    const maxAttempts = options.maxAttempts ?? 40

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const status = await this.getStreamStatus(taskId)
      options.onProgress?.(status)
      if (status.status === 'completed') return status
      if (status.status === 'failed') {
        throw KojiokaError.streamFailed(status.error ?? 'Stream failed', { taskId })
      }
      await this.sleep(interval)
    }

    throw KojiokaError.timeout(`Stream timed out after ${maxAttempts} attempts`, { taskId })
  }

  // ─── Server Status ──────────────────────────────────────

  async getServerStatus(): Promise<ServerStatus> {
    return this.get<ServerStatus>('/status')
  }

  async isOnline(): Promise<boolean> {
    try {
      const status = await this.getServerStatus()
      return status.serverStatus === 'online'
    } catch {
      return false
    }
  }

  // ─── Cookies ────────────────────────────────────────────

  async getCookieStatus(): Promise<{ exists: boolean; valid: boolean; size: number; expiresAt: string | null; domain: string | null }> {
    return this.get('/api/kojioka/cookie-status')
  }

  async uploadCookies(cookies: string): Promise<{ message: string }> {
    return this.post('/api/kojioka/upload-cookies', { cookies })
  }

  // ─── Internal ───────────────────────────────────────────

  private async get<T>(path: string): Promise<T> {
    const url = `${this.baseUrl}${path}`
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), this.timeout)

    try {
      const res = await fetch(url, { signal: controller.signal })
      clearTimeout(timer)

      if (!res.ok) {
        if (res.status === 429) throw KojiokaError.rateLimited('Rate limited', { path, status: res.status })
        if (res.status === 404) throw KojiokaError.notFound(`Not found: ${path}`, { path, status: res.status })
        throw KojiokaError.networkError(`HTTP ${res.status}`, { path, status: res.status })
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
        throw KojiokaError.networkError((data.error as string) ?? `HTTP ${res.status}`, { path, status: res.status })
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
