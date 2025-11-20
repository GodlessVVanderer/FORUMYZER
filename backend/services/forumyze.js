const axios = require('axios');
const { classifyComments, defaultCategories } = require('./classifier');

async function forumyzeService(videoId, maxResults = 50) {
  const apiKey = 'AIzaSyC0cD7Kct5XlMMZITg1UwRhbVp44fMw0gQ';
  const url = 'https://www.googleapis.com/youtube/v3/commentThreads';
  const params = { part: 'snippet,replies', videoId, maxResults, key: apiKey };
  const response = await axios.get(url, { params });
  const threads = response.data.items.map(item => ({
    id: item.snippet.topLevelComment.id,
    author: item.snippet.topLevelComment.snippet.authorDisplayName,
    text: item.snippet.topLevelComment.snippet.textOriginal,
    replies: []
  }));
  const classified = classifyComments(threads);
  return { threads: classified, stats: {}, forumyzedAt: new Date().toISOString() };
}

module.exports = forumyzeService;
