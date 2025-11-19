import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import ForumLibrary from './components/ForumLibrary';
import ForumDetail from './components/ForumDetail';
import SettingsPanel from './components/SettingsPanel';
import './styles.css';

function WebApp() {
  const [tab, setTab] = useState<'current' | 'library' | 'settings'>('library');
  const [currentForum, setCurrentForum] = useState<any>(null);

  useEffect(() => {
    // Optionally load last forum from localStorage
    const stored = localStorage.getItem('currentForum');
    if (stored) {
      setCurrentForum(JSON.parse(stored));
    }
  }, []);

  const handleSelectForum = (forum: any) => {
    setCurrentForum(forum);
    localStorage.setItem('currentForum', JSON.stringify(forum));
    setTab('current');
  };

  return (
    <div className="app-container">
      <div className="app-header">
        <div className="logo">
          <h1>FORUMYZER</h1>
        </div>
      </div>
      <div className="app-main">
        <div className="forum-tabs">
          <button
            onClick={() => setTab('library')}
            className={`tab ${tab === 'library' ? 'active' : ''}`}
          >
            <span className="material-icons">video_library</span>
            Library
          </button>
          <button
            onClick={() => setTab('current')}
            className={`tab ${tab === 'current' ? 'active' : ''}`}
          >
            <span className="material-icons">forum</span>
            Current Forum
          </button>
          <button
            onClick={() => setTab('settings')}
            className={`tab ${tab === 'settings' ? 'active' : ''}`}
          >
            <span className="material-icons">settings</span>
            Settings
          </button>
        </div>

        {tab === 'library' && <ForumLibrary onSelect={handleSelectForum} />}
        {tab === 'current' && currentForum && <ForumDetail forum={currentForum} />}
        {tab === 'current' && !currentForum && (
          <div className="empty-state">
            <span className="material-icons">forum</span>
            <h3>No Forum Selected</h3>
            <p>Select a forum from the library to view details.</p>
          </div>
        )}
        {tab === 'settings' && <SettingsPanel />}
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <WebApp />
  </React.StrictMode>
);