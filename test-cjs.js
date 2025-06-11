// test-cjs.js
const Kojioka = require('./index.js'); // Require the package by its new name

const kojiokaClient = new Kojioka(); // No need to pass baseURL anymore

async function runCjsExample() {
  console.log('--- CommonJS Test ---');
  try {
    // Get API status
    const status = await kojiokaClient.getStatus();
    console.log('API Status:', status);

    // Search for a song by title
    const streamInfoByTitle = await kojiokaClient.getStream('Boruto Opening 4');
    console.log('\nStream Info (by Title):', streamInfoByTitle);

    // Search for a song using a YouTube URL
    /*const streamInfoByYouTubeUrl = await kojiokaClient.getStream('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    console.log('\nStream Info (by YouTube URL):', streamInfoByYouTubeUrl);

    // Search for a song using a SoundCloud URL
    // Replace with a valid SoundCloud URL if you have one
    const streamInfoBySoundCloudUrl = await kojiokaClient.getStream('https://soundcloud.com/neffexmusic/destiny');
    console.log('\nStream Info (by SoundCloud URL):', streamInfoBySoundCloudUrl);

    // Search for a song using a Spotify URL
    // Replace with a valid Spotify track URL if you have one
    const streamInfoBySpotifyUrl = await kojiokaClient.getStream('https://open.spotify.com/track/7qiZfU4CCOgQCgXgk9DjjA?si=your-track-id');
    console.log('\nStream Info (by Spotify URL):', streamInfoBySpotifyUrl);*/

  } catch (error) {
    console.error('\nError in CJS example:', error.message);
  }
}

runCjsExample();
