import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAvailableAvatars, updateMetadata, getCurrentUser } from '../api';
import type { Avatar } from '../types';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import '../styles/dashboard.css';



export function ProfilePage() {
  const [nickname, setNickname] = useState('User');
  const [sellerName, setSellerName] = useState('User');
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAvatarId, setSelectedAvatarId] = useState<string | null>(null);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [email, setEmail] = useState('');

  const { clearAuth } = useAuthStore();
  const { theme, setTheme, customBaseColor, customSurfaceColor, customBorderColor, customAccentColor, setCustomColors } = useThemeStore();
  const navigate = useNavigate();

  useEffect(() => {
    getAvailableAvatars().then(res => {
      if (res.status === 200) setAvatars(res.data.avatars);
      setLoading(false);
    }).catch(() => { setLoading(false); });

    getCurrentUser().then(res => {
      if (res.status === 200 && res.data.user) {
        setNickname(res.data.user.username);
        setGoogleConnected(!!res.data.user.googleId);
        setEmail(res.data.user.email || '');
        setSelectedAvatarId(res.data.user.avatarId);
      }
    }).catch(() => {});
  }, []);

  async function handleSelectAvatar(avatarId: string) {
    try {
      await updateMetadata(avatarId);
      setSelectedAvatarId(avatarId);
    } catch (e) {
      console.error("Failed to update avatar", e);
    }
  }

  function handleLogout() {
    clearAuth();
    navigate('/');
  }

  return (
    <div className="dash-root">
      {/* ── Navigation ────────────────────────── */}
      <header className="dash-header">
        <div className="dash-brand" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
          <span className="dash-dot" />
          METAVERSE
        </div>

        <nav className="dash-nav">
          <button className="dash-nav-btn" onClick={() => navigate('/dashboard')}>
            ← Back to Dashboard
          </button>
          <div className="dash-nav-divider" />
          <button className="dash-nav-btn logout" onClick={handleLogout}>
            Sign out
          </button>
        </nav>
      </header>

      {/* ── Body ──────────────────────────────── */}
      <div className="dash-body">

        <div className="dash-title-row">
          <div className="dash-title-row-left">
            <span className="dash-eyebrow">// identity</span>
            <h2>Profile Settings</h2>
          </div>
        </div>

        <div className="space-grid" style={{ gridTemplateColumns: 'minmax(300px, 1fr) minmax(300px, 1fr)', gap: '2rem' }}>

          {/* Identity Panel */}
          <div className="space-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', cursor: 'default', border: '1px solid var(--border)' }}>
            <h3 style={{ fontFamily: 'var(--font-retro)', letterSpacing: '0.05em', color: 'var(--fg)', margin: 0 }}>Identity</h3>
            <p style={{ color: 'var(--subdued)', fontSize: '0.85rem', marginTop: '-0.5rem' }}>Customize your display name across spaces.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--subdued)', fontWeight: 600 }}>Nickname</label>
              <div className="modal-input-wrap">
                <span className="modal-input-icon">◉</span>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Enter Nickname"
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
              <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--subdued)', fontWeight: 600 }}>Asset Store Seller Name</label>
              <div className="modal-input-wrap">
                <span className="modal-input-icon">◈</span>
                <input
                  type="text"
                  value={sellerName}
                  onChange={(e) => setSellerName(e.target.value)}
                  placeholder="Enter Seller Name"
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              <button className="dash-new-btn" style={{ flex: 1 }}>Save Changes</button>
            </div>
          </div>

          {/* Avatar Panel */}
          <div className="space-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', cursor: 'default', border: '1px solid var(--border)' }}>
            <h3 style={{ fontFamily: 'var(--font-retro)', letterSpacing: '0.05em', color: 'var(--text)', margin: 0 }}>Choose Avatar</h3>
            <p style={{ color: 'var(--subdued)', fontSize: '0.85rem', marginTop: '-0.5rem' }}>Select your appearance in the metaverse.</p>

            <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem', flexWrap: 'wrap' }}>
              {loading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="dash-skeleton" style={{ width: '64px', height: '64px', borderRadius: '8px', flexShrink: 0 }}>
                    <div className="dash-skeleton-inner" />
                  </div>
                ))
              ) : avatars.length > 0 ? (
                avatars.map(av => (
                  <div
                    key={av.id}
                    onClick={() => handleSelectAvatar(av.id)}
                    style={{
                      width: '64px', height: '64px',
                      borderRadius: '8px',
                      background: selectedAvatarId === av.id ? 'rgba(var(--accent-raw), 0.3)' : 'rgba(0,0,0,0.3)',
                      border: selectedAvatarId === av.id ? '2px solid var(--accent)' : '1px solid var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                      transition: 'all 0.2s', flexShrink: 0
                    }}
                    onMouseOver={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
                    onMouseOut={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}
                  >
                    <img src={av.imageUrl} alt={av.name} style={{ width: '40px', height: '40px', imageRendering: 'pixelated' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  </div>
                ))
              ) : (
                <div style={{ color: 'var(--subdued)', fontSize: '0.85rem' }}>No avatars available.</div>
              )}
            </div>
          </div>

          {/* Google Account Panel */}
          <div className="space-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', cursor: 'default', border: '1px solid var(--border)' }}>
            <h3 style={{ fontFamily: 'var(--font-retro)', letterSpacing: '0.05em', color: 'var(--fg)', margin: 0 }}>Connected Accounts</h3>
            <p style={{ color: 'var(--subdued)', fontSize: '0.85rem', marginTop: '-0.5rem' }}>Link your Google account for faster login and account recovery.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    <path d="M1 1h22v22H1z" fill="none"/>
                  </svg>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.9rem', color: 'var(--fg)', fontWeight: 500 }}>Google</span>
                    {email && <span style={{ fontSize: '0.75rem', color: 'var(--subdued)' }}>{email}</span>}
                  </div>
                </div>
                {googleConnected ? (
                  <span style={{ color: 'var(--accent)', fontSize: '0.85rem', fontWeight: 600, padding: '0.5rem 1.25rem' }}>✓ Connected</span>
                ) : (
                  <button className="space-enter-btn" style={{ flex: 'none', padding: '0.5rem 1.25rem', fontSize: '0.9rem', fontWeight: 600 }}>Connect</button>
                )}
              </div>
            </div>
          </div>

          {/* UI Theme Panel */}
          <div className="space-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', cursor: 'default', border: '1px solid var(--border)' }}>
            <h3 style={{ fontFamily: 'var(--font-retro)', letterSpacing: '0.05em', color: 'var(--text)', margin: 0 }}>UI Theme</h3>
            <p style={{ color: 'var(--subdued)', fontSize: '0.85rem', marginTop: '-0.5rem' }}>Customize your dashboard aesthetic.</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.5rem' }}>
              {[
                { id: 'ember', label: 'Ember' },
                { id: 'midnight', label: 'Midnight (Default)' },
                { id: 'obsidian', label: 'Obsidian' },
                { id: 'ocean', label: 'Deep Ocean' },
                { id: 'amethyst', label: 'Amethyst' },
                { id: 'matcha', label: 'Matcha' },
                { id: 'dracula', label: 'Dracula' },
                { id: 'solarized', label: 'Solarized' },
                { id: 'ghost', label: 'Ghost' },
                { id: 'matrix', label: 'Matrix' },
                { id: 'cobalt', label: 'Cobalt' },
                { id: 'custom', label: 'Custom Theme...' }
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`dash-new-btn ${theme === t.id ? 'active' : ''}`}
                  style={{ 
                    justifyContent: 'center', 
                    background: theme === t.id ? 'var(--accent)' : 'rgba(0,0,0,0.2)',
                    color: theme === t.id ? 'var(--btn-text, #ffffff)' : 'var(--text)',
                    gridColumn: t.id === 'custom' ? 'span 2' : 'auto'
                  }}
                >
                  {t.label}
                </button>
              ))}

              {theme === 'custom' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.1)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
                  
                  <h4 style={{ margin: 0, fontSize: '0.85rem', color: 'var(--subdued)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Colors</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text)' }}>Background</label>
                      <input 
                        type="color" 
                        value={customBaseColor} 
                        onChange={(e) => setCustomColors(e.target.value, customSurfaceColor, customBorderColor, customAccentColor)}
                        style={{ width: '100%', height: '32px', cursor: 'pointer', padding: 0, border: 'none', borderRadius: 'var(--radius-sm)' }}
                      />
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text)' }}>Surface</label>
                      <input 
                        type="color" 
                        value={customSurfaceColor} 
                        onChange={(e) => setCustomColors(customBaseColor, e.target.value, customBorderColor, customAccentColor)}
                        style={{ width: '100%', height: '32px', cursor: 'pointer', padding: 0, border: 'none', borderRadius: 'var(--radius-sm)' }}
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text)' }}>Border</label>
                      <input 
                        type="color" 
                        value={customBorderColor} 
                        onChange={(e) => setCustomColors(customBaseColor, customSurfaceColor, e.target.value, customAccentColor)}
                        style={{ width: '100%', height: '32px', cursor: 'pointer', padding: 0, border: 'none', borderRadius: 'var(--radius-sm)' }}
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text)' }}>Accent</label>
                      <input 
                        type="color" 
                        value={customAccentColor} 
                        onChange={(e) => setCustomColors(customBaseColor, customSurfaceColor, customBorderColor, e.target.value)}
                        style={{ width: '100%', height: '32px', cursor: 'pointer', padding: 0, border: 'none', borderRadius: 'var(--radius-sm)' }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Danger Zone */}
        <div style={{ marginTop: '3rem', padding: '1.5rem', border: '1px solid rgba(217, 56, 30, 0.2)', borderRadius: 'var(--radius)', background: 'rgba(217, 56, 30, 0.02)' }}>
          <h3 style={{ color: 'var(--accent)', fontFamily: 'var(--font-retro)', letterSpacing: '0.05em', margin: '0 0 0.5rem 0' }}>Danger Zone</h3>
          <p style={{ color: 'var(--subdued)', fontSize: '0.85rem', marginBottom: '1rem' }}>Warning: Account deletion is irreversible. You will lose access to all your spaces and elements.</p>
          <button className="space-delete-btn" style={{ padding: '0.5rem 1rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1rem' }}>⚠</span> Delete Account
          </button>
        </div>

      </div>
    </div>
  );
}
