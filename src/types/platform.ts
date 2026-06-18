export type Platform = 'youtube-music' | 'lastfm' | 'soundcloud'

export type SearchProvider = 'youtube-music' | 'lastfm' | 'soundcloud'

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
}

export interface SearchResult {
  query: string
  provider: SearchProvider
  tracks: Track[]
  total: number
}
