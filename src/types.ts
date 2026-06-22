export type Platform = 'youtube-music' | 'lastfm' | 'soundcloud'

export interface Track {
  id: string
  title: string
  artist: string
  platform?: Platform
  url?: string
  thumbnail?: string
  duration?: number
}

export interface SearchOptions {
  platform?: Platform
  artist?: string
  limit?: number
}

export interface SearchResult {
  query: string
  platform: Platform
  tracks: Track[]
  total: number
  searchId: string
  sourcePlatform?: Platform
  fallbackPlatform?: Platform
}

export interface StreamOptions {
  platform?: Platform
  artist?: string
}

export interface StreamResult {
  taskId: string
  streamUrl: string
  platform: Platform
  expiresAt: number
  trackInfo?: Track
}

export interface StreamStatus {
  taskId: string
  status: 'pending' | 'processing' | 'resolving' | 'downloading' | 'completed' | 'failed'
  progress?: number
  error?: string
  result?: StreamResult
  trackInfo?: Track
}

export interface WaitForStreamOptions {
  interval?: number
  maxAttempts?: number
  onProgress?: (status: StreamStatus) => void
}

export interface ServerStatus {
  serverStatus: 'online' | 'offline'
  uptime: string
  cpu: {
    model: string
    cores: number
    hostCores: number
    usage: number
    loadAverage: number[]
  }
  memory: { total: string; used: string; free: string }
  disk: { total: number; free: number; used: number }
  songsStorage: { count: number; size: string }
  activeTasks: number
  activeDownloads: number
  memoryLevel: string
}

export type ErrorCode =
  | 'NETWORK_ERROR'
  | 'TIMEOUT'
  | 'RATE_LIMITED'
  | 'NOT_FOUND'
  | 'INVALID_RESPONSE'
  | 'STREAM_FAILED'
  | 'VALIDATION_ERROR'

export class KojiokaError extends Error {
  readonly code: ErrorCode
  readonly context: Record<string, unknown>
  readonly isRetryable: boolean

  constructor(message: string, code: ErrorCode, context: Record<string, unknown> = {}, isRetryable = false) {
    super(message)
    this.name = 'KojiokaError'
    this.code = code
    this.context = context
    this.isRetryable = isRetryable
  }

  static networkError(msg: string, ctx?: Record<string, unknown>) {
    return new KojiokaError(msg, 'NETWORK_ERROR', ctx, true)
  }

  static timeout(msg: string, ctx?: Record<string, unknown>) {
    return new KojiokaError(msg, 'TIMEOUT', ctx, true)
  }

  static rateLimited(msg: string, ctx?: Record<string, unknown>) {
    return new KojiokaError(msg, 'RATE_LIMITED', ctx, true)
  }

  static notFound(msg: string, ctx?: Record<string, unknown>) {
    return new KojiokaError(msg, 'NOT_FOUND', ctx, false)
  }

  static streamFailed(msg: string, ctx?: Record<string, unknown>) {
    return new KojiokaError(msg, 'STREAM_FAILED', ctx, true)
  }
}
