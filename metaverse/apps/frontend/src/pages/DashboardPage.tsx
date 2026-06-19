import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllSpaces, createSpace, deleteSpace, getMaps } from '../api';
import { useAuthStore } from '../store/authStore';
import type { Space, GameMap } from '../types';
import '../styles/dashboard.css';

export function DashboardPage() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [maps, setMaps] = useState<GameMap[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  // Create form state
  const [newName, setNewName] = useState('');
  const [newDimensions, setNewDimensions] = useState('100x100');
  const [selectedMap, setSelectedMap] = useState('');

  const { userType, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  async function loadSpaces() {
    const res = await getAllSpaces();
    if (res.status === 200) setSpaces(res.data.spaces);
    setLoading(false);
  }

  async function loadMaps() {
    try {
      const res = await getMaps();
      if (res.status === 200) setMaps(res.data.maps);
    } catch {
      // maps endpoint may not exist yet
    }
  }

  useEffect(() => {
    loadSpaces();
    loadMaps();
  }, []);

  async function handleCreate() {
    if (!newName.trim()) return;
    setCreating(true);
    const res = await createSpace({
      name: newName,
      dimensions: newDimensions,
      ...(selectedMap ? { mapId: selectedMap } : {}),
    });
    if (res.status === 200) {
      setShowCreate(false);
      setNewName('');
      setSelectedMap('');
      await loadSpaces();
    }
    setCreating(false);
  }

  async function handleDelete(spaceId: string) {
    if (!confirm('Delete this space?')) return;
    await deleteSpace(spaceId);
    await loadSpaces();
  }

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
          {userType === 'admin' && (
            <button className="dash-nav-btn" onClick={() => navigate('/admin')}>
              Admin Panel
            </button>
          )}
          <button className="dash-nav-btn logout" onClick={handleLogout}>
            Sign out
          </button>
        </nav>
      </header>

      <main className="dash-main">
        <div className="dash-title-row">
          <h2>Your Spaces</h2>
          <button className="btn-primary" onClick={() => setShowCreate(true)}>
            + New Space
          </button>
        </div>

        {showCreate && (
          <div className="create-panel">
            <h3>Create Space</h3>
            <label>
              Name
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="My office"
                autoFocus
              />
            </label>
            <label>
              Dimensions
              <input
                value={newDimensions}
                onChange={(e) => setNewDimensions(e.target.value)}
                placeholder="100x100"
              />
            </label>
            {maps.length > 0 && (
              <label>
                Map (optional)
                <select
                  value={selectedMap}
                  onChange={(e) => setSelectedMap(e.target.value)}
                >
                  <option value="">Empty space</option>
                  {maps.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </label>
            )}
            <div className="create-actions">
              <button className="btn-primary" onClick={handleCreate} disabled={creating}>
                {creating ? 'Creating…' : 'Create'}
              </button>
              <button className="btn-ghost" onClick={() => setShowCreate(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <p className="dash-empty">Loading spaces…</p>
        ) : spaces.length === 0 ? (
          <p className="dash-empty">No spaces yet. Create one above.</p>
        ) : (
          <div className="space-grid">
            {spaces.map((space) => (
              <div className="space-card" key={space.id}>
                <div className="space-card-info">
                  <h3>{space.name}</h3>
                  <span className="space-dim">{space.dimensions}</span>
                </div>
                <div className="space-card-actions">
                  <button
                    className="btn-primary sm"
                    onClick={() => navigate(`/space/${space.id}`)}
                  >
                    Enter
                  </button>
                  <button
                    className="btn-danger sm"
                    onClick={() => handleDelete(space.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
