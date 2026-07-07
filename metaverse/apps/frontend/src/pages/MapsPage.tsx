import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMaps } from '../api';
import type { GameMap } from '../types';
import '../styles/dashboard.css';

export function MapsPage() {
  const [maps, setMaps] = useState<GameMap[]>([]);
  const [selected, setSelected] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getMaps()
      .then((res) => {
        if (res.status === 200) {
          setMaps(res.data.maps);
          if (res.data.maps.length > 0) setSelected(res.data.maps[0].id);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="dash-root">
      
      {/* ── Navigation ────────────────────────── */}
      <header className="dash-header">
        <div className="dash-brand">
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
            <span className="dash-eyebrow">// map selection</span>
            <h2>Available Maps</h2>
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
        ) : maps.length === 0 ? (
          <div className="dash-empty-state">
            <span className="dash-empty-icon">⬡</span>
            <h3 style={{ fontFamily: 'var(--font-retro)', fontSize: '1.1rem', letterSpacing: '0.06em' }}>
              No maps available
            </h3>
            <p>Maps can be created by an administrator in the Admin Panel.</p>
          </div>
        ) : (
          <div className="space-grid">
            {maps.map((m) => {
              const isSelected = selected === m.id;
              return (
                <div 
                  className="space-card" 
                  key={m.id} 
                  onClick={() => setSelected(m.id)}
                  style={{ 
                    cursor: 'pointer',
                    borderColor: isSelected ? 'var(--accent)' : 'var(--border)',
                    boxShadow: isSelected ? '0 0 0 1px var(--accent), 0 8px 30px rgba(217,56,30,0.15)' : 'none',
                    transform: isSelected ? 'translateY(-2px)' : 'none'
                  }}
                >
                  {/* Map preview */}
                  <div className="space-card-preview" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {m.thumbnail ? (
                      <img 
                        src={m.thumbnail} 
                        alt={m.name} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }}
                      />
                    ) : (
                      <div style={{ fontSize: '2rem', color: 'var(--muted)' }}>⬡</div>
                    )}
                  </div>

                  {/* Card body */}
                  <div className="space-card-body">
                    <div className="space-card-meta">
                      <span className="space-card-name" style={{ color: isSelected ? 'var(--accent-hi)' : 'var(--text)' }}>
                        {m.name}
                      </span>
                      <span className="space-card-dim">
                        {m.dimensions ?? `${m.width}×${m.height}`}
                      </span>
                    </div>
                    <span className="space-card-id">
                      id: {m.id.slice(0, 8)}…
                    </span>
                    <div className="space-card-actions">
                      <button 
                        className={isSelected ? 'space-enter-btn' : 'dash-nav-btn'} 
                        style={{ width: '100%' }}
                        onClick={() => setSelected(m.id)}
                      >
                        {isSelected ? '✓ Selected' : 'Select'}
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
