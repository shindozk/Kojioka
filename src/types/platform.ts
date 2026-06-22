export type Platform = 'youtube-music' | 'lastfm' | 'soundcloud'

export type SearchProvider = 'youtube-music' | 'lastfm' | 'soundcloud'

export type SearchType = 'track' | 'artist'

export interface Track {
  id: string
  title: string
  artist: string
  platform?: Platform
  url?: string
  thumbnail?: string
  album?: string
  duration?: number
}

export interface SearchOptions {
  provider?: SearchProvider
  artist?: string
  type?: SearchType
  limit?: number
}

export interface SearchResult {
  query: string
  provider: SearchProvider
  tracks: Track[]
  total: number
  searchId: string
  sourcePlatform?: Platform
  fallbackPlatform?: Platform
}