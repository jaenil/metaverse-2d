import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import '../styles/dashboard.css';

const WALLETS = ['Metamask', 'Phantom', 'WalletConnect'];

export function HomePage() {
  const [nickname, setNickname] = useState('User');
  const [sellerName, setSellerName] = useState('User');
  const { clearAuth } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const navigate = useNavigate();

  function handleLogout() {
    clearAuth();
    navigate('/');
  }

  return (
    <div className="dash-root">
      {/* ── Navigation ────────────────────────── */}
      <header className="dash-header">
        <div className="dash-brand">
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

          {/* Web3 / Wallet Panel */}
          <div className="space-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', cursor: 'default', border: '1px solid var(--border)' }}>
            <h3 style={{ fontFamily: 'var(--font-retro)', letterSpacing: '0.05em', color: 'var(--fg)', margin: 0 }}>Web3 Integration</h3>
            <p style={{ color: 'var(--subdued)', fontSize: '0.85rem', marginTop: '-0.5rem' }}>Connect a wallet to buy or sell map elements and skins.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
              {WALLETS.map((w) => (
                <div key={w} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--fg)' }}>{w}</span>
                  <button className="space-enter-btn" style={{ flex: 'none', padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}>Connect</button>
                </div>
              ))}
            </div>
          </div>

          {/* UI Theme Panel */}
          <div className="space-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', cursor: 'default', border: '1px solid var(--border)' }}>
            <h3 style={{ fontFamily: 'var(--font-retro)', letterSpacing: '0.05em', color: 'var(--text)', margin: 0 }}>UI Theme</h3>
            <p style={{ color: 'var(--subdued)', fontSize: '0.85rem', marginTop: '-0.5rem' }}>Customize your dashboard aesthetic.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button 
                onClick={() => setTheme('ember')}
                className={`dash-new-btn ${theme === 'ember' ? 'active' : ''}`}
                style={{ flex: 1, justifyContent: 'center', background: theme === 'ember' ? 'var(--accent)' : 'rgba(0,0,0,0.2)' }}
              >
                Ember & Charcoal
              </button>
              <button 
                onClick={() => setTheme('cyberpunk')}
                className={`dash-new-btn ${theme === 'cyberpunk' ? 'active' : ''}`}
                style={{ flex: 1, justifyContent: 'center', background: theme === 'cyberpunk' ? 'var(--accent)' : 'rgba(0,0,0,0.2)' }}
              >
                Cyberpunk Neon
              </button>
              <button 
                onClick={() => setTheme('gameboy')}
                className={`dash-new-btn ${theme === 'gameboy' ? 'active' : ''}`}
                style={{ flex: 1, justifyContent: 'center', background: theme === 'gameboy' ? 'var(--accent)' : 'rgba(0,0,0,0.2)' }}
              >
                Gameboy Classic
              </button>
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
