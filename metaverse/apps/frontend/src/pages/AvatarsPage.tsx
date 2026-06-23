import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/dashboard.css';

interface Avatar {
  id: string;
  name: string;
  imageUrl: string;
}

export function AvatarsPage() {
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [selected, setSelected] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Placeholder — swap with real API call
    setAvatars([
      { id: '1', name: 'Unit 734', imageUrl: '' },
      { id: '2', name: 'Protos-5', imageUrl: '' },
      { id: '3', name: 'Beam-Bot', imageUrl: '' },
      { id: '4', name: 'Navigator', imageUrl: '' },
    ]);
    setSelected('1');
    setLoading(false);
  }, []);

  const current = avatars.find((a) => a.id === selected);

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
        <h2>Character Customization</h2>
        <p style={{ color: 'var(--subdued)', marginBottom: '1.5rem' }}>Select your avatar.</p>

        {loading ? (
          <p className="dash-empty">Loading avatars…</p>
        ) : (
          <div className="space-grid">
            {avatars.map((avatar) => (
              <div
                className={`space-card ${selected === avatar.id ? 'selected' : ''}`}
                key={avatar.id}
                onClick={() => setSelected(avatar.id)}
                style={{ cursor: 'pointer' }}
              >
                <div className="space-card-info">
                  <h3>{avatar.name}</h3>
                  <span className="space-dim">{avatar.id}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {current && (
          <div className="create-panel" style={{ marginTop: '1.5rem' }}>
            <h3>Selected: {current.name}</h3>
            <button className="btn-primary" style={{ marginTop: '1rem' }}>
              Confirm Selection
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
