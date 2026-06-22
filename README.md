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
- **Zero dependencies**: Uses native `fetch`
- **TypeScript**: Full type definitions
- **Dual format**: CommonJS + ESM

## Install

```bash
npm install kojioka
```

## Quick Start

```typescript
import { Kojioka } from 'kojioka'

const kojioka = new Kojioka()

// One-shot download
const result = await kojioka.download('never back down', { artist: 'neffex' })
console.log(result.result?.streamUrl)
```

## Usage

### Search

```typescript
const results = await kojioka.search('bohemian rhapsody', { artist: 'queen' })
console.log(results.tracks[0].title)
console.log(results.tracks[0].artist)
console.log(results.searchId)
```

### Download

```typescript
// From text
const result = await kojioka.download('never back down', {
  artist: 'neffex',
  onProgress: (s) => console.log(`[${s.status}] ${s.progress}% - ${s.trackInfo?.artist} - ${s.trackInfo?.title}`),
})
console.log(result.result?.streamUrl)

// From search result
const search = await kojioka.search('queen')
const result = await kojioka.download(search.tracks[0])
console.log(result.result?.streamUrl)
```

### Stream (manual control)

```typescript
const stream = await kojioka.stream('never back down', { artist: 'neffex' })
console.log(stream.taskId)

// Wait for completion
const result = await stream.complete({
  onProgress: (s) => console.log(`${s.progress}%`),
})
console.log(result.result?.streamUrl)
```

### Server Status

```typescript
const status = await kojioka.status()
console.log(`${status.memory.used} / ${status.memory.total}`)
console.log(`Memory level: ${status.memoryLevel}`)

const online = await kojioka.isOnline()
```

### Cookies

```typescript
const cookie = await kojioka.cookieStatus()
console.log(`Expires: ${cookie.expiresAt}`)

await kojioka.uploadCookies(cookieContent)
```

## Error Handling

```typescript
import { KojiokaError } from 'kojioka'

try {
  await kojioka.download('test')
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
  StreamStatus,
  ServerStatus,
} from 'kojioka'
```

## License

MIT

---

[![Ko-fi](https://img.shields.io/badge/Support%20on-Ko--fi-FF5E5B?logo=ko-fi&logoColor=white)](https://ko-fi.com/shindozk) | [Documentation](https://kojioka-app.vercel.app)
