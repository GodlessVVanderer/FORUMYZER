const axios = require('axios');
const { classifyComments, defaultCategories } = require('./classifier');
const { classifyCommentsAI, removeSpam, defaultCategories: aiCategories } = require('./aiClassifier');

/**
 * Fetch comments from YouTube for a given video and categorise them.
 * @param {String} videoId The YouTube video ID.
 * @param {Object} options Fetch options { maxResults, useAI, removeSpam }
 * @returns {Object} { threads: Array, stats: Object }
 */
async function forumize(videoId, options = {}) {
  const maxResults = options.maxResults || 50;
  const useAI = options.useAI !== false; // Default to true
  const shouldRemoveSpam = options.removeSpam !== false; // Default to true

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    throw new Error('YOUTUBE_API_KEY is not set in environment');
  }

  // Fetch top-level comment threads from the YouTube Data API
  const url = 'https://www.googleapis.com/youtube/v3/commentThreads';
  const params = {
    part: 'snippet,replies',
    videoId,
    maxResults,
    key: apiKey
  };
  const response = await axios.get(url, { params });
  const threads = response.data.items.map(item => {
    const top = item.snippet.topLevelComment.snippet;
    const comment = {
      id: item.snippet.topLevelComment.id,
      author: top.authorDisplayName,
      text: top.textOriginal,
      publishedAt: top.publishedAt,
      likeCount: top.likeCount || 0,
      replies: []
    };
    // Extract replies if present
    if (item.replies && item.replies.comments) {
      comment.replies = item.replies.comments.map(c => ({
        id: c.id,
        author: c.snippet.authorDisplayName,
        text: c.snippet.textOriginal,
        publishedAt: c.snippet.publishedAt,
        likeCount: c.snippet.likeCount || 0,
        replies: []
      }));
    }
    return comment;
  });

  // Classify comments using AI or fallback
  let classifiedThreads;
  if (useAI) {
    classifiedThreads = await classifyCommentsAI(threads, { useFallback: !process.env.GEMINI_API_KEY });

    // Recursively classify replies with AI
    for (const thread of classifiedThreads) {
      if (thread.replies && thread.replies.length) {
        thread.replies = await classifyCommentsAI(thread.replies, { useFallback: !process.env.GEMINI_API_KEY });
      }
    }
  } else {
    // Use legacy classifier
    classifiedThreads = classifyComments(threads);
    classifiedThreads.forEach(thread => {
      if (thread.replies && thread.replies.length) {
        thread.replies = classifyComments(thread.replies);
      }
    });
  }

  // Remove spam if requested
  if (shouldRemoveSpam && useAI) {
    classifiedThreads = removeSpam(classifiedThreads);
    classifiedThreads.forEach(thread => {
      if (thread.replies && thread.replies.length) {
        thread.replies = removeSpam(thread.replies);
      }
    });
  }

  // Compute statistics
  const categories = useAI ? aiCategories : defaultCategories;
  const stats = { totalComments: 0, removedComments: 0 };
  categories.forEach(cat => {
    stats[`${cat}Count`] = 0;
  });

  const countComments = (comments) => {
    comments.forEach(comment => {
      stats.totalComments++;
      const cat = comment.category || 'genuine';
      stats[`${cat}Count`] = (stats[`${cat}Count`] || 0) + 1;
      if (comment.replies && comment.replies.length) {
        countComments(comment.replies);
      }
    });
  };
  countComments(classifiedThreads);

  categories.forEach(cat => {
    stats[`${cat}Percentage`] = stats.totalComments > 0
      ? Math.round((stats[`${cat}Count`] / stats.totalComments) * 100)
      : 0;
  });

  return {
    threads: classifiedThreads,
    stats,
    useAI,
    spamRemoved: shouldRemoveSpam
  };
}

module.exports = forumize;