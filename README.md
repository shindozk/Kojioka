# Kojioka API Client

A client library for interacting with the Kojioka music streaming API [Kojioka API](https://kojioka-api.onrender.com/). This API allows you to search for and stream music from various platforms, prioritizing YouTube downloads with a fallback to SoundCloud.

---

## Important: Help keep the API working (YouTube cookies)

Kojioka relies on YouTube downloads. To keep this working reliably, the API needs a fresh YouTube cookies file. If downloads start failing or you want to help, please upload a valid `youtube-cookies.txt` on the uploader page:

- Cookie Uploader Page: `https://kojioka-api.onrender.com/cookie-uploader`

Strongly recommended: use a test/secondary Google account when exporting cookies.

See the guide below to generate the file safely in minutes.

---

### Features

* **Unified Search:** Search by title or direct links from YouTube, SoundCloud, and Spotify.
* **Smart Download Strategy:** Server prefers YouTube (yt-dlp with cookies when available) and gracefully falls back to SoundCloud.
* **Caching with Auto-Expiry:** Tracks are cached on the server and renewed on access.
* **Real-time Server Monitoring:** Fetch detailed server stats (uptime, CPU, memory, disk, etc.).
* **Supports ESM and CJS:** Works in both CommonJS and ES Module environments.
* **Update Notifications:** This client checks npm periodically and logs if a newer package version is available.

---

## How to get a YouTube cookies file (youtube-cookies.txt)

Use a browser extension that exports cookies in Netscape format.

1. Install a cookies exporter extension:
   - Chrome: "Get cookies.txt LOCALLY" (recommended)
   - Firefox: "cookies.txt"
2. Open `https://www.youtube.com/` and log in.
3. Open the extension and export cookies in "Netscape"/"cookies.txt" format.
4. Save the file as `youtube-cookies.txt`.
5. Upload it at: `https://kojioka-api.onrender.com/cookie-uploader`.

Notes and tips:
- Prefer a dedicated test/secondary Google account for privacy and safety.
- The file must start with `# Netscape HTTP Cookie File` and contain `youtube.com` entries.
- If uploads succeed, the page shows "Cookies validated and activated successfully!" and the status turns green.

---

### Installation

To install the Kojioka API client in your project:

```bash
npm install kojioka
```

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
const kojiokaClient = new Kojioka();
```

---

### `kojiokaClient.getStream(query)`

Fetches a streamable MP3 file and rich track metadata.

#### Parameters:

* `query` (**string**, required): A search string or direct URL from YouTube, SoundCloud, or Spotify.

#### How it works:

1. Attempts YouTube download via yt-dlp with cookies.
2. Falls back to SoundCloud if needed.
3. Tracks are cached with:

   * 5 minutes initial inactivity timeout.
   * 4-hour general lifespan (renewed on access).
   * 15-minute re-inactivity timeout on access.

#### Example:

```js
const resultStream = await kojiokaClient.getStream('To Be Hero X Paragon');
console.log(resultStream);
```

#### Sample Response:

```json
{
  "message": "[YOUTUBE] 'To Be Hero X - OST EP1 \"PARAGON\" by Hiroyuki Sawano (Lyrics)' downloaded. Access within 5 minutes.",
  "streamUrl": "http://kojioka-api.onrender.com/songs/05def131-fc85-43f8-9011-b4238fc981c5.mp3/ab25d12617181209a0e3fb94a940e0afe4f3e1a5526358979e0d68f6059a7a4c92b51940f4242d6992dd89d70ab8b820eb4421d8fe53c8c50e786d8813620267884558c219f73652fdc5c7ce32b070f5",
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

### `kojiokaClient.search(query)`

Searches for the best-matching song and returns its metadata without downloading.

#### Example:

```js
const resultSearch = await kojiokaClient.search('To Be Hero X Inertia');
console.log(resultSearch);
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

### `kojiokaClient.getStatus()`

Returns current server status including memory, CPU, disk, and song storage.

#### Example:

```js
const resultStatus = await kojiokaClient.getStatus();
console.log(resultStatus);
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
  },
  "cookieStatus": {
    "exists": true,
    "size": 6741,
    "valid": true,
    "reason": null,
    "updatedAt": 1755862395375.6,
    "file": "youtube-cookies.txt"
  }
}
```

---

### API Base URL

Default: `https://kojioka-api.onrender.com/`

---

### Cookie Uploader (Web UI)

If you are self-hosting or using the public API, you can manage cookies via a simple web page:

- `https://kojioka-api.onrender.com/cookie-uploader`

Upload or paste your cookies in the provided UI. The API validates and activates them immediately.

---

### Repository

GitHub: [https://github.com/shindozk/kojioka](https://github.com/shindozk/kojioka)

---

### Issues

Report bugs or request features here:

[GitHub Issues](https://github.com/shindozk/kojioka/issues)

---

### Update notifications

This package periodically checks npm for a newer version and logs an informational message when one is available. The check happens on load and every 5 minutes thereafter. It is non-blocking and network failures are silently ignored.

---

### License

MIT License – see the [LICENSE](https://github.com/shindozk/kojioka/blob/main/LICENSE)

---
