import React, { useState } from 'react';
import ForumLibrary from './components/ForumLibrary';
import ForumDetail from './components/ForumDetail';
import SettingsPanel from './components/SettingsPanel';
import './App.css';

function App() {
  const [isSignedIn, setIsSignedIn] = useState(false);

  const handleSignIn = () => {
    // TODO: Implement Google OAuth
    setIsSignedIn(true);
  };

  if (!isSignedIn) {
    return (
      <div className="landing-page">
        {/* Hero Header */}
        <header className="hero-header">
          <div className="logo">
            <h1>FORUMYZER</h1>
          </div>
          <button className="sign-in-btn" onClick={handleSignIn}>
            <span className="material-icons">account_circle</span>
            Sign In
          </button>
        </header>

        {/* Hero Section */}
        <section className="hero-section">
          <h2>AI-Powered YouTube Message Boards</h2>
          <p className="hero-subtitle">
            Transform YouTube comments into organized, AI-categorized forums with automatic spam filtering
          </p>
        </section>

        {/* Features Grid */}
        <section className="features-section">
          <div className="feature-card">
            <span className="material-icons feature-icon">smart_toy</span>
            <h3>AI Categorization</h3>
            <p>7 smart categories: Discussion, Questions, Feedback, Genuine, Bot, Spam, Toxic</p>
            <div className="category-badges">
              <span className="badge discussion">🗣️ Discussion</span>
              <span className="badge question">❓ Question</span>
              <span className="badge feedback">💡 Feedback</span>
              <span className="badge genuine">👍 Genuine</span>
              <span className="badge bot">🤖 Bot</span>
              <span className="badge spam">🚫 Spam</span>
              <span className="badge toxic">⚠️ Toxic</span>
            </div>
          </div>

          <div className="feature-card">
            <span className="material-icons feature-icon">filter_list</span>
            <h3>Advanced Filtering</h3>
            <p>Filter by sentiment, confidence level, and category. Sort by newest, oldest, or most engaging.</p>
            <div className="filter-preview">
              <div className="filter-item">📊 Sentiment Analysis</div>
              <div className="filter-item">🎯 Confidence Scores</div>
              <div className="filter-item">🔄 Real-time Sorting</div>
            </div>
          </div>

          <div className="feature-card">
            <span className="material-icons feature-icon">podcasts</span>
            <h3>AI Podcast Generator</h3>
            <p>Generate audio summaries from top 5 comments in each category for any video</p>
            <div className="podcast-preview">
              <div className="audio-wave">🎙️ 🔊 📻</div>
              <p className="audio-desc">Converts forum discussions into podcast format</p>
            </div>
          </div>

          <div className="feature-card">
            <span className="material-icons feature-icon">live_tv</span>
            <h3>Live Stream Support</h3>
            <p>Real-time message board updates for YouTube live streams with 5-second polling</p>
            <div className="live-preview">
              <span className="live-indicator">🔴 LIVE</span>
              <p>Auto-categorizes chat as it happens</p>
            </div>
          </div>

          <div className="feature-card">
            <span className="material-icons feature-icon">library_books</span>
            <h3>Forum Library</h3>
            <p>Save and organize message boards from all your favorite videos in one place</p>
            <div className="library-preview">
              <div className="library-item">📚 Persistent Storage</div>
              <div className="library-item">🔗 Shareable Links</div>
              <div className="library-item">🔍 Search & Filter</div>
            </div>
          </div>

          <div className="feature-card">
            <span className="material-icons feature-icon">block</span>
            <h3>Spam Protection</h3>
            <p>Automatic detection and removal of spam, bots, and toxic content using Gemini AI</p>
            <div className="spam-preview">
              <div className="spam-stats">
                <span>🤖 Bot Detection</span>
                <span>🚫 Spam Filtering</span>
                <span>⚠️ Toxicity Analysis</span>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <h2>Ready to Transform YouTube Comments?</h2>
          <button className="cta-button" onClick={handleSignIn}>
            <span className="material-icons">login</span>
            Sign In with Google
          </button>
          <p className="cta-subtitle">Free to use • No credit card required</p>
        </section>

        {/* Footer */}
        <footer className="landing-footer">
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
        <ForumLibrary onSelect={() => {}} />
      </main>
    </div>
  );
}

export default App;
