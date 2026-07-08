import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  adminCreateElement,
  adminCreateMap,
  adminCreateAvatar,
  getElements,
  adminDeleteElement,
} from '../api';
import type { Element } from '../types';
import { useAuthStore } from '../store/authStore';
import '../styles/admin.css';

type Tab = 'element' | 'map' | 'avatar';

interface Toast {
  message: string;
  type: 'success' | 'error';
}

const TABS: { value: Tab; label: string; icon: string; desc: string }[] = [
  { value: 'element', label: 'Elements',  icon: '◈', desc: 'Static & dynamic world objects' },
  { value: 'map',     label: 'Maps',      icon: '⬡', desc: 'Map templates for spaces' },
  { value: 'avatar',  label: 'Avatars',   icon: '◉', desc: 'Player sprites & skins' },
];

/* ════════════════════════════════════════════════════════════════════════ */
export function AdminPage() {
  const [tab, setTab]       = useState<Tab>('element');
  const [toast, setToast]   = useState<Toast | null>(null);
  const { userType }        = useAuthStore();
  const navigate            = useNavigate();

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type });
  }

  /* Access guard */
  if (userType !== 'admin') {
    return (
      <div className="admin-denied">
        <span className="admin-denied-icon">⚠</span>
        <h2>Access Denied</h2>
        <p>You need an admin account to access this panel.</p>
        <button className="admin-submit-btn" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
      </div>
    );
  }

  const activeTab = TABS.find((t) => t.value === tab)!;

  return (
    <div className="admin-root">

      {/* ── Top Nav ────────────────────────────────────── */}
      <header className="admin-topnav">
        <div className="admin-topnav-left">
          <div className="admin-brand" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
            <span className="admin-brand-dot" />
            METAVERSE
          </div>
          <span className="admin-badge">ADMIN</span>
        </div>
        <div className="admin-topnav-right">
          <button
            className="admin-back-btn"
            id="admin-back-dashboard"
            onClick={() => navigate('/dashboard')}
          >
            ← Dashboard
          </button>
        </div>
      </header>

      <div className="admin-body">

        {/* ── Sidebar ────────────────────────────────────── */}
        <aside className="admin-sidebar">
          <span className="admin-sidebar-label">Content</span>
          {TABS.map((t) => (
            <button
              key={t.value}
              id={`admin-tab-${t.value}`}
              className={`admin-tab-btn${tab === t.value ? ' active' : ''}`}
              onClick={() => { setTab(t.value); setToast(null); }}
            >
              <span className="admin-tab-icon">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </aside>

        {/* ── Main Content ────────────────────────────────── */}
        <main className="admin-content">

          {/* Section header */}
          <div className="admin-section-header">
            <span className="admin-section-eyebrow">// admin panel</span>
            <h2>{activeTab.icon} {activeTab.label}</h2>
            <p>{activeTab.desc}</p>
          </div>

          {/* Toast notification */}
          {toast && (
            <div className={`admin-toast ${toast.type}`}>
              <span className="admin-toast-icon">
                {toast.type === 'success' ? '✓' : '⚠'}
              </span>
              <span className="admin-toast-text">{toast.message}</span>
              <button
                className="admin-toast-dismiss"
                onClick={() => setToast(null)}
                aria-label="Dismiss"
              >
                ✕
              </button>
            </div>
          )}

          {/* Tab panels */}
          {tab === 'element' && <ElementForm onDone={showToast} />}
          {tab === 'map'     && <MapForm     onDone={showToast} />}
          {tab === 'avatar'  && <AvatarForm  onDone={showToast} />}
        </main>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════ */
/*   Element Form                                                            */
/* ════════════════════════════════════════════════════════════════════════ */
function ElementForm({
  onDone,
}: {
  onDone: (msg: string, type: 'success' | 'error') => void;
}) {
  const [imageUrl,  setImageUrl]  = useState('');
  const [width,     setWidth]     = useState(1);
  const [height,    setHeight]    = useState(1);
  const [isStatic,  setIsStatic]  = useState(true);
  const [loading,   setLoading]   = useState(false);
  const [elements,  setElements]  = useState<Element[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function fetchElements() {
    getElements().then(res => {
      if (res.status === 200) setElements(res.data.elements);
    });
  }

  useEffect(() => {
    fetchElements();
  }, []);

  async function handleSubmit() {
    if (!imageUrl.trim()) {
      onDone('Image URL is required.', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await adminCreateElement({ imageUrl, width, height, static: isStatic });
      if (res.status === 200) {
        onDone(`Element created — id: ${res.data.id}`, 'success');
        setImageUrl('');
        setWidth(1);
        setHeight(1);
        fetchElements(); // Refresh library
      } else {
        onDone('Failed to create element.', 'error');
      }
    } catch {
      onDone('Network error.', 'error');
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await adminDeleteElement(id);
      if (res.status === 200) {
        onDone('Element deleted', 'success');
        fetchElements();
      } else {
        onDone('Failed to delete element', 'error');
      }
    } catch {
      onDone('Network error.', 'error');
    }
    setDeletingId(null);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="admin-form-card">
      {/* Image URL + preview */}
      <div className="admin-field">
        <label htmlFor="el-image-url">Image URL</label>
        <div className="admin-input-wrap">
          <span className="admin-input-icon">◈</span>
          <input
            id="el-image-url"
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/sprite.png"
          />
        </div>

        {/* Preview */}
        <div style={{ marginTop: '0.5rem', background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', minHeight: '100px', justifyContent: 'center' }}>
          {imageUrl.trim() ? (
            <img src={imageUrl} alt="Preview" style={{ width: '100%', maxHeight: '250px', objectFit: 'contain', imageRendering: 'pixelated' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          ) : (
            <div style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>◈ Paste a URL above to preview</div>
          )}
        </div>
      </div>

      {/* Width + Height */}
      <div className="admin-form-row">
        <div className="admin-field">
          <label htmlFor="el-width">Width (tiles)</label>
          <div className="admin-input-wrap">
            <span className="admin-input-icon">↔</span>
            <input
              id="el-width"
              type="number"
              min={1}
              max={50}
              value={width}
              onChange={(e) => setWidth(+e.target.value)}
            />
          </div>
        </div>
        <div className="admin-field">
          <label htmlFor="el-height">Height (tiles)</label>
          <div className="admin-input-wrap">
            <span className="admin-input-icon">↕</span>
            <input
              id="el-height"
              type="number"
              min={1}
              max={50}
              value={height}
              onChange={(e) => setHeight(+e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Static toggle */}
      <div className="admin-field">
        <label>Behaviour</label>
        <div
          className={`admin-checkbox-wrap${isStatic ? ' checked' : ''}`}
          onClick={() => setIsStatic((v) => !v)}
          role="checkbox"
          aria-checked={isStatic}
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') setIsStatic((v) => !v); }}
        >
          <div className="admin-checkbox-box">{isStatic ? '✓' : ''}</div>
          <span className="admin-checkbox-label">
            Static — blocks player movement (walls, furniture, etc.)
          </span>
        </div>
      </div>

      <div className="admin-form-footer">
        <button
          id="admin-create-element"
          className="admin-submit-btn"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading
            ? <><span className="admin-btn-spinner" /> Creating…</>
            : '◈ Create Element'}
        </button>
        <span className="admin-form-hint">Saved to element library</span>
      </div>
    </div>

    {/* ── Element Library ─────────────────────────────── */}
    <div className="admin-form-card">
      <h3 style={{ margin: '0 0 1rem', fontSize: '1.2rem' }}>Element Library</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem' }}>
        {elements.length === 0 && <span style={{ color: 'var(--muted)', gridColumn: '1 / -1' }}>No elements found.</span>}
        {elements.map(el => (
          <div key={el.id} style={{ display: 'flex', flexDirection: 'column', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ width: '100%', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)', borderRadius: '4px', marginBottom: '0.75rem' }}>
              <img
                src={el.imageUrl}
                alt="element"
                style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain', imageRendering: 'pixelated' }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
            
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--fg)', marginBottom: '4px' }}>
                {el.width}×{el.height} tiles
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                <span style={{ color: el.static ? 'var(--accent)' : '#10b981' }}>
                  {el.static ? 'Static' : 'Dynamic'}
                </span>
              </div>
              <div style={{ fontSize: '10px', color: 'var(--subdued)', fontFamily: 'var(--font-mono)', marginTop: '4px', marginBottom: '0.75rem' }}>id: {el.id.slice(0, 8)}…</div>
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => { setImageUrl(el.imageUrl); setWidth(el.width); setHeight(el.height); setIsStatic(el.static); }}
                style={{ flex: 1, background: 'none', border: '1px solid var(--border)', color: 'var(--subdued)', padding: '6px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '11px', transition: 'all 0.2s' }}
                onMouseOver={(e) => { (e.target as HTMLElement).style.borderColor = 'var(--accent)'; (e.target as HTMLElement).style.color = 'var(--text)'; }}
                onMouseOut={(e) => { (e.target as HTMLElement).style.borderColor = 'var(--border)'; (e.target as HTMLElement).style.color = 'var(--subdued)'; }}
                title="Load into form to edit"
              >
                Load
              </button>
              <button 
                onClick={() => handleDelete(el.id)}
                disabled={deletingId === el.id}
                style={{
                  flex: 1, background: 'none', border: '1px solid var(--border)', color: 'var(--text)', padding: '6px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '11px', transition: 'all 0.2s'
                }}
                onMouseOver={(e) => (e.target as HTMLElement).style.borderColor = 'rgba(217, 56, 30, 0.8)'}
                onMouseOut={(e) => (e.target as HTMLElement).style.borderColor = 'var(--border)'}
              >
                {deletingId === el.id ? '...' : 'Delete'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════ */
/*   Map Form                                                                */
/* ════════════════════════════════════════════════════════════════════════ */
import { getMaps, adminDeleteMap } from '../api';
import type { GameMap } from '../types';

function MapForm({
  onDone,
}: {
  onDone: (msg: string, type: 'success' | 'error') => void;
}) {
  const [name,       setName]       = useState('');
  const [thumbnail,  setThumbnail]  = useState('');
  const [dimensions, setDimensions] = useState('100x200');
  const [loading,    setLoading]    = useState(false);
  const [maps,       setMaps]       = useState<GameMap[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const DIM_OPTS = ['50x50', '100x100', '100x200', '200x200', '500x500'];

  function fetchMaps() {
    getMaps().then(res => {
      if (res.status === 200) setMaps(res.data.maps);
    });
  }

  useEffect(() => {
    fetchMaps();
  }, []);

  async function handleSubmit() {
    if (!name.trim() || !thumbnail.trim()) {
      onDone('Name and thumbnail URL are required.', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await adminCreateMap({ name, thumbnail, dimensions, defaultElements: [] });
      if (res.status === 200) {
        onDone(`Map created — id: ${res.data.id}`, 'success');
        setName('');
        setThumbnail('');
        setDimensions('100x200');
        fetchMaps(); // Refresh library
      } else {
        onDone('Failed to create map.', 'error');
      }
    } catch {
      onDone('Network error.', 'error');
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await adminDeleteMap(id);
      if (res.status === 200) {
        onDone('Map deleted', 'success');
        fetchMaps();
      } else {
        onDone('Failed to delete map', 'error');
      }
    } catch {
      onDone('Network error.', 'error');
    }
    setDeletingId(null);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="admin-form-card">
        <div className="admin-field">
          <label htmlFor="map-name">Map name</label>
          <div className="admin-input-wrap">
            <span className="admin-input-icon">⬡</span>
            <input
              id="map-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Office Plaza, Rooftop Hub…"
              autoFocus
            />
          </div>
        </div>

        <div className="admin-field">
          <label htmlFor="map-thumbnail">Thumbnail URL</label>
          <div className="admin-input-wrap">
            <span className="admin-input-icon">◈</span>
            <input
              id="map-thumbnail"
              type="url"
              value={thumbnail}
              onChange={(e) => setThumbnail(e.target.value)}
              placeholder="https://example.com/thumbnail.png"
            />
          </div>
          <div className="admin-url-preview">
            {thumbnail.trim() ? (
              <img src={thumbnail} alt="Thumbnail preview" />
            ) : (
              <div className="admin-url-preview-placeholder">⬡</div>
            )}
            <span className="admin-url-preview-text">
              {thumbnail.trim() ? thumbnail : 'Paste a URL to preview'}
            </span>
          </div>
        </div>

        <div className="admin-field">
          <label>Dimensions</label>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
            {DIM_OPTS.map((d) => (
              <button
                key={d}
                type="button"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  padding: '3px 10px',
                  border: `1px solid ${dimensions === d ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-sm)',
                  background: dimensions === d ? 'rgba(var(--accent-raw),0.1)' : 'rgba(0,0,0,0.2)',
                  color: dimensions === d ? 'var(--accent-hi)' : 'var(--subdued)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onClick={() => setDimensions(d)}
              >
                {d}
              </button>
            ))}
          </div>
          <div className="admin-input-wrap">
            <span className="admin-input-icon">↔</span>
            <input
              id="map-dimensions"
              type="text"
              value={dimensions}
              onChange={(e) => setDimensions(e.target.value)}
              placeholder="100x200"
            />
          </div>
        </div>

        <div className="admin-form-footer">
          <button
            id="admin-create-map"
            className="admin-submit-btn"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading
              ? <><span className="admin-btn-spinner" /> Creating…</>
              : '⬡ Create Map'}
          </button>
          <span className="admin-form-hint">Available as a space template</span>
        </div>
      </div>

      <div className="admin-form-card">
        <h3 style={{ margin: '0 0 1rem', fontSize: '1.2rem' }}>Map Library</h3>
        <div style={{ display: 'grid', gap: '0.5rem' }}>
          {maps.length === 0 && <span style={{ color: 'var(--muted)' }}>No maps found.</span>}
          {maps.map(m => (
            <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <img src={m.thumbnail} alt={m.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                <div>
                  <div style={{ fontWeight: 'bold' }}>{m.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--subdued)', fontFamily: 'var(--font-mono)' }}>{m.width}x{m.height} • {m.id.slice(0, 8)}...</div>
                </div>
              </div>
              <button 
                onClick={() => handleDelete(m.id)}
                disabled={deletingId === m.id}
                style={{
                  background: 'none', border: '1px solid var(--border)', color: 'var(--text)', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '12px'
                }}
                onMouseOver={(e) => (e.target as HTMLElement).style.borderColor = 'rgba(217, 56, 30, 0.8)'}
                onMouseOut={(e) => (e.target as HTMLElement).style.borderColor = 'var(--border)'}
              >
                {deletingId === m.id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════ */
/*   Avatar Form                                                             */
/* ════════════════════════════════════════════════════════════════════════ */
import { getAvailableAvatars, adminDeleteAvatar } from '../api';
import type { Avatar } from '../types';

function AvatarForm({
  onDone,
}: {
  onDone: (msg: string, type: 'success' | 'error') => void;
}) {
  const [name,     setName]     = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [avatars,  setAvatars]  = useState<Avatar[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function fetchAvatars() {
    getAvailableAvatars().then(res => {
      if (res.status === 200) setAvatars(res.data.avatars);
    });
  }

  useEffect(() => {
    fetchAvatars();
  }, []);

  async function handleSubmit() {
    if (!name.trim() || !imageUrl.trim()) {
      onDone('Name and image URL are required.', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await adminCreateAvatar({ name, imageUrl });
      if (res.status === 200) {
        onDone(`Avatar created — id: ${res.data.avatarId}`, 'success');
        setName('');
        setImageUrl('');
        fetchAvatars(); // Refresh library
      } else {
        onDone('Failed to create avatar.', 'error');
      }
    } catch {
      onDone('Network error.', 'error');
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await adminDeleteAvatar(id);
      if (res.status === 200) {
        onDone('Avatar deleted', 'success');
        fetchAvatars();
      } else {
        onDone('Failed to delete avatar', 'error');
      }
    } catch {
      onDone('Network error.', 'error');
    }
    setDeletingId(null);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="admin-form-card">
        <div className="admin-field">
          <label htmlFor="av-name">Avatar name</label>
          <div className="admin-input-wrap">
            <span className="admin-input-icon">◉</span>
            <input
              id="av-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Pixel Mage, Shadow Fox…"
              autoFocus
            />
          </div>
        </div>

        <div className="admin-field">
          <label htmlFor="av-image">Sprite URL</label>
          <div className="admin-input-wrap">
            <span className="admin-input-icon">◈</span>
            <input
              id="av-image"
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/avatar.png"
            />
          </div>
          <div className="admin-url-preview">
            {imageUrl.trim() ? (
              <img
                src={imageUrl}
                alt="Avatar preview"
                style={{ imageRendering: 'pixelated' }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            ) : (
              <div className="admin-url-preview-placeholder">◉</div>
            )}
            <span className="admin-url-preview-text">
              {imageUrl.trim() ? imageUrl : 'Paste a sprite URL to preview'}
            </span>
          </div>
          <span className="admin-field-hint">
            Recommended: pixel art sprites (32×32 or 64×64 PNG with transparency)
          </span>
        </div>

        <div className="admin-form-footer">
          <button
            id="admin-create-avatar"
            className="admin-submit-btn"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading
              ? <><span className="admin-btn-spinner" /> Creating…</>
              : '◉ Create Avatar'}
          </button>
          <span className="admin-form-hint">Visible in avatar picker</span>
        </div>
      </div>

      <div className="admin-form-card">
        <h3 style={{ margin: '0 0 1rem', fontSize: '1.2rem' }}>Avatar Library</h3>
        <div style={{ display: 'grid', gap: '0.5rem' }}>
          {avatars.length === 0 && <span style={{ color: 'var(--muted)' }}>No avatars found.</span>}
          {avatars.map(av => (
            <div key={av.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={av.imageUrl} alt={av.name} style={{ width: '32px', height: '32px', imageRendering: 'pixelated' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                </div>
                <div>
                  <div style={{ fontWeight: 'bold' }}>{av.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--subdued)', fontFamily: 'var(--font-mono)' }}>id: {av.id.slice(0, 8)}...</div>
                </div>
              </div>
              <button 
                onClick={() => handleDelete(av.id)}
                disabled={deletingId === av.id}
                style={{
                  background: 'none', border: '1px solid var(--border)', color: 'var(--text)', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '12px'
                }}
                onMouseOver={(e) => (e.target as HTMLElement).style.borderColor = 'rgba(217, 56, 30, 0.8)'}
                onMouseOut={(e) => (e.target as HTMLElement).style.borderColor = 'var(--border)'}
              >
                {deletingId === av.id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
