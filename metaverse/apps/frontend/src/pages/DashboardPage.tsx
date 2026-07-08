import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllSpaces, createSpace, deleteSpace, getMaps } from '../api';
import { useAuthStore } from '../store/authStore';
import type { Space, GameMap } from '../types';
import '../styles/dashboard.css';

/* ── Random seed tiles/sprites for each card preview ── */
const CARD_CONFIGS = [
  { sprites: [{ x: 25, y: 60 }, { x: 65, y: 45 }], glowTile: { x: 45, y: 35 } },
  { sprites: [{ x: 30, y: 55 }, { x: 70, y: 65 }], glowTile: { x: 55, y: 28 } },
  { sprites: [{ x: 20, y: 50 }, { x: 60, y: 60 }], glowTile: { x: 38, y: 42 } },
  { sprites: [{ x: 40, y: 58 }, { x: 75, y: 42 }], glowTile: { x: 62, y: 30 } },
];

function PixelSpriteSmall({ color = '#d9381e' }: { color?: string }) {
  return (
    <svg width="12" height="15" viewBox="0 0 16 20" fill="none">
      <rect x="4" y="8" width="8" height="8" fill={color} />
      <rect x="5" y="2" width="6" height="6" fill="#e8dddb" />
      <rect x="4" y="16" width="3" height="4" fill="#4a3330" />
      <rect x="9" y="16" width="3" height="4" fill="#4a3330" />
      <rect x="6" y="4" width="1" height="1" fill="#0c0808" />
      <rect x="9" y="4" width="1" height="1" fill="#0c0808" />
    </svg>
  );
}

const SPRITE_COLORS = ['#d9381e', '#c084fc', '#10b981', '#f59e0b', '#60a5fa'];
const DIM_PRESETS = ['50x50', '100x100', '200x200', '500x500'];

export function DashboardPage() {
  const [spaces,  setSpaces]  = useState<Space[]>([]);
  const [maps,    setMaps]    = useState<GameMap[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Create form state
  const [newName,       setNewName]       = useState('');
  const [newDimensions, setNewDimensions] = useState('100x100');
  const [selectedMap,   setSelectedMap]   = useState('');

  // In DashboardPage.tsx
const [showJoinModal, setShowJoinModal] = useState(false);
const [joinSpaceId, setJoinSpaceId] = useState('');

  const { userType, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  async function loadSpaces() {
    try {
      const res = await getAllSpaces();
      if (res.status === 200) setSpaces(res.data.spaces);
    } catch { /* ignore */ }
    setLoading(false);
  }

  async function loadMaps() {
    try {
      const res = await getMaps();
      if (res.status === 200) setMaps(res.data.maps);
    } catch { /* maps may not exist yet */ }
  }

  useEffect(() => {
    loadSpaces();
    loadMaps();
  }, []);

  async function handleCreate() {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await createSpace({
        name: newName,
        dimensions: newDimensions,
        ...(selectedMap ? { mapId: selectedMap } : {}),
      });
      if (res.status === 200) {
        setShowModal(false);
        setNewName('');
        setSelectedMap('');
        setNewDimensions('100x100');
        await loadSpaces();
      }
    } finally {
      setCreating(false);
    }
  }
  function handleJoin(){
    navigate(`/space/${joinSpaceId}`) 
  }
  async function handleDelete(spaceId: string) {
    try {
      await deleteSpace(spaceId);
      setSpaces((prev) => prev.filter((s) => s.id !== spaceId));
    } catch (e) {
      console.error("Failed to delete space", e);
    }
  }

  function handleLogout() {
    clearAuth();
    navigate('/');
  }

  /* Close modal on backdrop click */
  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) setShowModal(false);
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
          {userType === 'admin' && (
            <>
              <button
                className="dash-nav-btn admin"
                onClick={() => navigate('/admin')}
                id="dashboard-admin-btn"
              >
                ⚙ Admin Panel
              </button>
              <div className="dash-nav-divider" />
            </>
          )}
          <button
            className="dash-nav-btn"
            onClick={() => navigate('/profile')}
            id="dashboard-profile-btn"
          >
            Profile
          </button>
          <div className="dash-nav-divider" />
          <button
            className="dash-nav-btn logout"
            onClick={handleLogout}
            id="dashboard-logout-btn"
          >
            Sign out
          </button>
        </nav>
      </header>

      {/* ── Body ──────────────────────────────── */}
      <div className="dash-body">

        {/* Stats bar */}
        <div className="dash-stats">
          <div className="dash-stat">
            <span className={`dash-stat-value${loading ? '' : ' accent'}`}>
              {loading ? '…' : spaces.length}
            </span>
            <span className="dash-stat-label">Spaces</span>
          </div>
          <div className="dash-stat" onClick={() => navigate('/maps')} style={{ cursor: 'pointer' }}>
            <span className="dash-stat-value accent">
              {maps.length}
            </span>
            <span className="dash-stat-label">Maps available</span>
          </div>
          <div className="dash-stat">
            <span className="dash-stat-value" style={{ color: '#10b981' }}>
              ●
            </span>
            <span className="dash-stat-label">Connected</span>
          </div>
          <div className="dash-stat">
            <span className="dash-stat-value" style={{ fontSize: '1rem', color: 'var(--subdued)' }}>
              {userType === 'admin' ? 'BUILDER' : 'PLAYER'}
            </span>
            <span className="dash-stat-label">Role</span>
          </div>
        </div>

        {/* Title row */}
        <div className="dash-title-row">
          <div className="dash-title-row-left">
            <span className="dash-eyebrow">// your lobby</span>
            <h2>Your Spaces</h2>
          </div>
          <button
            id="dashboard-new-space"
            className="dash-new-btn glitch-hover"
            data-text="＋ New Space"
            onClick={() => setShowModal(true)}
          >
            <span>＋</span> New Space
          </button>
          <button
            id="dashboard-join-space"
            className="dash-new-btn glitch-hover"
            data-text="⤢ Join Space"
            onClick={() => setShowJoinModal(true)}
          >
            <span>⤢</span> Join Space
          </button>


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
        ) : spaces.length === 0 ? (
          <div className="dash-empty-state">
            <span className="dash-empty-icon">◈</span>
            <h3 style={{ fontFamily: 'var(--font-retro)', fontSize: '1.1rem', letterSpacing: '0.06em' }}>
              No spaces yet
            </h3>
            <p>Create your first space to start exploring the metaverse with your team.</p>
            <button className="dash-new-btn" onClick={() => setShowModal(true)}>
              ＋ Create first space
            </button>
          </div>
        ) : (
          <div className="space-grid">
            {spaces.map((space, idx) => {
              const cfg = CARD_CONFIGS[idx % CARD_CONFIGS.length]!;
              const col1 = SPRITE_COLORS[idx % SPRITE_COLORS.length]!;
              const col2 = SPRITE_COLORS[(idx + 2) % SPRITE_COLORS.length]!;
              return (
                <div className="space-card" key={space.id}>
                  {/* Pixel art preview */}
                  <div className="space-card-preview">
                    <div className="preview-tile solid" style={{ left: '20%', top: '40%' }} />
                    <div className="preview-tile solid" style={{ left: '75%', top: '60%' }} />
                    <div className="preview-tile solid" style={{ left: '88%', top: '30%' }} />
                    <div
                      className="preview-tile glow"
                      style={{ left: `${cfg.glowTile.x}%`, top: `${cfg.glowTile.y}%` }}
                    />
                    {cfg.sprites.map((s, si) => (
                      <div
                        key={si}
                        className="preview-sprite"
                        style={{ left: `${s.x}%`, top: `${s.y}%` }}
                      >
                        <PixelSpriteSmall color={si === 0 ? col1 : col2} />
                      </div>
                    ))}
                  </div>

                  {/* Card body */}
                  <div className="space-card-body">
                    <div className="space-card-meta">
                      <span className="space-card-name">{space.name}</span>
                      <span className="space-card-dim">
                        {space.dimensions ?? `${space.width}×${space.height}`}
                      </span>
                    </div>
                    <span className="space-card-id">
                      id: {space.id.slice(0, 8)}…
                    </span>
                    <div className="space-card-actions">
                      <button
                        id={`space-enter-${space.id}`}
                        className="space-enter-btn"
                        onClick={() => navigate(`/space/${space.id}`)}
                      >
                        Enter →
                      </button>
                      <button
                        id={`space-delete-${space.id}`}
                        className="space-delete-btn"
                        onClick={() => handleDelete(space.id)}
                        title="Delete space"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════ */}
      {/* NEW SPACE MODAL                          */}
      {/* ════════════════════════════════════════ */}
      {showModal && (
        <div className="modal-backdrop" onClick={handleBackdropClick}>
          <div className="modal-card" role="dialog" aria-modal="true" aria-label="Create space">
            <div className="modal-header">
              <h3>⬡ New Space</h3>
              <button
                className="modal-close"
                onClick={() => setShowModal(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              {/* Name */}
              <div className="modal-field">
                <label htmlFor="modal-space-name">Space name</label>
                <div className="modal-input-wrap">
                  <span className="modal-input-icon">◉</span>
                  <input
                    id="modal-space-name"
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="My office, Team plaza…"
                    autoFocus
                    onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); }}
                  />
                </div>
              </div>

              {/* Dimensions */}
              {!selectedMap && (
                <div className="modal-field">
                  <label>Dimensions</label>
                  <div className="dim-presets">
                    {DIM_PRESETS.map((d) => (
                      <button
                        key={d}
                        type="button"
                        className={`dim-preset-btn${newDimensions === d ? ' active' : ''}`}
                        onClick={() => setNewDimensions(d)}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                  <div className="modal-input-wrap" style={{ marginTop: '0.4rem' }}>
                    <span className="modal-input-icon">⬡</span>
                    <input
                      id="modal-space-dim"
                      type="text"
                      value={newDimensions}
                      onChange={(e) => setNewDimensions(e.target.value)}
                      placeholder="100x100"
                    />
                  </div>
                </div>
              )}

              {/* Map selector */}
              {maps.length > 0 && (
                <div className="modal-field">
                  <label htmlFor="modal-space-map">Map template (optional)</label>
                  <div className="modal-input-wrap">
                    <span className="modal-input-icon">◈</span>
                    <select
                      id="modal-space-map"
                      value={selectedMap}
                      onChange={(e) => setSelectedMap(e.target.value)}
                    >
                      <option value="">Empty space</option>
                      {maps.map((m) => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="modal-cancel-btn" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button
                id="modal-create-btn"
                className="modal-create-btn glitch-hover"
                data-text="Create Space →"
                onClick={handleCreate}
                disabled={creating || !newName.trim()}
              >
                {creating ? 'Creating…' : 'Create Space →'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Join with code Modal */}
      {showJoinModal && (
        <div className="modal-backdrop" onClick={handleBackdropClick}>
          <div className="modal-card" role="dialog" aria-modal="true" aria-label="Join space">
            <div className="modal-header">
              <h3>⬡ Join Space</h3>
              <button
                className="modal-close"
                onClick={() => setShowJoinModal(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              {/* Code */}
              <div className="modal-field">
                <label htmlFor="modal-space-code">Space code</label>
                <div className="modal-input-wrap">
                  <span className="modal-input-icon">⬡</span>
                  <input
                    id="modal-space-code"
                    type="text"
                    value={joinSpaceId}
                    onChange={(e) => setJoinSpaceId(e.target.value)}
                    placeholder="Enter space code"
                    autoFocus
                    onKeyDown={(e) => { if (e.key === 'Enter') handleJoin(); }}
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="modal-cancel-btn" onClick={() => setShowJoinModal(false)}>
                Cancel
              </button>
              <button
                id="modal-join-btn"
                className="modal-join-btn glitch-hover"
                data-text="Join Space →"
                onClick={handleJoin}
                disabled={!joinSpaceId.trim()}
              >
                {joinSpaceId.trim() ? 'Joining…' : 'Join Space →'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
