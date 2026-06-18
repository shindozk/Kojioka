<div align="center">

# Kojioka

<img src="https://i.imgur.com/6NCE3wJ.png" alt="Kojioka" width="200">

Official client for the [Kojioka Music Streaming API](https://kojioka-api.onrender.com).

[![npm version](https://img.shields.io/npm/v/kojioka.svg)](https://www.npmjs.com/package/kojioka)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Made in Brazil 😎

</div>

## Features

- **Multi-platform**: YouTube Music, Last.fm & SoundCloud search and streaming
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

// Search for music
const results = await client.searchMusic('lofi hip hop')
console.log(results.tracks)
// [{ id: 'yt-xxx', title: '...', artist: '...', ... }]

// Get a stream URL
const stream = await client.getStream('lofi hip hop beats')
console.log(stream.taskId) // 'task-abc-123'

// Wait for the stream to be ready
const status = await client.waitForStream(stream.taskId)
console.log(status.result?.streamUrl) // 'https://kojioka-api.onrender.com/songs/...'

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
const results = await client.searchMusic('song name', {
  provider: 'lastfm',    // 'youtube-music' | 'lastfm' | 'soundcloud'
  limit: 10,             // Number of results (default: 10)
})

// results: { query, provider, tracks: Track[], total }
// Track: { id, title, artist, album?, duration?, thumbnail?, platform, url? }
```

### Stream

```typescript
// Get a stream URL (triggers download on server)
const stream = await client.getStream('song name', {
  platform: 'youtube-music',  // 'youtube-music' | 'lastfm' | 'soundcloud'
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
