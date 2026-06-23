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

  const current = maps.find((m) => m.id === selected);

  return (
    <div className="dash-root">
      <header className="dash-header">
        <div className="dash-brand">
          <span className="dash-dot" />
          Metaverse
        </div>
        <nav className="dash-nav">
          <button className="dash-nav-btn" onClick={() => navigate('/dashboard')}>Dashboard</button>
        </nav>
      </header>

      <main className="dash-main">
        <h2>Map Selection</h2>
        <p style={{ color: 'var(--subdued)', marginBottom: '1.5rem' }}>Choose a map for your space.</p>

        {loading ? (
          <p className="dash-empty">Loading maps…</p>
        ) : maps.length === 0 ? (
          <p className="dash-empty">No maps available. Ask an admin to create some.</p>
        ) : (
          <div className="space-grid">
            {maps.map((m) => (
              <div
                className={`space-card ${selected === m.id ? 'selected' : ''}`}
                key={m.id}
                onClick={() => setSelected(m.id)}
                style={{ cursor: 'pointer' }}
              >
                <div className="space-card-info">
                  <h3>{m.name}</h3>
                  <span className="space-dim">{m.dimensions}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {current && (
          <div className="create-panel" style={{ marginTop: '1.5rem' }}>
            <h3>Selected: {current.name}</h3>
            <p style={{ color: 'var(--subdued)', fontSize: 13 }}>{current.dimensions}</p>
            <button className="btn-primary" style={{ marginTop: '1rem' }}>
              Deploy to Map
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
