# Kojioka API Client

A client library for interacting with the Kojioka music streaming API [Kojioka API](https://kojioka-api.onrender.com/). This API allows you to search for and stream music from various platforms, prioritizing YouTube downloads with a fallback to SoundCloud.

---

### Features

* **Unified Search:** Search for music using titles or direct links from YouTube, SoundCloud, and Spotify.
* **Smart Download Strategy:** Prefers high-quality downloads from YouTube (via RapidAPI) and gracefully falls back to SoundCloud if necessary.
* **Caching with Auto-Expiry:** Songs are cached and served from memory. Songs expire after a minute of inactivity and are renewed upon access.
* **Real-time Server Monitoring:** Access detailed server stats (uptime, CPU, memory, disk, etc.).
* **Supports ESM and CJS:** Works in both CommonJS and ES Module environments.
* **Auto-Update Notifications:** Notifies when a new version of the Kojioka package is available on npm.

---

### Installation

To install the Kojioka API client in your project:

```bash
npm install kojioka
````

---

### Usage

#### Importing the Client

**For ES Modules (ESM):**

```js
import Kojioka from 'kojioka';
```

**For CommonJS (CJS):**

```js
const Kojioka = require('kojioka');
```

#### Initialize the Client

```js
const kojioka = new Kojioka();
```

---

### `kojioka.getStream(query)`

Fetches a streamable MP3 file and rich track metadata.

#### Parameters:

* `query` (**string**, required): A search string or direct URL from YouTube, SoundCloud, or Spotify.

#### How it works:

1. Attempts YouTube download via RapidAPI.
2. Falls back to SoundCloud if needed.
3. Tracks are cached with:

   * 1 minute initial inactivity timeout.
   * 4-hour general lifespan (renewed on access).
   * 15-minute re-inactivity timeout on access.

#### Example:

```js
const stream = await kojioka.getStream('To Be Hero X Paragon');
console.log(stream.trackInfo);
console.log('Stream MP3 URL:', stream.streamUrl);
```

#### Sample Response:

```json
{
  "message": "[YOUTUBE] 'To Be Hero X - OST EP1 \"PARAGON\" by Hiroyuki Sawano (Lyrics)' downloaded. Access within 1 minute.",
  "streamUrl": "http://kojioka-api.onrender.com/songs/05def131-fc85-43f8-9011-b4238fc981c5.mp3",
  "trackInfo": {
    "id": "86QQLBdtWtQ",
    "title": "To Be Hero X - OST EP1 \"PARAGON\" by Hiroyuki Sawano (Lyrics)",
    "artist": "Rythmiko",
    "duration": "2:47",
    "url": "https://youtube.com/watch?v=86QQLBdtWtQ",
    "albumName": null,
    "releaseDate": "2 months ago",
    "thumbnailUrl": "https://i.ytimg.com/vi/86QQLBdtWtQ/hq720.jpg",
    "genres": null,
    "platform": "youtube"
  }
}
```

---

### `kojioka.search(query)`

Searches for the best-matching song and returns its metadata without downloading.

#### Example:

```js
const result = await kojioka.search('To Be Hero X Inertia');
console.log(result);
```

#### Sample Response

```json
{
  "id": "xJUirdqOJEo",
  "title": "TO BE HERO X - Opening FULL \"INERTIA\" by SawanoHiroyuki[nZk]:Rei (Lyrics)",
  "artist": "Jamong",
  "duration": "3:20",
  "url": "https://youtube.com/watch?v=xJUirdqOJEo",
  "albumName": null,
  "releaseDate": "2 months ago",
  "thumbnailUrl": "https://i.ytimg.com/vi/xJUirdqOJEo/hq720.jpg",
  "genres": null,
  "platform": "youtube"
}
```

---

### `kojioka.getStatus()`

Returns current server status including memory, CPU, disk, and song storage.

#### Example:

```js
const status = await kojioka.getStatus();
console.log(status);
```

#### Sample Response:

```json
{
  "serverStatus": "online",
  "uptime": "3h 12m 8s",
  "cpu": {
    "model": "AMD EPYC 7R13 Processor",
    "cores": 8,
    "usage": "14.21%",
    "loadAverage": [0.5, 0.4, 0.3]
  },
  "memory": {
    "total": "7.50 GB",
    "used": "2.35 GB",
    "free": "5.15 GB"
  },
  "disk": {
    "total": "80.00 GB",
    "used": "35.00 GB",
    "free": "45.00 GB"
  },
  "songsStorage": {
    "count": 8,
    "size": "45.23 MB"
  }
}
```

---

### API Base URL

`https://kojioka-api.onrender.com/`

---

### Repository

GitHub: [https://github.com/shindozk/kojioka](https://github.com/shindozk/kojioka)

---

### Issues

Report bugs or request features here:

[GitHub Issues](https://github.com/shindozk/kojioka/issues)

---

### License

MIT License – see the [LICENSE](https://www.google.com/search?q=MIT-LICENSE)

---
