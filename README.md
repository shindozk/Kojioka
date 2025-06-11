# Kojioka API Client

A client library for interacting with the Kojioka music streaming API [Kojioka API](https://kojioka-api.onrender.com/). This API allows you to search for and stream music from various platforms, prioritizing YouTube downloads with a fallback to SoundCloud.

---

### Features

* **Unified Search:** Search for music using titles or direct links from YouTube, SoundCloud, and Spotify.
* **Intelligent Download Priority:** Prefers downloading from YouTube (via RapidAPI) for high-quality audio, with a robust fallback to SoundCloud if YouTube download fails.
* **Caching Mechanism:** Efficiently caches downloaded songs to reduce redundant downloads and bandwidth usage.
* **Real-time Status Monitoring:** Get detailed insights into the API server's performance and resource usage.
* **Dual Module Support:** Works seamlessly in both CommonJS and ES Modules environments.

---

### Installation

To install the Kojioka API client in your project, use npm:

```bash
npm install kojioka
````

-----

### Usage

First, import the `Kojioka` client into your project.

#### Importing the Client

**For ES Modules (ESM):**

```javascript
import Kojioka from 'kojioka';
```

**For CommonJS (CJS):**

```javascript
const Kojioka = require('kojioka');
```

#### Initializing the Client

The API base URL is internally configured, so you just need to create a new instance of `Kojioka`:

```javascript
const kojiokaClient = new Kojioka();
```

-----

#### `kojioka.getStream(query)`

This asynchronous method allows you to search for and retrieve information about a music stream.

**Description:**
It intelligently processes your `query`. If the `query` is a YouTube, SoundCloud, or Spotify URL, it attempts to extract the song title. If it's a plain text title, it uses that directly. The Kojioka API then tries to find and download the audio:

1.  **Primary:** It first attempts to find the song on **YouTube** using `yt-search` (or directly from a YouTube URL) and download its audio via **RapidAPI**.
2.  **Fallback:** If the YouTube/RapidAPI process fails (e.g., no matching YouTube video, RapidAPI issues), it will **fall back to searching and downloading from SoundCloud** using `scdl-core`.
3.  **Caching:** Songs are cached. Newly downloaded songs have an initial inactivity timer of **1 minute**. If accessed, their general lifespan is renewed for 4 hours, and a re-inactivity timer of **5 minutes** is set. If not re-accessed within 5 minutes, they are deleted to free up space.

**Parameters:**

  * `query` (string, **required**): The search term. This can be:
      * A music title (e.g., `'Neffex Destiny'`)
      * A YouTube URL (e.g., `'https://www.youtube.com/watch?v=dQw4w9WgXcQ'`)
      * A SoundCloud URL (e.g., `'https://soundcloud.com/neffexmusic/destiny'`)
      * A Spotify track URL (e.g., `'https://open.spotify.com/track/7qiZfU4CCOgQCgXgk9DjjA'`)

**Return Value:**

A Promise that resolves to an object containing stream information.

```json
{
  "message": "Song downloaded. Access stream within 1 minute to prevent inactivity deletion.",
  "trackInfo": {
    "title": "Boruto: Naruto Next Generations - Opening 4 | Lonely Go!",
    "author": "YouTube (RapidAPI)",
    "duration": "N/A",
    "url": "https://www.youtube.com/watch?v=P4Z2EcYGYUI"
  },
  "streamUrl": "http://kojioka-api.onrender.com/songs/e887dfcd-faef-4f94-965f-b35d82ca9c1e.mp3"
}
```

**Example Usage:**

```javascript
// Example using ES Modules
import Kojioka from 'kojioka';

const kojiokaClient = new Kojioka();

async function exampleGetStream() {
  try {
    console.log('Searching for "Neffex Destiny"...');
    const streamInfo = await kojiokaClient.getStream('Neffex Destiny');
    console.log('Stream Information:', streamInfo);
    console.log('Stream URL:', streamInfo.streamUrl);

    console.log('\nSearching using a YouTube URL...');
    const streamInfoYT = await kojiokaClient.getStream('https://www.youtube.com/watch?v=N_T2b4G1x0Y');
    console.log('Stream Information (YouTube):', streamInfoYT);

    // You can use streamInfo.streamUrl to play the audio in an audio player (e.g., HTML <audio> tag)
  } catch (error) {
    console.error('Failed to get stream:', error.message);
  }
}

exampleGetStream();
```

-----

#### `kojioka.getStatus()`

This asynchronous method fetches the current operational status and resource usage of the Kojioka API server.

**Description:**
Provides a snapshot of the server's health, including uptime, memory usage, details about the cached songs, and CPU information.

**Return Value:**

A Promise that resolves to an object containing server status information.

```json
{
  "serverStatus": "online",
  "uptime": "3h 25m 45s",
  "memoryRamUsage": {
    "totalRam": "7947.38 MB",
    "usedRam": "2710.18 MB",
    "freeRam": "5237.20 MB"
  },
  "songsStorage": {
    "totalSongsSize": "125.45 MB",
    "numberOfSongs": 15
  },
  "systemInfo": {
    "cpuName": "Intel(R) Xeon(R) CPU @ 2.00GHz",
    "cpuLoadAverage": [
      0.5,
      0.6,
      0.7
    ]
  }
}
```

**Example Usage:**

```javascript
// Example using CommonJS
const Kojioka = require('kojioka');

const kojiokaClient = new Kojioka();

async function exampleGetStatus() {
  try {
    console.log('Fetching API status...');
    const status = await kojiokaClient.getStatus();
    console.log('API Status:', status);
  } catch (error) {
    console.error('Failed to get API status:', error.message);
  }
}

exampleGetStatus();
```

-----

### API Endpoint

The Kojioka API is hosted at: `https://kojioka-api.onrender.com/`

-----

### Contributing

Feel free to contribute to this project\! You can find the repository at:

[Github Project](https://github.com/shindozk/kojioka)

-----

### Bugs / Issues

If you encounter any bugs or have issues, please report them on the GitHub issue tracker:

[Github Bugs](https://github.com/shindozk/kojioka/issues)

-----

### License

This project is licensed under the MIT License. See the [LICENSE](https://www.google.com/search?q=MIT-LICENSE) file for details.

-----
