import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  adminCreateElement,
  adminCreateMap,
  adminCreateAvatar,
} from '../api';
import { useAuthStore } from '../store/authStore';
import '../styles/admin.css';

type Tab = 'element' | 'map' | 'avatar';

export function AdminPage() {
  const [tab, setTab] = useState<Tab>('element');
  const [feedback, setFeedback] = useState('');
  const { userType } = useAuthStore();
  const navigate = useNavigate();

  if (userType !== 'admin') {
    return (
      <div className="admin-denied">
        <p>Admin access required.</p>
        <button onClick={() => navigate('/dashboard')}>Back</button>
      </div>
    );
  }

  return (
    <div className="admin-root ember-theme">
      <header className="admin-header">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>← Back</button>
        <h2>Admin Panel</h2>
      </header>

      <div className="admin-tabs">
        {(['element', 'map', 'avatar'] as Tab[]).map((t) => (
          <button
            key={t}
            className={`tab-btn ${tab === t ? 'active' : ''}`}
            onClick={() => { setTab(t); setFeedback(''); }}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {feedback && <p className="admin-feedback">{feedback}</p>}

      {tab === 'element' && <ElementForm onDone={setFeedback} />}
      {tab === 'map' && <MapForm onDone={setFeedback} />}
      {tab === 'avatar' && <AvatarForm onDone={setFeedback} />}
    </div>
  );
}

// ─── Element Form ─────────────────────────────────────────────────────────────

function ElementForm({ onDone }: { onDone: (msg: string) => void }) {
  const [imageUrl, setImageUrl] = useState('');
  const [width, setWidth] = useState(1);
  const [height, setHeight] = useState(1);
  const [isStatic, setIsStatic] = useState(true);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!imageUrl.trim()) { onDone('Image URL is required.'); return; }
    setLoading(true);
    const res = await adminCreateElement({ imageUrl, width, height, static: isStatic });
    onDone(res.status === 200 ? `Element created — id: ${res.data.id}` : 'Failed to create element.');
    setLoading(false);
  }

  return (
    <div className="admin-form">
      <h3>Create Element</h3>
      <label>Image URL<input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://…" /></label>
      <div className="form-row">
        <label>Width<input type="number" min={1} value={width} onChange={(e) => setWidth(+e.target.value)} /></label>
        <label>Height<input type="number" min={1} value={height} onChange={(e) => setHeight(+e.target.value)} /></label>
      </div>
      <label className="checkbox-label">
        <input type="checkbox" checked={isStatic} onChange={(e) => setIsStatic(e.target.checked)} />
        Static (blocks movement)
      </label>
      <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
        {loading ? 'Creating…' : 'Create Element'}
      </button>
    </div>
  );
}

// ─── Map Form ─────────────────────────────────────────────────────────────────

function MapForm({ onDone }: { onDone: (msg: string) => void }) {
  const [name, setName] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [dimensions, setDimensions] = useState('100x200');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!name.trim() || !thumbnail.trim()) { onDone('Name and thumbnail are required.'); return; }
    setLoading(true);
    const res = await adminCreateMap({ name, thumbnail, dimensions, defaultElements: [] });
    onDone(res.status === 200 ? `Map created — id: ${res.data.id}` : 'Failed to create map.');
    setLoading(false);
  }

  return (
    <div className="admin-form">
      <h3>Create Map</h3>
      <label>Name<input value={name} onChange={(e) => setName(e.target.value)} placeholder="My Map" /></label>
      <label>Thumbnail URL<input value={thumbnail} onChange={(e) => setThumbnail(e.target.value)} placeholder="https://…" /></label>
      <label>Dimensions<input value={dimensions} onChange={(e) => setDimensions(e.target.value)} placeholder="100x200" /></label>
      <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
        {loading ? 'Creating…' : 'Create Map'}
      </button>
    </div>
  );
}

// ─── Avatar Form ──────────────────────────────────────────────────────────────

function AvatarForm({ onDone }: { onDone: (msg: string) => void }) {
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!name.trim() || !imageUrl.trim()) { onDone('Name and image URL are required.'); return; }
    setLoading(true);
    const res = await adminCreateAvatar({ name, imageUrl });
    onDone(res.status === 200 ? `Avatar created — id: ${res.data.avatarId}` : 'Failed to create avatar.');
    setLoading(false);
  }

  return (
    <div className="admin-form">
      <h3>Create Avatar</h3>
      <label>Name<input value={name} onChange={(e) => setName(e.target.value)} placeholder="Timmy" /></label>
      <label>Image URL<input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://…" /></label>
      <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
        {loading ? 'Creating…' : 'Create Avatar'}
      </button>
    </div>
  );
}
