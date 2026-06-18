import { Platform } from './platform'

export interface StreamOptions {
  platform?: Platform
}

export interface StreamResult {
  streamUrl: string
  taskId: string
  platform: Platform
  expiresAt: number
  metadata?: StreamMetadata
}

export interface StreamMetadata {
  title: string
  artist: string
  album?: string
  duration?: number
  thumbnail?: string
}

export interface StreamStatus {
  taskId: string
  status: 'pending' | 'processing' | 'resolving' | 'downloading' | 'completed' | 'failed'
  progress?: number
  error?: string
  result?: StreamResult
}
