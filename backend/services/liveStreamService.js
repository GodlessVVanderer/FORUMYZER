const axios = require('axios');
const { classifyCommentsAI, removeSpam } = require('./aiClassifier');

/**
 * Live stream chat service for YouTube
 * Handles real-time comment fetching and polling for live streams
 */

/**
 * Check if a video is currently live
 * @param {String} videoId YouTube video ID
 * @returns {Object} { isLive: boolean, liveChatId: string|null }
 */
async function checkIfLive(videoId) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    throw new Error('YOUTUBE_API_KEY is not set');
  }

  try {
    const url = 'https://www.googleapis.com/youtube/v3/videos';
    const response = await axios.get(url, {
      params: {
        part: 'liveStreamingDetails,snippet',
        id: videoId,
        key: apiKey
      }
    });

    if (!response.data.items || response.data.items.length === 0) {
      return { isLive: false, liveChatId: null, videoTitle: null, channelTitle: null };
    }

    const video = response.data.items[0];
    const liveDetails = video.liveStreamingDetails;
    const snippet = video.snippet;

    return {
      isLive: snippet.liveBroadcastContent === 'live',
      liveChatId: liveDetails?.activeLiveChatId || null,
      videoTitle: snippet.title,
      channelTitle: snippet.channelTitle,
      isUpcoming: snippet.liveBroadcastContent === 'upcoming',
      scheduledStartTime: liveDetails?.scheduledStartTime || null
    };
  } catch (error) {
    console.error('Error checking live status:', error.message);
    throw error;
  }
}

/**
 * Fetch live chat messages
 * @param {String} liveChatId Live chat ID from video
 * @param {String} pageToken Optional page token for pagination
 * @returns {Object} { messages: Array, nextPageToken: string, pollingIntervalMillis: number }
 */
async function fetchLiveChatMessages(liveChatId, pageToken = null) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    throw new Error('YOUTUBE_API_KEY is not set');
  }

  try {
    const url = 'https://www.googleapis.com/youtube/v3/liveChat/messages';
    const params = {
      liveChatId,
      part: 'snippet,authorDetails',
      maxResults: 200,
      key: apiKey
    };

    if (pageToken) {
      params.pageToken = pageToken;
    }

    const response = await axios.get(url, { params });

    const messages = response.data.items.map(item => ({
      id: item.id,
      author: item.authorDetails.displayName,
      text: item.snippet.displayMessage || item.snippet.textMessageDetails?.messageText || '',
      publishedAt: item.snippet.publishedAt,
      type: item.snippet.type,
      isChatOwner: item.authorDetails.isChatOwner,
      isChatModerator: item.authorDetails.isChatModerator,
      isChatSponsor: item.authorDetails.isChatSponsor,
      profileImageUrl: item.authorDetails.profileImageUrl
    }));

    return {
      messages,
      nextPageToken: response.data.nextPageToken,
      pollingIntervalMillis: response.data.pollingIntervalMillis || 5000
    };
  } catch (error) {
    console.error('Error fetching live chat:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Process live chat for a video - fetch, classify, and filter
 * @param {String} videoId YouTube video ID
 * @param {Object} options Processing options
 * @returns {Object} { threads: Array, stats: Object, isLive: boolean, liveChatId: string }
 */
async function processLiveChat(videoId, options = {}) {
  const liveStatus = await checkIfLive(videoId);

  if (!liveStatus.isLive) {
    return {
      isLive: false,
      error: liveStatus.isUpcoming ? 'Stream is scheduled but not live yet' : 'Video is not currently live',
      scheduledStartTime: liveStatus.scheduledStartTime
    };
  }

  const { liveChatId } = liveStatus;
  const { messages, nextPageToken, pollingIntervalMillis } = await fetchLiveChatMessages(liveChatId, options.pageToken);

  // Convert messages to comment format
  const comments = messages.map(msg => ({
    id: msg.id,
    author: msg.author,
    text: msg.text,
    publishedAt: msg.publishedAt,
    replies: [],
    metadata: {
      isChatOwner: msg.isChatOwner,
      isChatModerator: msg.isChatModerator,
      isChatSponsor: msg.isChatSponsor,
      profileImageUrl: msg.profileImageUrl
    }
  }));

  // Classify with AI
  const classified = await classifyCommentsAI(comments, options);

  // Remove spam if requested
  const filtered = options.removeSpam !== false ? removeSpam(classified) : classified;

  // Calculate statistics
  const stats = calculateStats(filtered);

  return {
    isLive: true,
    liveChatId,
    threads: filtered,
    stats,
    nextPageToken,
    pollingIntervalMillis,
    videoTitle: liveStatus.videoTitle,
    channelTitle: liveStatus.channelTitle,
    messageCount: messages.length,
    filteredCount: classified.length - filtered.length
  };
}

/**
 * Calculate category statistics
 */
function calculateStats(comments) {
  const stats = {
    totalComments: comments.length,
    spamCount: 0,
    botCount: 0,
    toxicCount: 0,
    genuineCount: 0,
    questionCount: 0,
    feedbackCount: 0,
    discussionCount: 0
  };

  comments.forEach(comment => {
    const cat = comment.category || 'genuine';
    stats[`${cat}Count`] = (stats[`${cat}Count`] || 0) + 1;
  });

  // Calculate percentages
  Object.keys(stats).forEach(key => {
    if (key.endsWith('Count') && key !== 'totalComments') {
      const category = key.replace('Count', '');
      stats[`${category}Percentage`] = stats.totalComments > 0
        ? Math.round((stats[key] / stats.totalComments) * 100)
        : 0;
    }
  });

  return stats;
}

module.exports = {
  checkIfLive,
  fetchLiveChatMessages,
  processLiveChat
};
