import React, { useState } from 'react';
import ForumLibrary from './components/ForumLibrary';
import ForumDetail from './components/ForumDetail';
import SettingsPanel from './components/SettingsPanel';
import './App.css';

function App() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedForum, setSelectedForum] = useState<any>(null);
  const [error, setError] = useState('');

  const handleSignIn = () => {
    setIsSignedIn(true);
  };

  const handleProcessVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl.trim()) {
      setError('Please enter a YouTube URL');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/forum/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to process video');
      }

      const forum = await response.json();
      setSelectedForum(forum);
      setVideoUrl('');
    } catch (err: any) {
      setError(err.message || 'Error processing video');
    } finally {
      setLoading(false);
    }
  };

  if (!isSignedIn) {
    return (
      <div className="landing-page">
        <header className="hero-header">
          <div className="logo">
            <h1>FORUMYZER</h1>
          </div>
          <button className="sign-in-btn" onClick={handleSignIn}>
            <span className="material-icons">account_circle</span>
            Sign In with Google
          </button>
        </header>

        <div style={{ padding: '40px 24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
          <section className="hero-section" style={{ marginBottom: '60px' }}>
            <h2>AI-Powered YouTube Message Boards</h2>
            <p className="hero-subtitle">
              Transform chaotic YouTube comments into organized forum discussions with AI-powered spam detection
            </p>
          </section>

          <section style={{ marginBottom: '80px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '32px', marginBottom: '24px' }}>Get Started</h2>
            <p style={{ color: '#aaa', marginBottom: '32px' }}>Sign in to analyze any YouTube video's comments in real-time</p>
            <button className="cta-button" onClick={handleSignIn}>
              <span className="material-icons">login</span>
              Sign In with Google
            </button>
          </section>

          <section className="features-section">
            <div className="feature-card">
              <span className="material-icons feature-icon">smart_toy</span>
              <h3>AI Categorization</h3>
              <p>Automatically sorts comments: Discussion, Questions, Feedback, Genuine, Bot, Spam, Toxic</p>
            </div>

            <div className="feature-card">
              <span className="material-icons feature-icon">filter_list</span>
              <h3>Advanced Filtering</h3>
              <p>Filter by sentiment, confidence, category. Sort by newest, oldest, or engagement.</p>
            </div>

            <div className="feature-card">
              <span className="material-icons feature-icon">block</span>
              <h3>Spam Protection</h3>
              <p>Detects spam, bots, and toxic content using Gemini AI analysis.</p>
            </div>

            <div className="feature-card">
              <span className="material-icons feature-icon">library_books</span>
              <h3>Forum Library</h3>
              <p>Save and organize boards from all your favorite videos.</p>
            </div>

            <div className="feature-card">
              <span className="material-icons feature-icon">live_tv</span>
              <h3>Live Stream Support</h3>
              <p>Real-time message board updates for YouTube live streams.</p>
            </div>

            <div className="feature-card">
              <span className="material-icons feature-icon">insights</span>
              <h3>Analytics</h3>
              <p>View sentiment distribution, bot detection, engagement metrics.</p>
            </div>
          </section>

          <section style={{ marginTop: '80px', textAlign: 'center', padding: '40px', background: 'rgba(255,0,0,0.05)', borderRadius: '12px' }}>
            <h2 style={{ fontSize: '32px', marginBottom: '24px', color: '#fff' }}>Why FORUMYZER?</h2>
            <p style={{ color: '#aaa', fontSize: '16px', lineHeight: '1.8', maxWidth: '800px', margin: '0 auto' }}>
              75% of comments on civil rights videos are coordinated spam. FORUMYZER uses AI to separate genuine discussion from bot farms, organizing conversations into structured forums.
            </p>
          </section>
        </div>

        <footer className="landing-footer" style={{ marginTop: '80px' }}>
          <p>Powered by Google Gemini AI & YouTube Data API</p>
        </footer>
      </div>
    );
  }

  // Main App (after sign-in)
  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo">
          <h1>FORUMYZER</h1>
        </div>
        <div className="user-profile">
          <button className="sign-out-btn" onClick={() => setIsSignedIn(false)}>
            Sign Out
          </button>
        </div>
      </header>

      <main className="app-main">
        {!selectedForum ? (
          <>
            {/* URL Input Section */}
            <div className="input-section">
              <div className="url-input-wrapper">
                <span className="material-icons">link</span>
                <input
                  type="text"
                  placeholder="Paste YouTube video URL..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleProcessVideo(e as any)}
                />
              </div>
              <button onClick={handleProcessVideo} disabled={loading}>
                {loading ? 'Processing...' : 'Analyze'}
              </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            {/* Forum Library */}
            <div style={{ maxWidth: '900px', margin: '0 auto', width: '100%' }}>
              <ForumLibrary onSelect={setSelectedForum} />
            </div>
          </>
        ) : (
          <ForumDetail forum={selectedForum} onBack={() => setSelectedForum(null)} />
        )}
      </main>
    </div>
  );
}

export default App;
