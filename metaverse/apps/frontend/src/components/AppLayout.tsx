import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export function AppLayout() {
  const { clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  function handleLogout() {
    clearAuth();
    navigate('/');
  }

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="font-body-md text-on-background selection:bg-primary/30 selection:text-primary-fixed min-h-screen relative overflow-hidden" style={{ backgroundColor: '#0b1326' }}>
      <div className="fixed inset-0 technical-grid pointer-events-none opacity-30 z-0"></div>
      
      {/* Top Navbar */}
      <header className="bg-surface/80 backdrop-blur-md border-b border-outline-variant/30 shadow-[0_4px_30px_rgba(0,0,0,0.1)] fixed top-0 w-full z-50 flex justify-between items-center px-8 md:px-16 h-20 md:h-24">
        <div className="font-headline-lg text-3xl md:text-4xl tracking-tighter text-primary-fixed drop-shadow-[0_0_8px_rgba(192,193,255,0.5)] cursor-pointer" onClick={() => navigate('/dashboard')}>METAVERSE</div>
        <nav className="hidden md:flex items-center gap-10 lg:gap-16 font-technical-data text-sm md:text-base">
          <a className="text-on-surface-variant hover:text-secondary-fixed-dim transition-colors duration-300 cursor-pointer" onClick={() => navigate('/avatars')}>SYSTEM_STATUS</a>
          <a className="text-on-surface-variant hover:text-secondary-fixed-dim transition-colors duration-300 cursor-pointer" onClick={() => navigate('/maps')}>COORDINATES</a>
          <a className="text-on-surface-variant hover:text-secondary-fixed-dim transition-colors duration-300 cursor-pointer" onClick={() => navigate('/lobby')}>TELEMETRY</a>
        </nav>
        <div className="flex items-center gap-6 md:gap-8">
          <button className="scale-110 active:scale-95 transition-transform text-tertiary">
            <span className="material-symbols-outlined text-2xl md:text-3xl">notifications</span>
          </button>
          <button className="scale-110 active:scale-95 transition-transform text-tertiary" onClick={() => navigate('/profile')}>
            <span className="material-symbols-outlined text-2xl md:text-3xl">settings</span>
          </button>
          <button className="scale-110 active:scale-95 transition-transform text-tertiary" onClick={handleLogout}>
            <span className="material-symbols-outlined text-2xl md:text-3xl">power_settings_new</span>
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col py-12 gap-y-8 bg-surface-container-low/60 backdrop-blur-xl border-r border-outline-variant/20 shadow-2xl fixed left-0 h-screen w-80 z-40 top-20 md:top-24">
        <div className="px-10 space-y-2">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-primary/30 bg-primary/10 overflow-hidden mb-6">
            <img className="w-full h-full object-cover" alt="Operator Avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCxnoam9LCr7cNa3IyLnaJsrUCSHO6WvqDn98zK1zOPfk92WSSPMOo7BvKW-ZVe398Mj-ySb0ZE7868F-wI-9hgRK2KjOTZopozp9kDZV7snBmhQeuGlJ98kXrM1596ubQDs7N4g5djdb3h9BOUcGkcR_UY72YdOOs0mJSWk-jD0DPymIUs7jm46NohpD88aI4T1rJLTqBaRDMuw-FlhLfo6yc7rFUBvVD2qnE99xjHE1PEGw2ZtgmvsVyfbdeu2XWvY9rsHBZLV7E" />
          </div>
          <div className="font-technical-data text-base md:text-lg text-primary font-bold">OPERATOR_01</div>
          <div className="font-technical-data text-xs md:text-sm text-on-surface-variant opacity-60">SECTOR_7G_ALPHA</div>
        </div>
        <nav className="mt-8 flex-1">
          <div className="flex flex-col gap-3">
            <a className={`flex items-center gap-4 py-4 pl-10 transition-all cursor-pointer ${isActive('/profile') || isActive('/avatars') ? 'text-primary font-bold border-l-4 border-primary bg-primary-fixed/10 translate-x-2' : 'text-on-surface-variant opacity-70 hover:opacity-100 hover:bg-surface-container-high/50 border-l-4 border-transparent'}`} onClick={() => navigate('/avatars')}>
              <span className="material-symbols-outlined text-2xl">fingerprint</span>
              <span className="font-technical-data text-sm md:text-base">IDENTITY</span>
            </a>
            <a className={`flex items-center gap-4 py-4 pl-10 transition-all cursor-pointer ${isActive('/dashboard') ? 'text-primary font-bold border-l-4 border-primary bg-primary-fixed/10 translate-x-2' : 'text-on-surface-variant opacity-70 hover:opacity-100 hover:bg-surface-container-high/50 border-l-4 border-transparent'}`} onClick={() => navigate('/dashboard')}>
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>inventory_2</span>
              <span className="font-technical-data text-sm md:text-base">INVENTORY</span>
            </a>
            <a className={`flex items-center gap-4 py-4 pl-10 transition-all cursor-pointer ${isActive('/lobby') ? 'text-primary font-bold border-l-4 border-primary bg-primary-fixed/10 translate-x-2' : 'text-on-surface-variant opacity-70 hover:opacity-100 hover:bg-surface-container-high/50 border-l-4 border-transparent'}`} onClick={() => navigate('/lobby')}>
              <span className="material-symbols-outlined text-2xl">psychology</span>
              <span className="font-technical-data text-sm md:text-base">NEURAL_LINK</span>
            </a>
            <a className={`flex items-center gap-4 py-4 pl-10 transition-all cursor-pointer ${isActive('/maps') ? 'text-primary font-bold border-l-4 border-primary bg-primary-fixed/10 translate-x-2' : 'text-on-surface-variant opacity-70 hover:opacity-100 hover:bg-surface-container-high/50 border-l-4 border-transparent'}`} onClick={() => navigate('/maps')}>
              <span className="material-symbols-outlined text-2xl">grid_view</span>
              <span className="font-technical-data text-sm md:text-base">MAP_GRID</span>
            </a>
            <a className={`flex items-center gap-4 py-4 pl-10 transition-all cursor-pointer ${isActive('/admin') ? 'text-primary font-bold border-l-4 border-primary bg-primary-fixed/10 translate-x-2' : 'text-on-surface-variant opacity-70 hover:opacity-100 hover:bg-surface-container-high/50 border-l-4 border-transparent'}`} onClick={() => navigate('/admin')}>
              <span className="material-symbols-outlined text-2xl">terminal</span>
              <span className="font-technical-data text-sm md:text-base">LOGS</span>
            </a>
          </div>
        </nav>
        <div className="px-10 pt-10">
          <div className="flex flex-col gap-6">
            <a className="flex items-center gap-3 font-label-sm text-sm text-on-surface-variant/70 hover:text-tertiary transition-all cursor-pointer">
              <span className="material-symbols-outlined text-[20px]">help</span> HELP
            </a>
            <a className="flex items-center gap-3 font-label-sm text-sm text-on-surface-variant/70 hover:text-tertiary transition-all cursor-pointer">
              <span className="material-symbols-outlined text-[20px]">forum</span> FEEDBACK
            </a>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      {/* We use pb-32 to account for the footer height and give breathing room */}
      {/* lg:pl-80 pushes the content to the right of the w-80 sidebar without causing overflow */}
      <main className="w-full lg:pl-80 pt-32 md:pt-40 pb-32 min-h-screen relative z-10">
        <Outlet />
      </main>

      {/* Footer */}
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
