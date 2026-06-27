import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllSpaces, createSpace, deleteSpace, getMaps } from '../api';
import { useAuthStore } from '../store/authStore';
import type { Space, GameMap } from '../types';

export function DashboardPage() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [maps, setMaps] = useState<GameMap[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const [newName, setNewName] = useState('');
  const [newDimensions, setNewDimensions] = useState('100x100');
  const [selectedMap, setSelectedMap] = useState('');

  const { clearAuth } = useAuthStore();
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
    } catch {}
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
    <div className="font-body-md text-on-background selection:bg-primary/30 selection:text-primary-fixed min-h-screen relative overflow-hidden" style={{ backgroundColor: '#0b1326' }}>
      <div className="fixed inset-0 technical-grid pointer-events-none opacity-30"></div>
      
      <header className="bg-surface/80 backdrop-blur-md border-b border-outline-variant/30 shadow-[0_4px_30px_rgba(0,0,0,0.1)] fixed top-0 w-full z-50 flex justify-between items-center px-margin-desktop h-16">
        <div className="font-headline-lg text-headline-lg tracking-tighter text-primary-fixed drop-shadow-[0_0_8px_rgba(192,193,255,0.5)] cursor-pointer" onClick={() => navigate('/dashboard')}>METAVERSE</div>
        <nav className="hidden md:flex items-center gap-8 font-technical-data text-technical-data">
          <a className="text-on-surface-variant hover:text-secondary-fixed-dim transition-colors duration-300 cursor-pointer" onClick={() => navigate('/avatars')}>SYSTEM_STATUS</a>
          <a className="text-on-surface-variant hover:text-secondary-fixed-dim transition-colors duration-300 cursor-pointer" onClick={() => navigate('/maps')}>COORDINATES</a>
          <a className="text-on-surface-variant hover:text-secondary-fixed-dim transition-colors duration-300 cursor-pointer" onClick={() => navigate('/lobby')}>TELEMETRY</a>
        </nav>
        <div className="flex items-center gap-4">
          <button className="scale-95 active:scale-90 transition-transform text-tertiary">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="scale-95 active:scale-90 transition-transform text-tertiary" onClick={() => navigate('/home-page')}>
            <span className="material-symbols-outlined">settings</span>
          </button>
          <button className="scale-95 active:scale-90 transition-transform text-tertiary" onClick={handleLogout}>
            <span className="material-symbols-outlined">power_settings_new</span>
          </button>
        </div>
      </header>

      <aside className="hidden lg:flex flex-col py-8 gap-y-6 bg-surface-container-low/60 backdrop-blur-xl border-r border-outline-variant/20 shadow-2xl fixed left-0 h-screen w-64 z-40 top-16">
        <div className="px-6 space-y-1">
          <div className="w-12 h-12 rounded-full border border-primary/30 bg-primary/10 overflow-hidden mb-4">
            <img className="w-full h-full object-cover" alt="Operator Avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCxnoam9LCr7cNa3IyLnaJsrUCSHO6WvqDn98zK1zOPfk92WSSPMOo7BvKW-ZVe398Mj-ySb0ZE7868F-wI-9hgRK2KjOTZopozp9kDZV7snBmhQeuGlJ98kXrM1596ubQDs7N4g5djdb3h9BOUcGkcR_UY72YdOOs0mJSWk-jD0DPymIUs7jm46NohpD88aI4T1rJLTqBaRDMuw-FlhLfo6yc7rFUBvVD2qnE99xjHE1PEGw2ZtgmvsVyfbdeu2XWvY9rsHBZLV7E" />
          </div>
          <div className="font-technical-data text-technical-data text-primary font-bold">OPERATOR_01</div>
          <div className="font-technical-data text-[10px] text-on-surface-variant opacity-60">SECTOR_7G_ALPHA</div>
        </div>
        <nav className="mt-4">
          <div className="flex flex-col gap-2">
            <a className="flex items-center gap-3 text-on-surface-variant opacity-70 hover:opacity-100 pl-4 py-3 hover:bg-surface-container-high/50 transition-all cursor-pointer" onClick={() => navigate('/avatars')}>
              <span className="material-symbols-outlined">fingerprint</span>
              <span className="font-technical-data text-technical-data">IDENTITY</span>
            </a>
            <a className="flex items-center gap-3 text-primary font-bold border-l-4 border-primary pl-4 bg-primary-fixed/10 py-3 translate-x-1 transition-transform duration-200 cursor-pointer" onClick={() => navigate('/dashboard')}>
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>inventory_2</span>
              <span className="font-technical-data text-technical-data">INVENTORY</span>
            </a>
            <a className="flex items-center gap-3 text-on-surface-variant opacity-70 hover:opacity-100 pl-4 py-3 hover:bg-surface-container-high/50 transition-all cursor-pointer">
              <span className="material-symbols-outlined">psychology</span>
              <span className="font-technical-data text-technical-data">NEURAL_LINK</span>
            </a>
            <a className="flex items-center gap-3 text-on-surface-variant opacity-70 hover:opacity-100 pl-4 py-3 hover:bg-surface-container-high/50 transition-all cursor-pointer" onClick={() => navigate('/maps')}>
              <span className="material-symbols-outlined">grid_view</span>
              <span className="font-technical-data text-technical-data">MAP_GRID</span>
            </a>
            <a className="flex items-center gap-3 text-on-surface-variant opacity-70 hover:opacity-100 pl-4 py-3 hover:bg-surface-container-high/50 transition-all cursor-pointer">
              <span className="material-symbols-outlined">terminal</span>
              <span className="font-technical-data text-technical-data">LOGS</span>
            </a>
          </div>
        </nav>
        <div className="mt-auto px-6 border-t border-outline-variant/10 pt-6">
          <div className="flex flex-col gap-4">
            <a className="flex items-center gap-2 font-label-sm text-label-sm text-on-surface-variant/70 hover:text-tertiary transition-all cursor-pointer">
              <span className="material-symbols-outlined text-[18px]">help</span> HELP
            </a>
            <a className="flex items-center gap-2 font-label-sm text-label-sm text-on-surface-variant/70 hover:text-tertiary transition-all cursor-pointer">
              <span className="material-symbols-outlined text-[18px]">forum</span> FEEDBACK
            </a>
          </div>
        </div>
      </aside>

      <main className="lg:ml-64 pt-24 pb-20 min-h-screen px-margin-mobile md:px-margin-desktop relative">
        <div className="max-w-7xl mx-auto">
          <header className="mb-12 flex justify-between items-end">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-technical-data text-label-sm text-primary tracking-[0.2em]">03.</span>
                <span className="font-display-2xl text-[48px] md:text-[36px] leading-tight text-on-background">SPACE_CONSTRUCTOR</span>
              </div>
              <div className="mt-2 flex items-center gap-4">
                <code className="text-on-surface-variant/60 font-technical-data text-[12px]">
                  PROTOCOL: GET /api/v1/spaces // ACTIVE_SANDBOX_INSTANCES
                </code>
              </div>
            </div>
            <div className="text-right">
              <button 
                className="px-6 py-2 bg-primary/20 border border-primary text-primary font-technical-data text-[12px] hover:bg-primary hover:text-on-primary transition-colors flex items-center gap-2"
                onClick={() => setShowCreate(!showCreate)}
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                NEW_PROJECT
              </button>
            </div>
          </header>

          {showCreate && (
            <div className="glass-panel rounded-xl p-8 neon-border-glow bg-surface-container-low/80 mb-12">
              <h3 className="font-technical-data text-primary text-[14px] font-bold mb-6 tracking-widest border-b border-primary/30 pb-2">INITIALIZE_NEW_SPACE</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-2 group">
                  <label className="font-technical-data text-[10px] text-tertiary uppercase tracking-wider block transition-colors group-focus-within:text-primary">PROJECT_NAME</label>
                  <input
                    className="w-full bg-surface-container-lowest/50 border border-outline-variant/30 rounded-none px-4 py-3 font-technical-data text-[12px] focus:border-tertiary focus:ring-0 transition-all text-on-surface placeholder:text-on-surface-variant/30 outline-none"
                    placeholder="ENTER_DESIGNATION"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="space-y-2 group">
                  <label className="font-technical-data text-[10px] text-tertiary uppercase tracking-wider block transition-colors group-focus-within:text-primary">DIMENSIONS</label>
                  <input
                    className="w-full bg-surface-container-lowest/50 border border-outline-variant/30 rounded-none px-4 py-3 font-technical-data text-[12px] focus:border-tertiary focus:ring-0 transition-all text-on-surface placeholder:text-on-surface-variant/30 outline-none"
                    placeholder="100x100"
                    value={newDimensions}
                    onChange={(e) => setNewDimensions(e.target.value)}
                  />
                </div>
              </div>

              {maps.length > 0 && (
                <div className="space-y-2 group mb-8">
                  <label className="font-technical-data text-[10px] text-tertiary uppercase tracking-wider block transition-colors group-focus-within:text-primary">SELECT_MAP (OPTIONAL)</label>
                  <select
                    className="w-full bg-surface-container-lowest/50 border border-outline-variant/30 rounded-none px-4 py-3 font-technical-data text-[12px] focus:border-tertiary focus:ring-0 transition-all text-on-surface outline-none appearance-none"
                    value={selectedMap}
                    onChange={(e) => setSelectedMap(e.target.value)}
                  >
                    <option value="" className="bg-surface text-on-surface">EMPTY_VOID</option>
                    {maps.map((m) => (
                      <option key={m.id} value={m.id} className="bg-surface text-on-surface">{m.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex gap-4">
                <button 
                  className="px-8 py-3 bg-primary text-on-primary font-technical-data font-bold text-[12px] hover:bg-primary-fixed hover:glow-cyan transition-all disabled:opacity-50"
                  onClick={handleCreate}
                  disabled={creating}
                >
                  {creating ? 'COMPILING...' : 'COMPILE_PROJECT'}
                </button>
                <button 
                  className="px-8 py-3 border border-outline-variant text-on-surface-variant font-technical-data text-[12px] hover:bg-surface-container-highest transition-colors"
                  onClick={() => setShowCreate(false)}
                >
                  ABORT
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex items-center gap-4 text-tertiary font-technical-data">
              <span className="material-symbols-outlined animate-spin">refresh</span>
              FETCHING_INSTANCES...
            </div>
          ) : spaces.length === 0 ? (
            <div className="glass-panel p-12 text-center text-on-surface-variant/50 font-technical-data">
              NO_ACTIVE_INSTANCES_FOUND. INITIALIZE_NEW_SPACE.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
              {spaces.map((space) => (
                <div key={space.id} className="glass-panel rounded-xl overflow-hidden group hover:-translate-y-1 transition-transform border border-outline-variant/20 hover:border-primary/50 relative">
                  <div className="h-2 bg-primary/20 w-full overflow-hidden">
                    <div className="h-full bg-primary w-1/3 animate-[pulse_2s_ease-in-out_infinite]"></div>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-headline-lg-mobile text-[18px] text-on-background font-bold uppercase truncate">{space.name}</h3>
                      <button 
                        className="text-error/70 hover:text-error transition-colors"
                        onClick={() => handleDelete(space.id)}
                        title="TERMINATE_INSTANCE"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                    
                    <div className="space-y-2 font-technical-data text-[10px] text-on-surface-variant/70 mb-6">
                      <div className="flex justify-between">
                        <span>DIM:</span>
                        <span className="text-tertiary">{space.dimensions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>ID:</span>
                        <span className="truncate ml-4">{space.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>STATUS:</span>
                        <span className="text-primary animate-pulse">ONLINE</span>
                      </div>
                    </div>

                    <button 
                      className="w-full py-2 bg-surface-container-highest hover:bg-primary hover:text-on-primary transition-colors font-technical-data text-[12px] border border-outline-variant/30 hover:border-primary flex items-center justify-center gap-2"
                      onClick={() => navigate(`/space/${space.id}`)}
                    >
                      <span className="material-symbols-outlined text-[16px]">login</span>
                      ENTER_INSTANCE
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="bg-surface-container-lowest/90 border-t border-outline-variant/10 fixed bottom-0 w-full z-50 flex justify-between items-center px-margin-desktop py-4 h-14">
        <div className="font-label-sm text-label-sm text-tertiary-fixed-dim">© 2124 METAVERSE_PROTOCOLS // ENCRYPTION_ACTIVE</div>
        <div className="flex gap-6">
          <a className="font-label-sm text-label-sm text-on-surface-variant/50 hover:text-tertiary transition-all cursor-pointer">PRIVACY_LAYER</a>
          <a className="font-label-sm text-label-sm text-on-surface-variant/50 hover:text-tertiary transition-all cursor-pointer">LICENSE_AGREEMENT</a>
          <a className="font-label-sm text-label-sm text-primary font-bold hover:text-tertiary transition-all cursor-pointer">DEBUG_MODE</a>
        </div>
      </footer>
    </div>
  );
}
