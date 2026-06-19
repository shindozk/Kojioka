<div align="center">

# Kojioka

<img src="https://i.imgur.com/6NCE3wJ.png" alt="Kojioka" width="200">

Official client for the [Kojioka Music Streaming API](https://kojioka-api.onrender.com).

[![npm version](https://img.shields.io/npm/v/kojioka.svg)](https://www.npmjs.com/package/kojioka)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Made in Brazil 😎

</div>

## Features

- **Multi-platform**: YouTube Music (default), Last.fm & SoundCloud search and streaming
- **ID-Search system**: Search once, pick any track by index later
- **Artist search**: Find top tracks from any artist
- **TypeScript**: Full type definitions included
- **Dual format**: CommonJS + ESM support
- **Built-in retry**: Automatic retry with exponential backoff
- **Caching**: In-memory cache with configurable TTL
- **Streaming**: AES-256 encrypted temporary URLs
- **Error handling**: Typed errors with retryable flags
- **Logging**: Configurable log levels

## Install

```bash
npm install kojioka
```

## Quick Start

```typescript
import { KojiokaClient } from 'kojioka'

const client = new KojiokaClient()

// Search for music (returns up to 20 by default, max 30)
const results = await client.searchMusic('lofi hip hop')
console.log(results.tracks[0].title) // 'lofi hip hop radio...'
console.log(results.searchId)        // '260e8892-0530-4d5c-...'

// Get a stream URL using the search ID
const stream = await client.getStreamBySearchId(results.searchId, { index: 0 })
console.log(stream.taskId) // 'a1b2c3d4-e5f6-...'

// Wait for the stream to be ready
const status = await client.waitForStream(stream.taskId)
console.log(status.result?.streamUrl) // 'https://kojioka-api.onrender.com/songs/...'

// Search for an artist
const artist = await client.searchMusic('Queen', { type: 'artist' })
console.log(artist.tracks.length) // 10 tracks

// Check server status
const server = await client.getServerStatus()
console.log(`${server.cpu.usage}% CPU, ${server.memory.used} RAM`)

// Check if API is online
const online = await client.isOnline()
console.log(online) // true
```

## Configuration

### `KojiokaClient(options?)`

```typescript
const client = new KojiokaClient({
  timeout: 15000,                             // Request timeout in ms (default: 15000)
  logLevel: LogLevel.INFO,                    // Log verbosity (default: INFO)
  cache: {
    maxSize: 500,                             // Max cached entries (default: 500)
    defaultTtl: 300000,                       // Default TTL in ms (default: 5 min)
  },
  retry: {
    maxAttempts: 3,                           // Max retry attempts (default: 3)
    baseDelay: 1000,                          // Base delay in ms (default: 1000)
    maxDelay: 10000,                          // Max delay in ms (default: 10000)
  },
})
```

## API Reference

### Search

```typescript
// Basic search (YouTube Music by default, returns up to 20 results)
const results = await client.searchMusic('Bohemian Rhapsody')
// results: { query, provider, tracks: Track[], total, searchId }

// Search with options
const results = await client.searchMusic('Queen', {
  provider: 'youtube-music',  // 'youtube-music' (default) | 'lastfm' | 'soundcloud'
  type: 'artist',             // 'track' (default) | 'artist'
  limit: 20,                  // 1-30 (default: 20)
})

// Track: { id, title, artist, album?, duration?, thumbnail?, platform, url? }

// Retrieve cached results by search ID
const cached = await client.getSearchById(results.searchId)
```

### Stream

```typescript
// Get a stream URL by query (triggers download on server)
const stream = await client.getStream('song name', {
  platform: 'youtube-music',  // 'youtube-music' (default) | 'lastfm' | 'soundcloud'
})

// Get a stream URL by search ID (picks specific track from search results)
const stream = await client.getStreamBySearchId(results.searchId, {
  index: 0,       // Track index from search results (default: 0)
  platform: 'youtube-music',
})

// stream: { streamUrl, taskId, platform, expiresAt, metadata? }

// Check task status
const status = await client.getStreamStatus(stream.taskId)
// status: { taskId, status: 'pending'|'processing'|'completed'|'failed', progress?, error? }

// Wait for completion (polls every 2s, max 30 attempts)
const result = await client.waitForStream(stream.taskId, {
  interval: 2000,        // Poll interval in ms
  maxAttempts: 30,       // Max poll attempts
})
```

### ID-Search Flow

The ID-Search system lets you search once and pick any track later:

```typescript
// 1. Search for tracks
const search = await client.searchMusic('Bohemian Rhapsody')

// 2. Browse results
search.tracks.forEach((t, i) => {
  console.log(`${i}. ${t.title} — ${t.artist}`)
})
// 0. Queen – Bohemian Rhapsody (Official Video) — Queen Official
// 1. Queen - Bohemian Rhapsody (Lyrics) — 7clouds Rock
// ...

// 3. Pick track by index
const stream = await client.getStreamBySearchId(search.searchId, { index: 0 })
const result = await client.waitForStream(stream.taskId)
console.log(result.result?.streamUrl)
```

### Server Status

```typescript
const status = await client.getServerStatus()
// status: {
//   serverStatus: 'online',
//   uptime: '2h 15m',
//   cpu: { model, cores, hostCores, usage, loadAverage },
//   memory: { total, used, free },
//   songsStorage: { count, size },
//   activeTasks: number,
// }

const online = await client.isOnline() // boolean
```

### Cache

```typescript
client.clearCache() // Clears all cached data
```

## Types

All types are exported from the package:

```typescript
import type {
  Track,
  SearchOptions,
  SearchResult,
  StreamOptions,
  StreamResult,
  StreamStatus,
  ServerStatus,
  CpuInfo,
  MemoryInfo,
  Platform,
  SearchProvider,
  SearchType,
} from 'kojioka'
```

## Error Handling

```typescript
import { KojiokaError, ErrorCode } from 'kojioka'

try {
  await client.searchMusic('test')
} catch (error) {
  if (error instanceof KojiokaError) {
    console.log(error.code)          // ErrorCode.NETWORK_ERROR
    console.log(error.isRetryable)   // true
    console.log(error.context)       // { endpoint: '/api/audio/search', statusCode: 500 }
  }
}
```

## Project Structure

```
src/
├── client/              # KojiokaClient (main entry point)
├── core/
│   ├── errors/          # KojiokaError + ErrorCode enum
│   ├── http/            # HttpClient (fetch wrapper)
│   ├── logger/          # ConsoleLogger, NoopLogger
│   ├── cache/           # MemoryCache with TTL
│   └── retry/           # RetryManager with exponential backoff
├── modules/
│   ├── audio/           # SearchModule + StreamModule
│   └── status/          # StatusModule
└── types/               # TypeScript type definitions
```

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build (CJS + ESM + types)
npm run build

# Type check
npm run lint
```

## License

MIT

---

## Support

If you find Kojioka useful, consider supporting the project:

[![Ko-fi](https://img.shields.io/badge/Support%20on-Ko--fi-FF5E5B?logo=ko-fi&logoColor=white)](https://ko-fi.com/shindozk)

---

## Documentation

For full API documentation, visit: **[Kojioka Documentation](https://kojioka-app.vercel.app)**
