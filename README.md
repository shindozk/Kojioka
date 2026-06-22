<div align="center">

# Kojioka

<img src="https://i.imgur.com/6NCE3wJ.png" alt="Kojioka" width="200">

Official client for the [Kojioka Music Streaming API](https://kojioka-api.onrender.com).

[![npm version](https://img.shields.io/npm/v/kojioka.svg)](https://www.npmjs.com/package/kojioka)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Made in Brazil

</div>

## Features

- **Multi-platform**: YouTube Music, Last.fm & SoundCloud with automatic fallback
- **Artist filtering**: Pass artist name for accurate search and download results
- **Track verification**: Verifies search results match your query before downloading
- **Async downloads**: Non-blocking task queue with real-time progress callbacks
- **TypeScript**: Full type definitions included
- **Dual format**: CommonJS + ESM support
- **Built-in retry**: Automatic retry with exponential backoff
- **Caching**: In-memory cache with configurable TTL
- **Streaming**: AES-256-CBC encrypted temporary URLs
- **Rich metadata**: ID3 tags via music-metadata — title, artist, album, cover art
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

// Search with artist filter for accurate results
const results = await client.searchMusic('never back down', { artist: 'neffex' })
console.log(results.tracks[0].title) // 'Never Back Down'

// Get a stream URL
const stream = await client.getStream('never back down', { artist: 'neffex' })
const status = await client.waitForStream(stream.taskId, {
  onProgress: (s) => console.log(`[${s.status}] ${s.progress}%`),
})
console.log(status.result?.streamUrl)
```

## Configuration

### `KojiokaClient(options?)`

```typescript
const client = new KojiokaClient({
  baseUrl: 'https://kojioka-api.onrender.com',
  timeout: 15000,
  logLevel: LogLevel.INFO,
  cache: { maxSize: 500, defaultTtl: 300000 },
  retry: { maxAttempts: 3, baseDelay: 1000, maxDelay: 10000 },
})
```

## API Reference

### Search

```typescript
// Search with artist filter (recommended for accuracy)
const results = await client.searchMusic('never back down', {
  artist: 'neffex',        // Filter by artist name
  provider: 'youtube-music', // 'youtube-music' | 'lastfm' | 'soundcloud'
  type: 'track',            // 'track' | 'artist'
  limit: 20,                // 1-30
})

// Track: { id, title, artist, platform?, url?, thumbnail?, duration? }
```

### Stream

```typescript
// Download with artist verification
const stream = await client.getStream('never back down', {
  artist: 'neffex',
  platform: 'youtube-music',
})

// Wait for completion with progress callback
const result = await client.waitForStream(stream.taskId, {
  interval: 3000,
  maxAttempts: 40,
  onProgress: (status) => {
    console.log(`[${status.status}] ${status.progress}%`)
    if (status.trackInfo) {
      console.log(`${status.trackInfo.artist} - ${status.trackInfo.title}`)
    }
  },
})
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
```

## Types

```typescript
import type {
  Track, SearchOptions, SearchResult,
  StreamOptions, StreamResult, StreamStatus, WaitForStreamOptions,
  StreamMetadata, ServerStatus, Platform,
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
    console.log(error.context)       // { endpoint, statusCode }
  }
}
```

## License

MIT

---

## Support

[![Ko-fi](https://img.shields.io/badge/Support%20on-Ko--fi-FF5E5B?logo=ko-fi&logoColor=white)](https://ko-fi.com/shindozk)

## Documentation

**[Kojioka Documentation](https://kojioka-app.vercel.app)**
