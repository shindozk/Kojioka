<div align="center">

# Kojioka

<img src="https://i.imgur.com/6NCE3wJ.png" alt="Kojioka" width="200">

Official client for the [Kojioka Music Streaming API](https://kojioka-api.onrender.com).

[![npm version](https://img.shields.io/npm/v/kojioka.svg)](https://www.npmjs.com/package/kojioka)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

</div>

## Features

- **Multi-platform**: YouTube Music, Last.fm & SoundCloud
- **Artist filtering**: Pass artist name for accurate results
- **Track verification**: Verifies results match your query
- **Async downloads**: Real-time progress callbacks
- **TypeScript**: Full type definitions
- **Dual format**: CommonJS + ESM
- **Zero dependencies**: Only uses native `fetch`

## Install

```bash
npm install kojioka
```

## Quick Start

```typescript
import { KojiokaClient } from 'kojioka'

const client = new KojiokaClient()

// Search
const results = await client.search('never back down', { artist: 'neffex' })
console.log(results.tracks[0].title)

// Download with progress
const stream = await client.getStream('never back down', { artist: 'neffex' })
const status = await client.waitForStream(stream.taskId, {
  onProgress: (s) => console.log(`[${s.status}] ${s.progress}%`),
})
console.log(status.result?.streamUrl)
```

## API Reference

### `KojiokaClient(options?)`

```typescript
const client = new KojiokaClient({
  baseUrl: 'https://kojioka-api.onrender.com', // default
  timeout: 15000, // default
})
```

### `search(query, options?)`

```typescript
const results = await client.search('never back down', {
  artist: 'neffex',
  platform: 'youtube-music', // 'youtube-music' | 'lastfm' | 'soundcloud'
  limit: 20, // 1-30
})
// results: { tracks, searchId, total, platform, sourcePlatform }
```

### `getStream(query, options?)`

```typescript
const stream = await client.getStream('never back down', {
  artist: 'neffex',
  platform: 'youtube-music',
})
// stream: { taskId, streamUrl, platform, expiresAt }
```

### `waitForStream(taskId, options?)`

```typescript
const result = await client.waitForStream(stream.taskId, {
  interval: 3000,    // poll interval ms
  maxAttempts: 40,   // max polls
  onProgress: (status) => {
    console.log(`${status.status} ${status.progress}%`)
    console.log(status.trackInfo?.artist, status.trackInfo?.title)
  },
})
// result: { taskId, status, progress, trackInfo, result }
```

### `getServerStatus()`

```typescript
const status = await client.getServerStatus()
// status: { serverStatus, uptime, cpu, memory, activeDownloads, memoryLevel }
```

### `isOnline()`

```typescript
const online = await client.isOnline() // boolean
```

### `getCookieStatus()` / `uploadCookies(cookies)`

```typescript
const cookie = await client.getCookieStatus()
await client.uploadCookies(cookieContent)
```

## Error Handling

```typescript
import { KojiokaError } from 'kojioka'

try {
  await client.search('test')
} catch (err) {
  if (err instanceof KojiokaError) {
    console.log(err.code)        // 'NETWORK_ERROR' | 'TIMEOUT' | etc
    console.log(err.isRetryable) // boolean
    console.log(err.context)     // { path, status }
  }
}
```

## Types

```typescript
import type {
  Platform,
  Track,
  SearchOptions,
  SearchResult,
  StreamOptions,
  StreamResult,
  StreamStatus,
  WaitForStreamOptions,
  ServerStatus,
} from 'kojioka'
```

## License

MIT

---

[![Ko-fi](https://img.shields.io/badge/Support%20on-Ko--fi-FF5E5B?logo=ko-fi&logoColor=white)](https://ko-fi.com/shindozk) | [Documentation](https://kojioka-app.vercel.app)
