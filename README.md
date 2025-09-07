# Kojioka API Client

[![NPM Version](https://img.shields.io/npm/v/kojioka.svg)](https://www.npmjs.com/package/kojioka)
[![License](https://img.shields.io/npm/l/kojioka.svg)](https://github.com/shindozk/kojioka/blob/main/LICENSE)

A client library for interacting with the Kojioka music streaming API, available at [kojioka-api.onrender.com](https://kojioka-api.onrender.com/). This API allows you to search for and stream music from various platforms, prioritizing YouTube downloads with a fallback to SoundCloud.

---

## Table of Contents

- [Kojioka API Client](#kojioka-api-client)
  - [Table of Contents](#table-of-contents)
  - [Important: Help Keep the API Working (YouTube Cookies)](#important-help-keep-the-api-working-youtube-cookies)
  - [Features](#features)
  - [How to Get a YouTube Cookies File](#how-to-get-a-youtube-cookies-file)
  - [Installation](#installation)
  - [Usage](#usage)
    - [Importing the Client](#importing-the-client)
    - [Initialize the Client](#initialize-the-client)
  - [API Methods](#api-methods)
    - [`kojiokaClient.getStream(query)`](#kojiokaclientgetstreamquery)
    - [`kojiokaClient.search(query)`](#kojiokaclientsearchquery)
    - [`kojiokaClient.getStatus()`](#kojiokaclientgetstatus)
  - [API Base URL](#api-base-url)
  - [Cookie Uploader (Web UI)](#cookie-uploader-web-ui)
  - [Repository](#repository)
  - [Issues](#issues)
  - [Update Notifications](#update-notifications)
  - [License](#license)

---

## Important: Help Keep the API Working (YouTube Cookies)

> [!WARNING]
> Kojioka relies on YouTube downloads. To keep this working reliably, the API needs a fresh `youtube-cookies.txt` file. If downloads start failing or you want to help, please upload a valid cookie file on the uploader page:
> 
> - **Cookie Uploader Page**: [`https://kojioka-api.onrender.com/cookie-uploader`](https://kojioka-api.onrender.com/cookie-uploader)
> 
> **Strongly recommended**: Use a test/secondary Google account when exporting cookies for privacy and safety.

---

## Features

* **Unified Search**: Search by title or direct links from YouTube, SoundCloud, and Spotify.
* **Smart Download Strategy**: The server prefers YouTube (using yt-dlp with cookies) and gracefully falls back to SoundCloud.
* **Caching with Auto-Expiry**: Tracks are cached on the server and renewed on access.
* **Real-time Server Monitoring**: Fetch detailed server stats (uptime, CPU, memory, disk, etc.).
* **ESM and CJS Support**: Works in both CommonJS and ES Module environments.
* **Update Notifications**: The client checks npm periodically and logs if a newer package version is available.

---

## How to Get a YouTube Cookies File

Use a browser extension that exports cookies in Netscape format.

1.  **Install a cookies exporter extension**:
    *   Chrome: [Get cookies.txt LOCALLY](https://chrome.google.com/webstore/detail/get-cookiestxt-locally/cclelndahbckbenkjhflpdbgdldlbecc)
    *   Firefox: [cookies.txt](https://addons.mozilla.org/en-US/firefox/addon/cookies-txt/)
2.  Open `https://www.youtube.com/` and log in.
3.  Open the extension and export cookies in **"Netscape"** or **"cookies.txt"** format.
4.  Save the file as `youtube-cookies.txt`.
5.  Upload it at: [`https://kojioka-api.onrender.com/cookie-uploader`](https://kojioka-api.onrender.com/cookie-uploader).

**Notes and Tips**:
*   The file must start with `# Netscape HTTP Cookie File` and contain `youtube.com` entries.
*   If the upload is successful, the page will show "Cookies validated and activated successfully!" and the status will turn green.

---

## Installation

To install the Kojioka API client in your project:

```bash
npm install kojioka
```

---

## Usage

### Importing the Client

**For ES Modules (ESM):**

```javascript
import Kojioka from 'kojioka';
```

**For CommonJS (CJS):**

```javascript
const Kojioka = require('kojioka');
```

### Initialize the Client

```javascript
const kojiokaClient = new Kojioka();
```

---

## API Methods

### `kojiokaClient.getStream(query)`

Fetches a streamable MP3 file and rich track metadata.

*   `query` (**string**, required): A search string or a direct URL from YouTube, SoundCloud, or Spotify.

**How It Works**:

1.  Attempts a YouTube download via yt-dlp with cookies.
2.  Falls back to SoundCloud if the YouTube download fails.
3.  Tracks are cached with the following rules:
    *   5-minute initial inactivity timeout.
    *   4-hour general lifespan (renewed on access).
    *   15-minute re-inactivity timeout on each access.

**Example**:

```javascript
const resultStream = await kojiokaClient.getStream('To Be Hero X Paragon');
console.log(resultStream);
```

**Sample Response**:

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

### `kojiokaClient.search(query)`

Searches for the best-matching song and returns its metadata without downloading.

**Example**:

```javascript
const resultSearch = await kojiokaClient.search('To Be Hero X Inertia');
console.log(resultSearch);
```

**Sample Response**:

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

### `kojiokaClient.getStatus()`

Returns the current server status, including memory, CPU, disk, and song storage details.

**Example**:

```javascript
const resultStatus = await kojiokaClient.getStatus();
console.log(resultStatus);
```

**Sample Response**:

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
    "status": "Valid",
    "exists": true,
    "size": "8.2 KB",
    "valid": true,
    "reason": null,
    "lastUpload": "2025-09-07T18:55:26.469Z",
    "file": "youtube-cookies.txt"
  }
}
```

---

## API Base URL

*   **Default**: `https://kojioka-api.onrender.com/`

## Cookie Uploader (Web UI)

If you are self-hosting or using the public API, you can manage cookies via a simple web page:

*   [`https://kojioka-api.onrender.com/cookie-uploader`](https://kojioka-api.onrender.com/cookie-uploader)

Upload or paste your cookies in the provided UI. The API validates and activates them immediately.

## Repository

*   **GitHub**: [https://github.com/shindozk/kojioka](https://github.com/shindozk/kojioka)

## Issues

Report bugs or request features on the [GitHub Issues](https://github.com/shindozk/kojioka/issues) page.

## Update Notifications

This package periodically checks npm for a newer version and logs an informational message when one is available. This check is non-blocking and network failures are silently ignored.

## License

MIT License – see the [LICENSE](https://github.com/shindozk/kojioka/blob/main/LICENSE) file for details.