import axios from 'axios';

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

export default Kojioka;
