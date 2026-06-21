<div align="center">

# Kojioka

<img src="https://i.imgur.com/6NCE3wJ.png" alt="Kojioka" width="200">

Official client for the [Kojioka Music Streaming API](https://kojioka-api.onrender.com).

[![npm version](https://img.shields.io/npm/v/kojioka.svg)](https://www.npmjs.com/package/kojioka)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Made in Brazil

</div>

## Features

- **Multi-platform**: YouTube Music (default), Last.fm & SoundCloud with automatic fallback
- **Smart matching**: Levenshtein scoring engine with multi-query search
- **ID-Search system**: Search once, pick any track by index later
- **Async downloads**: Non-blocking task queue with real-time progress tracking
- **TypeScript**: Full type definitions included
- **Dual format**: CommonJS + ESM support
- **Built-in retry**: Automatic retry with exponential backoff
- **Caching**: In-memory cache with configurable TTL
- **Streaming**: AES-256-CBC encrypted temporary URLs
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

// Search for music
const results = await client.searchMusic('lofi hip hop')
console.log(results.tracks[0].title)
console.log(results.searchId)

// Get a stream URL and wait for completion
const stream = await client.getStream('never gonna give you up')
const status = await client.waitForStream(stream.taskId, {
  onProgress: (s) => console.log(`[${s.status}] ${s.progress}%`),
})
console.log(status.result?.streamUrl)

// Check server status
const server = await client.getServerStatus()
console.log(`${server.cpu.usage}% CPU, ${server.memory.used} RAM`)
console.log(`Memory level: ${server.memoryLevel}`)
```

## Configuration

### `KojiokaClient(options?)`

```typescript
const client = new KojiokaClient({
  baseUrl: 'https://kojioka-api.onrender.com',  // API base URL
  timeout: 15000,                                 // Request timeout in ms
  logLevel: LogLevel.INFO,                        // Log verbosity
  cache: {
    maxSize: 500,                                 // Max cached entries
    defaultTtl: 300000,                           // Default TTL in ms (5 min)
  },
  retry: {
    maxAttempts: 3,                               // Max retry attempts
    baseDelay: 1000,                              // Base delay in ms
    maxDelay: 10000,                              // Max delay in ms
  },
})
```

## API Reference

### Search

```typescript
// Basic search (YouTube Music by default)
const results = await client.searchMusic('Bohemian Rhapsody')
// results: { query, provider, tracks[], total, searchId, sourcePlatform }

// Search with options
const results = await client.searchMusic('Queen', {
  provider: 'youtube-music',  // 'youtube-music' | 'lastfm' | 'soundcloud'
  type: 'artist',             // 'track' | 'artist'
  limit: 20,                  // 1-30
})

// Track: { id, title, artist, platform?, url?, thumbnail?, duration? }

// Retrieve cached results by search ID (expires after 30 min)
const cached = await client.getSearchById(results.searchId)
```

### Stream

```typescript
// Get a stream URL by query
const stream = await client.getStream('song name', {
  platform: 'youtube-music',  // 'youtube-music' | 'lastfm' | 'soundcloud'
})
// stream: { streamUrl: '', taskId, platform, expiresAt }

// Get a stream URL by search ID
const stream = await client.getStreamBySearchId(results.searchId, {
  index: 0,       // Track index from search results
  platform: 'youtube-music',
})

// Check task status
const status = await client.getStreamStatus(stream.taskId)
// status: { taskId, status, progress, error?, result?, trackInfo? }

// Wait for completion with progress callback
const result = await client.waitForStream(stream.taskId, {
  interval: 3000,        // Poll interval in ms (default: 3000)
  maxAttempts: 40,       // Max poll attempts (default: 40)
  onProgress: (status) => {
    console.log(`[${status.status}] ${status.progress}%`)
    if (status.trackInfo) {
      console.log(`${status.trackInfo.artist} - ${status.trackInfo.title}`)
    }
  },
})
console.log(result.result?.streamUrl)
```

### ID-Search Flow

Search once, pick any track later:

```typescript
// 1. Search for tracks
const search = await client.searchMusic('Bohemian Rhapsody')

// 2. Browse results
search.tracks.forEach((t, i) => {
  console.log(`${i}. ${t.title} — ${t.artist}`)
})

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
//   uptime: '5m 29s',
//   cpu: { model, cores, hostCores, usage, loadAverage },
//   memory: { total, used, free },
//   songsStorage: { count, size },
//   activeTasks: number,
//   activeDownloads: number,
//   memoryLevel: 'normal' | 'warning' | 'critical' | 'emergency',
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
  WaitForStreamOptions,
  StreamMetadata,
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
