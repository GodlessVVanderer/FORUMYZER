# YouTube Persistent Message Board

## Overview

Forumyzer now includes a persistent message board system for YouTube that automatically fetches, filters, and categorizes comments from both regular videos and live streams using AI-powered intelligent classification.

## Features

### 🤖 AI-Powered Classification

- **Intelligent Categorization**: Uses Google Gemini API to classify comments into:
  - `spam` - Promotional content, links, scams
  - `bot` - Automated/repetitive messages
  - `toxic` - Hate speech, harassment, offensive content
  - `question` - Questions about the video
  - `feedback` - Constructive criticism
  - `discussion` - Thoughtful analysis
  - `genuine` - Positive reactions and appreciation

- **Automatic Spam Removal**: AI detects and filters out spam comments automatically
- **Confidence Scoring**: Each classification includes a confidence score
- **Fallback System**: Falls back to keyword-based classification if Gemini API is unavailable

### 🔴 Live Stream Support

- **Real-Time Processing**: Automatically detects and processes live stream chats
- **Continuous Polling**: Updates message board in real-time during live streams
- **Persistent Storage**: All messages are saved to a persistent message board
- **Auto-Merge**: New messages are merged with existing threads, preventing duplicates
- **Stream Status Tracking**: Automatically detects when streams end

### 📊 Persistent Message Boards

- **Video-Specific Boards**: Each video gets its own persistent message board
- **Continuous Updates**: Live boards update continuously with new messages
- **Historical Data**: All messages are preserved even after the stream ends
- **Statistics Tracking**: Real-time stats on comment categories and counts
- **Share Tokens**: Generate shareable links to message boards

## Setup

### Backend Configuration

1. Add your Gemini API key to `.env`:

```bash
YOUTUBE_API_KEY=your_youtube_api_key
GEMINI_API_KEY=your_gemini_api_key
```

2. Install dependencies:

```bash
cd backend
npm install
npm start
```

### Extension Setup

1. Load the extension in Chrome:
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `extension` folder

2. Visit any YouTube video or live stream

3. Click the **"📋 Forumyzer"** button for regular videos or **"🔴 Live Board"** button for live streams

## API Endpoints

### Regular Video Processing

```http
POST /api/forumize
Content-Type: application/json

{
  "videoId": "dQw4w9WgXcQ",
  "maxResults": 50,
  "useAI": true,
  "removeSpam": true
}
```

### Live Stream Processing

```http
POST /api/forumize/live
Content-Type: application/json

{
  "videoId": "dQw4w9WgXcQ",
  "pageToken": null,
  "removeSpam": true
}
```

### Check Live Status

```http
GET /api/video/:videoId/live-status
```

### Message Board Operations

```http
# Get message board by video ID
GET /api/messageboard/video/:videoId

# Get message board by ID
GET /api/messageboard/:id

# Get all message boards for user
GET /api/messageboard/library

# Mark stream as ended
POST /api/messageboard/:id/end

# Delete message board
DELETE /api/messageboard/:id
```

## How It Works

### Regular Videos

1. User clicks "📋 Forumyzer" button on YouTube video
2. Extension fetches comments via YouTube Data API
3. Comments are classified using Gemini AI
4. Spam is automatically filtered out
5. Results are saved to backend and displayed in extension popup
6. Forum is assigned a share token for public access

### Live Streams

1. User clicks "🔴 Live Board" button on live stream
2. Extension checks if video is currently live
3. Fetches live chat messages via YouTube Live Chat API
4. Messages are classified in real-time using AI
5. Spam is filtered automatically
6. Message board is created/updated in database
7. Background polling continues every 5 seconds (YouTube default)
8. New messages are merged with existing threads
9. When stream ends, polling stops and board is marked as ended

## Architecture

```
YouTube Video/Stream
        ↓
Content Script (detects live/regular)
        ↓
Background Worker (manages polling)
        ↓
Backend API (processes & classifies)
        ↓
AI Classifier (Gemini API)
        ↓
Message Board Model (persistent storage)
        ↓
Database (JSON/PostgreSQL)
```

## Data Flow

### Live Stream Data Flow

```
1. Initial Request
   → Check if video is live
   → Get liveChatId
   → Fetch initial messages

2. Classification
   → Batch process with Gemini AI
   → Assign categories and confidence scores
   → Mark spam for removal

3. Persistence
   → Create/update message board
   → Merge new messages with existing
   → Update statistics

4. Polling Loop
   → Wait for pollingIntervalMillis (5s default)
   → Fetch next page of messages
   → Repeat classification and persistence
   → Continue until stream ends
```

## Statistics

The system tracks and displays:

- **Total Comments**: Total number of comments processed
- **Category Counts**: Number of comments per category
- **Category Percentages**: Distribution across categories
- **Removed Comments**: Number of spam comments filtered
- **Message Count**: Live tracking of message volume
- **Last Update**: Timestamp of last message board update

## Color Coding

Comments are color-coded by category:

- 🔴 **Spam**: Gray (filtered out by default)
- 🤖 **Bot**: Orange
- ☠️ **Toxic**: Red (filtered out by default)
- ❓ **Question**: Blue
- 💬 **Feedback**: Purple
- 🗣️ **Discussion**: Green
- 💚 **Genuine**: Light green

## Advanced Features

### Batch Processing

For efficiency, comments are processed in batches of 20 when using AI classification.

### Confidence Thresholds

Each classification includes a confidence score (0.0 - 1.0). You can adjust filtering based on confidence levels.

### Fallback Classification

If Gemini API is unavailable or rate-limited, the system automatically falls back to enhanced keyword-based classification.

### Auto-Merge Algorithm

Live messages are merged intelligently:
- Duplicate messages (by ID) are prevented
- Messages are sorted by timestamp (newest first)
- Thread structure is preserved

## Extension Features

### Live Stream Detection

The extension automatically detects live streams by checking for:
- `.ytp-live-badge` element
- `.ytp-live` indicator
- `[aria-label*="LIVE"]` attributes

### Visual Indicators

- Regular videos: 📋 Red button
- Live streams: 🔴 Pulsing red button with animation
- Active board: ✅ Green button

### Background Polling

The extension maintains a background service worker that:
- Polls live chats every 5 seconds
- Stores results in Chrome local storage
- Automatically stops when streams end
- Handles multiple simultaneous live boards

## Troubleshooting

### Common Issues

**AI Classification not working**
- Check that `GEMINI_API_KEY` is set in `.env`
- Verify API key has access to Gemini API
- Check API quota limits
- System will fall back to keyword classification

**Live polling stopped**
- Check if stream is still active
- Verify YouTube API quota
- Check browser console for errors
- Restart extension if needed

**Messages not updating**
- Ensure background service worker is active
- Check network connectivity
- Verify API responses in Network tab
- Clear Chrome storage and restart

### Debug Mode

Enable debug logging:

```javascript
// In background.js
console.log('Live polling:', result);

// In backend
console.log('Gemini response:', resultText);
```

## Performance Considerations

- **API Quotas**: YouTube Data API has daily quotas (10,000 units/day by default)
- **Live Chat Quota**: Each live chat poll costs 5 units
- **Gemini Quota**: Free tier allows 60 requests/minute
- **Batch Processing**: Reduces API calls by processing 20 comments at once
- **Fallback System**: Ensures service continuity when APIs are unavailable

## Future Enhancements

- [ ] Real-time WebSocket updates instead of polling
- [ ] PostgreSQL/MongoDB for production storage
- [ ] Advanced sentiment analysis
- [ ] Topic clustering and trending detection
- [ ] Moderator dashboard
- [ ] Export to CSV/JSON
- [ ] Multi-language support
- [ ] Custom category definitions
- [ ] Machine learning model fine-tuning
- [ ] Rate limiting and caching

## License

Part of the Forumyzer project. See main README for license information.
