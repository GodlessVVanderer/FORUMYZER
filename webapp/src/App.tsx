import React, { useEffect, useState } from 'react';
import ForumLibrary from './components/ForumLibrary';
import ForumDetail from './components/ForumDetail';
import SettingsPanel from './components/SettingsPanel';

const tabStyle: React.CSSProperties = {
  padding: '8px 16px',
  border: '1px solid #ccc',
  background: '#f0f0f0',
  cursor: 'pointer',
  marginRight: 4
};

const tabActiveStyle: React.CSSProperties = {
  ...tabStyle,
  background: '#FF0033',
  color: '#fff',
  borderColor: '#FF0033'
};

function App() {
  const [tab, setTab] = useState<'current' | 'library' | 'settings'>('library');
  const [currentForum, setCurrentForum] = useState<any>(null);

  useEffect(() => {
    // Load last forum from localStorage
    const stored = localStorage.getItem('currentForum');
    if (stored) {
      try {
        setCurrentForum(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse stored forum:', e);
      }
    }
  }, []);

  const handleSelectForum = (forum: any) => {
    setCurrentForum(forum);
    localStorage.setItem('currentForum', JSON.stringify(forum));
    setTab('current');
  };

  return (
    <div
      style={{
        maxWidth: 800,
        margin: '0 auto',
        padding: 24,
        fontFamily: 'system-ui, sans-serif',
        fontSize: 16
      }}
    >
      <h1 style={{ color: '#FF0033', fontFamily: 'Audiowide, cursive' }}>Forumyzer</h1>
      <p style={{ color: '#666', marginBottom: 24 }}>
        AI-Powered YouTube Message Boards
      </p>

      <div style={{ display: 'flex', marginBottom: 16 }}>
        <button onClick={() => setTab('library')} style={tab === 'library' ? tabActiveStyle : tabStyle}>
          Library
        </button>
        <button onClick={() => setTab('current')} style={tab === 'current' ? tabActiveStyle : tabStyle}>
          Current
        </button>
        <button onClick={() => setTab('settings')} style={tab === 'settings' ? tabActiveStyle : tabStyle}>
          Settings
        </button>
      </div>

      {tab === 'library' && <ForumLibrary onSelect={handleSelectForum} />}
      {tab === 'current' && currentForum && <ForumDetail forum={currentForum} />}
      {tab === 'current' && !currentForum && (
        <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>
          <p>Select a forum from the library to view details.</p>
        </div>
      )}
      {tab === 'settings' && <SettingsPanel />}
    </div>
  );
}

export default App;
