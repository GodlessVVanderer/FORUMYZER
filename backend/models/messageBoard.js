const { v4: uuidv4 } = require('uuid');
const db = require('../db');

/**
 * Persistent Message Board Model
 * Handles continuous updates for live streams and persistent storage
 */

/**
 * Create or update a message board for a video
 * @param {Object} data Board data
 * @param {String} userId Optional user ID
 * @returns {Object} Message board object
 */
function createOrUpdate(data, userId = null) {
  const { videoId, videoTitle, videoChannel, isLive, liveChatId, threads, stats } = data;

  // Check if a board already exists for this video
  const existing = db.data.messageBoards?.find(board => board.videoId === videoId);

  if (existing) {
    // Update existing board
    existing.threads = mergeThreads(existing.threads, threads);
    existing.stats = stats;
    existing.updatedAt = new Date().toISOString();
    existing.isLive = isLive;
    existing.liveChatId = liveChatId;
    existing.messageCount = (existing.messageCount || 0) + threads.length;
    db.save();
    return existing;
  }

  // Create new board
  const board = {
    id: uuidv4(),
    videoId,
    videoTitle,
    videoChannel,
    isLive,
    liveChatId,
    threads,
    stats,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId,
    isPublic: true,
    shareToken: uuidv4(),
    messageCount: threads.length,
    lastPageToken: null,
    pollingIntervalMillis: 5000
  };

  if (!db.data.messageBoards) {
    db.data.messageBoards = [];
  }

  db.data.messageBoards.push(board);
  db.save();
  return board;
}

/**
 * Merge new threads with existing threads (for live updates)
 * Prevents duplicates and maintains order
 */
function mergeThreads(existingThreads, newThreads) {
  const existingIds = new Set(existingThreads.map(t => t.id));
  const uniqueNewThreads = newThreads.filter(t => !existingIds.has(t.id));

  // Combine and sort by publishedAt (newest first)
  return [...existingThreads, ...uniqueNewThreads].sort((a, b) => {
    const dateA = new Date(a.publishedAt || 0);
    const dateB = new Date(b.publishedAt || 0);
    return dateB - dateA;
  });
}

/**
 * Find message board by video ID
 */
function findByVideoId(videoId) {
  if (!db.data.messageBoards) return null;
  return db.data.messageBoards.find(board => board.videoId === videoId);
}

/**
 * Find message board by ID
 */
function findById(id) {
  if (!db.data.messageBoards) return null;
  return db.data.messageBoards.find(board => board.id === id);
}

/**
 * Find all message boards by user
 */
function findByUser(userId) {
  if (!db.data.messageBoards) return [];
  if (!userId) return db.data.messageBoards; // Return all for demo
  return db.data.messageBoards.filter(board => board.userId === userId);
}

/**
 * Update page token for live polling
 */
function updatePageToken(boardId, pageToken) {
  const board = findById(boardId);
  if (board) {
    board.lastPageToken = pageToken;
    board.updatedAt = new Date().toISOString();
    db.save();
  }
  return board;
}

/**
 * Get active live boards (for background polling)
 */
function getActiveLiveBoards() {
  if (!db.data.messageBoards) return [];
  return db.data.messageBoards.filter(board => board.isLive === true);
}

/**
 * Mark a board as ended (when live stream ends)
 */
function markAsEnded(boardId) {
  const board = findById(boardId);
  if (board) {
    board.isLive = false;
    board.endedAt = new Date().toISOString();
    db.save();
  }
  return board;
}

/**
 * Delete a message board
 */
function deleteBoard(boardId) {
  if (!db.data.messageBoards) return false;
  const index = db.data.messageBoards.findIndex(board => board.id === boardId);
  if (index === -1) return false;
  db.data.messageBoards.splice(index, 1);
  db.save();
  return true;
}

/**
 * Find board by share token
 */
function findByShareToken(token) {
  if (!db.data.messageBoards) return null;
  return db.data.messageBoards.find(board => board.shareToken === token);
}

module.exports = {
  createOrUpdate,
  findByVideoId,
  findById,
  findByUser,
  updatePageToken,
  getActiveLiveBoards,
  markAsEnded,
  deleteBoard,
  findByShareToken
};
