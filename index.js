const axios = require('axios');
const semver = require('semver');
const path =require('path');
const fs = require('fs');

/**
 * Client for the Kojioka API, allowing searching and streaming music.
 */
class Kojioka {
  /**
   * Creates an instance of the Kojioka API client.
   * The base URL for the Kojioka API is already defined internally.
   */
  constructor() {
    this.baseURL = 'https://kojioka-api.onrender.com';
  }

  /**
   * Searches for a music stream on the Kojioka API.
   * Supports music titles or YouTube, SoundCloud, and Spotify URLs.
   * The Kojioka API will attempt to download from YouTube (via RapidAPI) first, and if it fails, will use SoundCloud.
   * @param {string} query The search query (music title or link).
   * @returns {Promise<object>} The API response containing stream information.
   * @throws {Error} If the query is invalid or an API error occurs.
   */
  async getStream(query) {
    if (!query) {
      throw new Error('Kojioka.getStream: The query is required.');
    }
    try {
      const response = await axios.get(`${this.baseURL}/get-stream`, {
        params: { q: query }
      });
      return response.data;
    } catch (error) {
      console.error('Kojioka.getStream Error:', error.message);
      if (error.response) {
        const errorDetails = error.response.data && typeof error.response.data === 'object'
                             ? JSON.stringify(error.response.data)
                             : error.response.data;
        throw new Error(`API Error: ${error.response.status} - ${errorDetails}`);
      } else {
        throw new Error(`Network Error: ${error.message}`);
      }
    }
  }

  /**
   * Searches for a single best-match track on the Kojioka API, returning its metadata without downloading.
   * Supports music titles or YouTube, SoundCloud, and Spotify URLs.
   * @param {string} query The search query (music title or link).
   * @returns {Promise<object>} The API response containing detailed information of the best-matched track.
   * @throws {Error} If the query is invalid or an API error occurs.
   */
  async search(query) {
    if (!query) {
      throw new Error('Kojioka.search: The query is required.');
    }
    try {
      const response = await axios.get(`${this.baseURL}/search`, {
        params: { q: query }
      });
      return response.data;
    } catch (error) {
      console.error('Kojioka.search Error:', error.message);
      if (error.response) {
        const errorDetails = error.response.data && typeof error.response.data === 'object'
                             ? JSON.stringify(error.response.data)
                             : error.response.data;
        throw new Error(`API Error: ${error.response.status} - ${errorDetails}`);
      } else {
        throw new Error(`Network Error: ${error.message}`);
      }
    }
  }

  /**
   * Gets the current status of the Kojioka API server.
   * @returns {Promise<object>} The API response containing server status and usage information.
   * @throws {Error} If an error occurs while fetching the API status.
   */
  async getStatus() {
    try {
      const response = await axios.get(`${this.baseURL}/status`);
      return response.data;
    } catch (error) {
      console.error('Kojioka.getStatus Error:', error.message);
      if (error.response) {
        const errorDetails = error.response.data && typeof error.response.data === 'object'
                             ? JSON.stringify(error.response.data)
                             : error.response.data;
        throw new Error(`API Error: ${error.response.status} - ${errorDetails}`);
      } else {
        throw new Error(`Network Error: ${error.message}`);
      }
    }
  }
}

/**
 * Checks for updates to the Kojioka package on npm.
 * Logs a message if a newer version is available.
 */
async function checkForUpdates() {
  try {
    // Read the current package version dynamically
    const packagePath = path.resolve(__dirname, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const currentVersion = packageJson.version;

    const response = await axios.get("https://registry.npmjs.com/kojioka");
    const latestVersion = response.data["dist-tags"].latest;

    if (semver.gt(latestVersion, currentVersion)) {
      console.log(
        `\x1b[38;5;215m[Kojioka Update Available]\x1b[0m ` +
        `A new version (\x1b[38;5;119m${latestVersion}\x1b[0m) of Kojioka is available! ` +
        `You are currently using \x1b[38;5;220m${currentVersion}\x1b[0m. ` +
        `Update now to get the latest features and bug fixes: ` +
        `\x1b[38;5;119mnpm install kojioka@latest\x1b[0m`
      );
    }
  } catch (err) {
    // Suppress common errors like network issues during update check
    if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED' || axios.isAxiosError(err)) {
        // Optionally, do nothing to keep logs clean
    } else {
        console.error("Kojioka Update Check Error:", err.message);
    }
  }
}

// Check for updates immediately when the module is loaded
checkForUpdates();

// Check for updates every 5 minutes (300,000 milliseconds)
setInterval(checkForUpdates, 5 * 60 * 1000); // 5 minutes

module.exports = Kojioka;
