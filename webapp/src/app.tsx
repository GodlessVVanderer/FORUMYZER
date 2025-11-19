import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import ForumLibrary from './components/ForumLibrary';
import SettingsPanel from './components/SettingsPanel';
import ErrorBoundary from './components/ErrorBoundary';
import { sanitizeText, extractVideoId, sanitizeErrorMessage, RateLimiter } from './utils/security';
import './styles.css';

// Create rate limiter instance
const rateLimiter = new RateLimiter();

interface Comment {
  id: string;
  author: string;
  text: string;
  category: string;
  replies?: Comment[];
  upvotes?: number;
  downvotes?: number;
}

function WebApp() {
  const [tab, setTab] = useState<'forumize' | 'library' | 'settings'>('forumize');
  const [videoUrl, setVideoUrl] = useState('');
  const [currentForum, setCurrentForum] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showBlinds, setShowBlinds] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [forumId, setForumId] = useState<string | null>(null);

  const handleForumyze = async () => {
    // Rate limiting: max 5 forumize attempts per minute
    if (!rateLimiter.isAllowed('forumize', 5, 60000)) {
      setError('Too many requests. Please wait a minute before trying again.');
      return;
    }

    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      setError('Invalid YouTube URL. Please enter a valid YouTube link.');
      return;
    }

    setError(null);
    setShowBlinds(true);

    setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'}/api/forumize`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ videoId })
        });

        if (!res.ok) throw new Error('Failed to forumize');
        const data = await res.json();

        // Get video info
        const oEmbed = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
        if (oEmbed.ok) {
          const info = await oEmbed.json();
          data.videoTitle = info.title;
          data.videoChannel = info.author_name;
        }

        data.videoId = videoId;
        setCurrentForum(data);

        // Save to library
        const saveRes = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'}/api/forum/save`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            videoId,
            videoTitle: data.videoTitle,
            videoChannel: data.videoChannel,
            forumData: data
          })
        });

        if (!saveRes.ok) {
          const errorData = await saveRes.json();
          throw new Error(errorData.error || 'Failed to save forum');
        }

        const saved = await saveRes.json();
        setForumId(saved.id);
      } catch (err: any) {
        setError(sanitizeErrorMessage(err));
        console.error('Forumize error:', err);
      } finally {
        setLoading(false);
        setShowBlinds(false);
      }
    }, 1500);
  };

  const handlePodcast = async () => {
    if (!forumId) return;

    // Rate limiting: max 3 podcast generations per minute
    if (!rateLimiter.isAllowed('podcast', 3, 60000)) {
      setError('Too many podcast requests. Please wait before trying again.');
      return;
    }

    setLoadingAudio(true);
    setError(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'}/api/forum/${forumId}/audio`);

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to generate podcast');
      }

      const data = await res.json();
      setAudioUrl(data.audioUrl);
    } catch (err: any) {
      setError(sanitizeErrorMessage(err));
      console.error('Podcast error:', err);
    } finally {
      setLoadingAudio(false);
    }
  };

  const handleSelectForum = (forum: any) => {
    setCurrentForum(forum);
    setForumId(forum.id);
    setTab('forumize');
  };

  const CommentItem = ({ comment, depth = 0 }: { comment: Comment; depth?: number }) => {
    const [upvotes, setUpvotes] = useState(comment.upvotes || 0);
    const [downvotes, setDownvotes] = useState(comment.downvotes || 0);
    const isBotDetected = comment.category === 'bot';

    // Sanitize user-generated content to prevent XSS
    const safeAuthor = sanitizeText(comment.author);
    const safeText = sanitizeText(comment.text);
    const safeCategory = sanitizeText(comment.category);

    return (
      <div className={`comment-wrapper ${comment.category === 'toxic' ? 'hell-comment' : ''}`} style={{ marginLeft: depth * 32 }}>
        <div className="comment-author">
          <div className="avatar">{safeAuthor[0] || '?'}</div>
          <span className="comment-author-name">{safeAuthor}</span>
          <span className={`category-badge ${comment.category}`}>{safeCategory}</span>
          {isBotDetected && <span className="category-badge bot">🤖 BOT</span>}
        </div>
        <div className="comment-text">{safeText}</div>
        <div className="comment-actions">
          <button className="upvote-button" onClick={() => setUpvotes(upvotes + 1)}>
            <span className="material-icons">thumb_up</span>
            {upvotes > 0 && upvotes}
          </button>
          <button className="downvote-button" onClick={() => setDownvotes(downvotes + 1)}>
            <span className="material-icons">thumb_down</span>
            {downvotes > 0 && downvotes}
          </button>
          <button className="reply-button">
            <span className="material-icons">reply</span>
            Reply
          </button>
        </div>
        {comment.replies?.map(reply => <CommentItem key={reply.id} comment={reply} depth={depth + 1} />)}
      </div>
    );
  };

  const filteredThreads = currentForum && activeCategory !== 'all'
    ? currentForum.threads.filter((t: Comment) => t.category === activeCategory)
    : currentForum?.threads || [];

  return (
    <div className="app-container">
      {showBlinds && (
        <div className="blinds-overlay">
          <div className="blinds-container">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="blind" style={{ animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
          <div className="blinds-text">FORUMYZING...</div>
        </div>
      )}

      <div className="app-header">
        <div className="logo">
          <h1>FORUMYZER</h1>
        </div>
      </div>

      <div className="app-main">
        <div className="forum-tabs">
          <button onClick={() => setTab('forumize')} className={`tab ${tab === 'forumize' ? 'active' : ''}`}>
            <span className="material-icons">movie</span>
            Forumyze
          </button>
          <button onClick={() => setTab('library')} className={`tab ${tab === 'library' ? 'active' : ''}`}>
            <span className="material-icons">video_library</span>
            Library
          </button>
          <button onClick={() => setTab('settings')} className={`tab ${tab === 'settings' ? 'active' : ''}`}>
            <span className="material-icons">settings</span>
            Settings
          </button>
        </div>

        {tab === 'forumize' && (
          <>
            <div className="input-section">
              <div className="url-input-wrapper">
                <span className="material-icons">link</span>
                <input
                  type="text"
                  placeholder="Paste YouTube URL..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleForumyze()}
                />
              </div>
              <button onClick={handleForumyze} disabled={loading} className="forumize-button">
                {loading ? 'FORUMYZING...' : 'FORUMYZE?'}
              </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            {currentForum && (
              <div className="content-area">
                <div className="video-container">
                  <iframe
                    src={`https://www.youtube.com/embed/${currentForum.videoId}`}
                    allowFullScreen
                  />
                </div>

                <div className="forum-container">
                  <div className="forum-header">
                    <div>
                      <h2 className="forum-title">{sanitizeText(currentForum.videoTitle || 'Forum')}</h2>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>
                        {sanitizeText(currentForum.videoChannel || '')}
                      </p>
                    </div>
                    <button onClick={handlePodcast} disabled={loadingAudio} className="btn-primary">
                      🎙️ {loadingAudio ? 'Generating...' : 'Podcast'}
                    </button>
                  </div>

                  {audioUrl && (
                    <div style={{ padding: 16, borderBottom: '1px solid var(--border)' }}>
                      <audio controls style={{ width: '100%' }}>
                        <source src={audioUrl} />
                      </audio>
                    </div>
                  )}

                  {currentForum.stats && (
                    <div className="forum-stats" style={{ padding: 16, borderBottom: '1px solid var(--border)' }}>
                      <span>{currentForum.stats.totalComments} comments</span>
                      <span style={{ color: 'var(--cat-genuine)' }}>{currentForum.stats.genuinePercentage}% genuine</span>
                      <span style={{ color: 'var(--cat-spam)' }}>{currentForum.stats.spamPercentage}% spam</span>
                      <span style={{ color: 'var(--cat-bot)' }}>{currentForum.stats.botPercentage}% bot</span>
                    </div>
                  )}

                  <div className="forum-tabs">
                    <button onClick={() => setActiveCategory('all')} className={`tab ${activeCategory === 'all' ? 'active' : ''}`}>
                      All
                    </button>
                    <button onClick={() => setActiveCategory('genuine')} className={`tab ${activeCategory === 'genuine' ? 'active' : ''}`}>
                      Genuine
                    </button>
                    <button onClick={() => setActiveCategory('question')} className={`tab ${activeCategory === 'question' ? 'active' : ''}`}>
                      Questions
                    </button>
                    <button onClick={() => setActiveCategory('spam')} className={`tab ${activeCategory === 'spam' ? 'active' : ''}`}>
                      Spam
                    </button>
                    <button onClick={() => setActiveCategory('bot')} className={`tab ${activeCategory === 'bot' ? 'active' : ''}`}>
                      Bots
                    </button>
                    <button onClick={() => setActiveCategory('toxic')} className={`tab hell-tab ${activeCategory === 'toxic' ? 'active' : ''}`}>
                      🔥 Hell
                    </button>
                  </div>

                  <div className="forum-posts">
                    {filteredThreads.length > 0 ? (
                      filteredThreads.map((t: Comment) => <CommentItem key={t.id} comment={t} />)
                    ) : (
                      <div className="empty-state">
                        <span className="material-icons">forum</span>
                        <h3>No Comments</h3>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {!currentForum && !loading && (
              <div className="empty-state" style={{ height: '60vh' }}>
                <span className="material-icons" style={{ fontSize: 72 }}>movie</span>
                <h3>Paste a YouTube URL and click FORUMYZE?</h3>
              </div>
            )}
          </>
        )}

        {tab === 'library' && <ForumLibrary onSelect={handleSelectForum} />}
        {tab === 'settings' && <SettingsPanel />}
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <WebApp />
    </ErrorBoundary>
  </React.StrictMode>
);