import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import '../styles/dashboard.css';

const WALLETS = ['Metamask', 'Kaikas', 'Klip', 'Phantom', 'Petra', 'Martian'];

export function HomePage() {
  const [nickname, setNickname] = useState('User');
  const [sellerName, setSellerName] = useState('User');
  const { clearAuth } = useAuthStore();
  const navigate = useNavigate();

  function handleLogout() {
    clearAuth();
    navigate('/');
  }

  return (
    <div className="dash-root">
      <header className="dash-header">
        <div className="dash-brand">
          <span className="dash-dot" />
          Metaverse
        </div>
        <nav className="dash-nav">
          <button className="dash-nav-btn" onClick={() => navigate('/dashboard')}>Dashboard</button>
          <button className="dash-nav-btn logout" onClick={handleLogout}>Sign out</button>
        </nav>
      </header>

      <main className="dash-main">
        <h2>Profile Settings</h2>

        <div className="create-panel">
          <h3>Identity</h3>
          <label>
            Nickname
            <input value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="Enter Nickname" />
          </label>
          <label>
            Asset Store Seller Name
            <input value={sellerName} onChange={(e) => setSellerName(e.target.value)} placeholder="Enter Seller Name" />
          </label>
        </div>

        <div className="create-panel" style={{ marginTop: '1.5rem' }}>
          <h3>Connect Wallet</h3>
          <div className="space-grid">
            {WALLETS.map((w) => (
              <div className="space-card" key={w}>
                <div className="space-card-info">
                  <h3>{w}</h3>
                </div>
                <div className="space-card-actions">
                  <button className="btn-ghost sm">Connect</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="create-actions" style={{ marginTop: '1.5rem' }}>
          <button className="btn-primary">Save Changes</button>
          <button className="btn-ghost">Discard</button>
        </div>

        <div style={{ marginTop: '4rem' }}>
          <button className="btn-danger">Delete Account</button>
          <p style={{ fontSize: 11, color: 'var(--subdued)', marginTop: '0.5rem' }}>
            Warning: Account deletion is irreversible.
          </p>
        </div>
      </main>
    </div>
  );
}
