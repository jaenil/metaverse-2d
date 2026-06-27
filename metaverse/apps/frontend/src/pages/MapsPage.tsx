import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MAPS = [
  {
    id: '1',
    name: 'NEON CITADEL',
    dim: '100x100',
    sector: 'Sector 7B // X: 45.21, Y: 19.87',
    popDensity: 74,
    latency: '12ms',
    tag: 'STABLE_GRID',
    imgUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDUdg5V_fk5NtW8fWfsuBEY4NVTcGwP8kNK5w8VGy5W_WW4t8dLfHDjl8xu0mdb7-htHl2yqs7SdibgWhA2bJKtIfmoZNZKm5-xT0RhPArcOmLieYsHNiBeCED2X63ejFfUZCCxrT93PtI66xXogOzB26CKUXoTmyYM5GoLlo8LytXScf17V9_G_SzfUaiaBkmEHv5EOtuHjx2D4TVodnUxNbR1ubymbRhonDNnD607iiMiHGkGwS5Wivfi-hW8m8DH63LlCl-iG2E',
    imgPosition: '10% 80%'
  },
  {
    id: '2',
    name: 'FLOATING VOID GARDENS',
    dim: '250x250',
    sector: 'Sector 120 // X: 112.44, Y: 8.12',
    popDensity: 12,
    latency: '45ms',
    tag: 'ORGANIC_OS',
    imgUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDUdg5V_fk5NtW8fWfsuBEY4NVTcGwP8kNK5w8VGy5W_WW4t8dLfHDjl8xu0mdb7-htHl2yqs7SdibgWhA2bJKtIfmoZNZKm5-xT0RhPArcOmLieYsHNiBeCED2X63ejFfUZCCxrT93PtI66xXogOzB26CKUXoTmyYM5GoLlo8LytXScf17V9_G_SzfUaiaBkmEHv5EOtuHjx2D4TVodnUxNbR1ubymbRhonDNnD607iiMiHGkGwS5Wivfi-hW8m8DH63LlCl-iG2E',
    imgPosition: '50% 80%'
  },
  {
    id: '3',
    name: 'DATA NEXUS',
    dim: '500x500',
    sector: 'Sector 00A // X: 0.00, Y: 0.00',
    popDensity: 98,
    latency: '8ms',
    tag: 'RAW_PROCESSING',
    imgUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDUdg5V_fk5NtW8fWfsuBEY4NVTcGwP8kNK5w8VGy5W_WW4t8dLfHDjl8xu0mdb7-htHl2yqs7SdibgWhA2bJKtIfmoZNZKm5-xT0RhPArcOmLieYsHNiBeCED2X63ejFfUZCCxrT93PtI66xXogOzB26CKUXoTmyYM5GoLlo8LytXScf17V9_G_SzfUaiaBkmEHv5EOtuHjx2D4TVodnUxNbR1ubymbRhonDNnD607iiMiHGkGwS5Wivfi-hW8m8DH63LlCl-iG2E',
    imgPosition: '90% 80%'
  }
];

export function MapsPage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(MAPS[0]);

  return (
    <div className="font-body-md text-on-background selection:bg-primary/30 selection:text-primary-fixed min-h-screen relative overflow-hidden" style={{ backgroundColor: '#0b1326' }}>
      <div className="fixed inset-0 technical-grid pointer-events-none opacity-30"></div>
      
      <header className="bg-surface/80 backdrop-blur-md border-b border-outline-variant/30 shadow-[0_4px_30px_rgba(0,0,0,0.1)] fixed top-0 w-full z-50 flex justify-between items-center px-margin-desktop h-16">
        <div className="font-headline-lg text-headline-lg tracking-tighter text-primary-fixed drop-shadow-[0_0_8px_rgba(192,193,255,0.5)] cursor-pointer" onClick={() => navigate('/dashboard')}>METAVERSE</div>
        <nav className="hidden md:flex items-center gap-8 font-technical-data text-technical-data">
          <a className="text-on-surface-variant hover:text-secondary-fixed-dim transition-colors duration-300 cursor-pointer" onClick={() => navigate('/avatars')}>SYSTEM_STATUS</a>
          <a className="text-tertiary border-b-2 border-tertiary pb-1 hover:text-secondary-fixed-dim transition-colors duration-300 cursor-pointer" onClick={() => navigate('/maps')}>COORDINATES</a>
          <a className="text-on-surface-variant hover:text-secondary-fixed-dim transition-colors duration-300 cursor-pointer" onClick={() => navigate('/lobby')}>TELEMETRY</a>
        </nav>
        <div className="flex items-center gap-4">
          <button className="scale-95 active:scale-90 transition-transform text-tertiary">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="scale-95 active:scale-90 transition-transform text-tertiary" onClick={() => navigate('/home-page')}>
            <span className="material-symbols-outlined">settings</span>
          </button>
          <button className="scale-95 active:scale-90 transition-transform text-tertiary" onClick={() => navigate('/')}>
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
            <a className="flex items-center gap-3 text-on-surface-variant opacity-70 hover:opacity-100 pl-4 py-3 hover:bg-surface-container-high/50 transition-all cursor-pointer" onClick={() => navigate('/dashboard')}>
              <span className="material-symbols-outlined">inventory_2</span>
              <span className="font-technical-data text-technical-data">INVENTORY</span>
            </a>
            <a className="flex items-center gap-3 text-on-surface-variant opacity-70 hover:opacity-100 pl-4 py-3 hover:bg-surface-container-high/50 transition-all cursor-pointer">
              <span className="material-symbols-outlined">psychology</span>
              <span className="font-technical-data text-technical-data">NEURAL_LINK</span>
            </a>
            <a className="flex items-center gap-3 text-primary font-bold border-l-4 border-primary pl-4 bg-primary-fixed/10 py-3 translate-x-1 transition-transform duration-200 cursor-pointer" onClick={() => navigate('/maps')}>
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>grid_view</span>
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
                <span className="font-technical-data text-label-sm text-primary tracking-[0.2em]">02.</span>
                <span className="font-display-2xl text-[48px] md:text-[36px] leading-tight text-on-background">WORLD_SPAWN</span>
              </div>
              <div className="mt-2 flex items-center gap-4">
                <code className="text-on-surface-variant/60 font-technical-data text-[12px]">
                  PROTOCOL: GET /api/v1/maps // SELECT_GEOMETRIC_BUFFER
                </code>
              </div>
            </div>
            <div className="text-right">
              <div className="font-technical-data text-[10px] text-tertiary">AVAILABILITY_INDEX: 99.4%</div>
              <div className="font-technical-data text-[10px] text-tertiary">ENCRYPTION: RSA_4096_ACTIVE</div>
            </div>
          </header>

          <div className="mb-12">
            <div className="flex overflow-x-auto gap-6 pb-8 custom-scrollbar">
              {MAPS.map((m) => (
                <div key={m.id} className="flex-none w-[340px] group">
                  <div
                    className={`character-card glass-panel rounded-xl overflow-hidden cursor-pointer transition-all duration-500 hover:-translate-y-2 border-2 ${selected.id === m.id ? 'active' : 'border-transparent'}`}
                    onClick={() => setSelected(m)}
                  >
                    <div className="h-48 bg-surface-container-high/50 relative overflow-hidden">
                      <img alt={`${m.name} Map`} className="absolute w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700" src={m.imgUrl} style={{ objectPosition: m.imgPosition, scale: '1.5' }} />
                      <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent opacity-80"></div>
                      <div className="absolute top-3 right-3 px-2 py-1 bg-surface-container-highest/80 text-[10px] font-technical-data text-tertiary rounded backdrop-blur-sm border border-outline-variant/30">
                        {m.tag}
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-headline-lg-mobile text-[20px] text-on-background max-w-[200px] leading-tight">{m.name}</div>
                        <div className="font-technical-data text-[12px] text-tertiary">DIM:<br/>{m.dim}</div>
                      </div>
                      <div className="font-technical-data text-[11px] text-on-surface-variant/60 mb-4">{m.sector}</div>
                      
                      <div className="mb-4">
                        <div className="flex justify-between font-technical-data text-[10px] mb-1">
                          <span className="text-on-surface-variant/60">POP_DENSITY: {m.popDensity}%</span>
                        </div>
                        <div className="h-1 w-full bg-surface-container-highest rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-primary to-tertiary" style={{ width: `${m.popDensity}%` }}></div>
                        </div>
                      </div>

                      <button className={`w-full py-2 font-technical-data text-[12px] border transition-colors ${selected.id === m.id ? 'bg-primary/20 border-primary text-primary' : 'bg-surface border-outline-variant text-on-surface-variant hover:border-tertiary hover:text-tertiary'}`}>
                        # SPAWN_HERE
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
            <div className="lg:col-span-2 glass-panel rounded-xl p-8 neon-border-glow bg-surface-container-low/80 flex justify-between items-center">
              <div>
                <h3 className="font-technical-data text-primary text-[14px] font-bold mb-2 tracking-widest">RECOMMENDED_SPAWN: {selected.name}</h3>
                <p className="font-technical-data text-[12px] text-on-surface-variant/70">
                  Optimal latency detected ({selected.latency}). All neural links synchronized.
                </p>
              </div>
              <div className="flex items-center gap-6">
                <div className="font-display-2xl text-[32px] text-tertiary">98%</div>
                <button className="px-6 py-2 border border-outline-variant text-on-surface-variant font-technical-data text-[12px] hover:bg-surface-container-highest transition-colors">
                  AUTO_SELECT
                </button>
              </div>
            </div>

            <div className="glass-panel rounded-xl p-6 bg-surface-container-lowest flex flex-col items-center justify-center text-center cursor-pointer hover:bg-surface-container-highest transition-colors group">
              <div className="w-10 h-10 rounded-full border-2 border-primary flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-primary group-hover:animate-spin">radar</span>
              </div>
              <h4 className="font-technical-data text-on-background font-bold text-[14px]">SCANNING</h4>
              <p className="font-technical-data text-[10px] text-on-surface-variant/50 mt-1 uppercase">New world buffers...</p>
            </div>
          </div>
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
