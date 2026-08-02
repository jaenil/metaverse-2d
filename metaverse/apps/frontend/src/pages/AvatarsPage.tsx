import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAvailableAvatars, updateMetadata } from '../api';
import type { Avatar } from '../types';
import '../styles/dashboard.css'; // Reusing dashboard styles

export function AvatarsPage() {
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [selected, setSelected] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getAvailableAvatars()
      .then((res) => {
        if (res.status === 200) {
          setAvatars(res.data.avatars);
          if (res.data.avatars.length > 0) setSelected(res.data.avatars[0].id);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = async (avatarId: string) => {
    setSelected(avatarId);
    setSaving(true);
    try {
      await updateMetadata(avatarId);
      // Optional: Show toast here
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };  return (
    <div className="dash-root">
      
      {/* ── Navigation ────────────────────────── */}
      <header className="dash-header">
        <div className="dash-brand" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
          <span className="dash-dot" />
          METAVERSE
        </div>
        <nav className="dash-nav">
          <button
            className="dash-nav-btn logout"
            onClick={() => navigate('/dashboard')}
          >
            ← Back to Dashboard
          </button>
        </nav>
      </header>

      {/* ── Body ──────────────────────────────── */}
      <div className="dash-body">

        {/* Title row */}
        <div className="dash-title-row">
          <div className="dash-title-row-left">
            <span className="dash-eyebrow">// character customization</span>
            <h2>Select Avatar</h2>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-grid">
            {[1, 2, 3].map((i) => (
              <div className="dash-skeleton" key={i}>
                <div className="dash-skeleton-inner" />
              </div>
            ))}
          </div>
        ) : avatars.length === 0 ? (
          <div className="dash-empty-state">
            <span className="dash-empty-icon">◉</span>
            <h3 style={{ fontFamily: 'var(--font-retro)', fontSize: '1.1rem', letterSpacing: '0.06em' }}>
              No avatars found
            </h3>
            <p>Ask an admin to create some avatars in the Admin Panel.</p>
          </div>
        ) : (
          <div className="space-grid">
            {avatars.map((avatar) => {
              const isSelected = selected === avatar.id;
              return (
                <div 
                  className="space-card" 
                  key={avatar.id} 
                  onClick={() => handleSelect(avatar.id)}
                  style={{ 
                    cursor: 'pointer',
                    borderColor: isSelected ? 'var(--accent)' : 'var(--border)',
                    boxShadow: isSelected ? '0 0 0 1px var(--accent), 0 8px 30px rgba(var(--accent-raw),0.15)' : 'none',
                    transform: isSelected ? 'translateY(-2px)' : 'none'
                  }}
                >
                  {/* Pixel art preview */}
                  <div className="space-card-preview" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {avatar.imageUrl ? (
                      <img 
                        src={avatar.imageUrl} 
                        alt={avatar.name} 
                        style={{ width: '64px', height: '64px', imageRendering: 'pixelated', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' }}
                      />
                    ) : (
                      <div style={{ fontSize: '2rem', color: 'var(--muted)' }}>◉</div>
                    )}
                  </div>

                  {/* Card body */}
                  <div className="space-card-body">
                    <div className="space-card-meta">
                      <span className="space-card-name" style={{ color: isSelected ? 'var(--accent-hi)' : 'var(--text)' }}>
                        {avatar.name}
                      </span>
                    </div>
                    <span className="space-card-id">
                      id: {avatar.id.slice(0, 8)}…
                    </span>
                    <div className="space-card-actions">
                      <button 
                        className={isSelected ? 'space-enter-btn' : 'dash-nav-btn'} 
                        style={{ width: '100%' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelect(avatar.id);
                        }}
                      >
                        {saving && isSelected ? 'Saving...' : isSelected ? '✓ Selected' : 'Select'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
