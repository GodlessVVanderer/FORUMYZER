import React, { useEffect, useState } from 'react';
import { sanitizeText, sanitizeErrorMessage } from '../utils/security';

interface ForumRecord {
  id: string;
  videoId: string;
  videoTitle: string;
  videoChannel: string;
  forumData: any;
  createdAt: string;
}

interface Props {
  onSelect: (forum: any) => void;
}

export default function ForumLibrary({ onSelect }: Props) {
  const [forums, setForums] = useState<ForumRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadLibrary() {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'}/api/forum/library`);
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || res.statusText);
        }
        const data = await res.json();
        setForums(data);
      } catch (err: any) {
        setError(sanitizeErrorMessage(err));
        console.error('Library load error:', err);
      }
    }
    loadLibrary();
  }, []);

  // Sanitize search input
  const safeSearch = sanitizeText(search);

  const filtered = forums.filter(f =>
    f.videoTitle?.toLowerCase().includes(safeSearch.toLowerCase())
  );

  return (
    <div>
      <h2>📚 Your Forums</h2>
      <input
        type="text"
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ width: '100%', padding: 8, marginBottom: 12, fontSize: 16 }}
      />
      {error && <p style={{ color: '#F44336' }}>{error}</p>}
      {filtered.length === 0 && !error && <p>No forums found.</p>}
      <div style={{ display: 'grid', gap: 12 }}>
        {filtered.map(forum => (
          <div
            key={forum.id}
            onClick={() => onSelect(forum.forumData ? { ...forum.forumData, videoTitle: forum.videoTitle, videoChannel: forum.videoChannel, id: forum.id } : forum)}
            style={{
              border: '1px solid #eee',
              borderRadius: 8,
              padding: 12,
              cursor: 'pointer',
              backgroundColor: '#fff',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
          >
            <strong>{sanitizeText(forum.videoTitle || forum.videoId)}</strong>
            <p style={{ fontSize: 14, color: '#666', margin: '4px 0' }}>
              {sanitizeText(forum.videoChannel || 'Unknown')}
            </p>
            <p style={{ fontSize: 12, color: '#999' }}>
              {new Date(forum.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}