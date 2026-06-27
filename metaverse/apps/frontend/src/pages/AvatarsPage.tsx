import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AVATARS = [
  {
    id: '1',
    name: 'UNIT_734',
    class: 'COMBAT_DISSIDENT',
    modelId: 'WAR_MACHINE',
    sync: '88.4',
    tierCode: 'A',
    imgUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDUdg5V_fk5NtW8fWfsuBEY4NVTcGwP8kNK5w8VGy5W_WW4t8dLfHDjl8xu0mdb7-htHl2yqs7SdibgWhA2bJKtIfmoZNZKm5-xT0RhPArcOmLieYsHNiBeCED2X63ejFfUZCCxrT93PtI66xXogOzB26CKUXoTmyYM5GoLlo8LytXScf17V9_G_SzfUaiaBkmEHv5EOtuHjx2D4TVodnUxNbR1ubymbRhonDNnD607iiMiHGkGwS5Wivfi-hW8m8DH63LlCl-iG2E',
    imgPosition: '0% 0%'
  },
  {
    id: '2',
    name: 'PROTOS-5',
    class: 'EXPLORER_PRIME',
    modelId: 'ORBIT_WALKER',
    sync: '92.1',
    tierCode: 'B',
    imgUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDUdg5V_fk5NtW8fWfsuBEY4NVTcGwP8kNK5w8VGy5W_WW4t8dLfHDjl8xu0mdb7-htHl2yqs7SdibgWhA2bJKtIfmoZNZKm5-xT0RhPArcOmLieYsHNiBeCED2X63ejFfUZCCxrT93PtI66xXogOzB26CKUXoTmyYM5GoLlo8LytXScf17V9_G_SzfUaiaBkmEHv5EOtuHjx2D4TVodnUxNbR1ubymbRhonDNnD607iiMiHGkGwS5Wivfi-hW8m8DH63LlCl-iG2E',
    imgPosition: '50% 0%'
  },
  {
    id: '3',
    name: 'BEAM-BOT',
    class: 'HYBRID_BIO_TECH',
    modelId: 'VOID_BEAST',
    sync: '76.8',
    tierCode: 'C',
    imgUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDUdg5V_fk5NtW8fWfsuBEY4NVTcGwP8kNK5w8VGy5W_WW4t8dLfHDjl8xu0mdb7-htHl2yqs7SdibgWhA2bJKtIfmoZNZKm5-xT0RhPArcOmLieYsHNiBeCED2X63ejFfUZCCxrT93PtI66xXogOzB26CKUXoTmyYM5GoLlo8LytXScf17V9_G_SzfUaiaBkmEHv5EOtuHjx2D4TVodnUxNbR1ubymbRhonDNnD607iiMiHGkGwS5Wivfi-hW8m8DH63LlCl-iG2E',
    imgPosition: '100% 0%'
  },
  {
    id: '4',
    name: 'NAVIGATOR',
    class: 'SYSTEM_ARCHITECT',
    modelId: 'SURVEY_ARCHITECT',
    sync: '99.9',
    tierCode: 'D',
    imgUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDUdg5V_fk5NtW8fWfsuBEY4NVTcGwP8kNK5w8VGy5W_WW4t8dLfHDjl8xu0mdb7-htHl2yqs7SdibgWhA2bJKtIfmoZNZKm5-xT0RhPArcOmLieYsHNiBeCED2X63ejFfUZCCxrT93PtI66xXogOzB26CKUXoTmyYM5GoLlo8LytXScf17V9_G_SzfUaiaBkmEHv5EOtuHjx2D4TVodnUxNbR1ubymbRhonDNnD607iiMiHGkGwS5Wivfi-hW8m8DH63LlCl-iG2E',
    imgPosition: '0% 50%'
  },
];

const TIERS: Record<string, string> = { 'A': 'ALPHA', 'B': 'BETA', 'C': 'GAMMA', 'D': 'SIGMA' };
const MODULES: Record<string, string> = { 'A': 'V-AXIS 0.9', 'B': 'ORBIT-7', 'C': 'BIO-SYNTH', 'D': 'CORE-LOGIC' };

export function AvatarsPage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(AVATARS[0]);
  const [fade, setFade] = useState(false);

  const handleSelect = (avatar: typeof AVATARS[0]) => {
    setSelected(avatar);
    setFade(true);
    setTimeout(() => setFade(false), 300);
  };

  return (
    <div className="font-body-md text-on-background selection:bg-primary/30 selection:text-primary-fixed min-h-screen relative overflow-hidden" style={{ backgroundColor: '#0b1326' }}>
      <div className="fixed inset-0 technical-grid pointer-events-none opacity-30"></div>
      
      <header className="bg-surface/80 backdrop-blur-md border-b border-outline-variant/30 shadow-[0_4px_30px_rgba(0,0,0,0.1)] fixed top-0 w-full z-50 flex justify-between items-center px-margin-desktop h-16">
        <div className="font-headline-lg text-headline-lg tracking-tighter text-primary-fixed drop-shadow-[0_0_8px_rgba(192,193,255,0.5)] cursor-pointer" onClick={() => navigate('/dashboard')}>METAVERSE</div>
        <nav className="hidden md:flex items-center gap-8 font-technical-data text-technical-data">
          <a className="text-tertiary border-b-2 border-tertiary pb-1 hover:text-secondary-fixed-dim transition-colors duration-300 cursor-pointer" onClick={() => navigate('/avatars')}>SYSTEM_STATUS</a>
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
            <a className="flex items-center gap-3 text-primary font-bold border-l-4 border-primary pl-4 bg-primary-fixed/10 py-3 translate-x-1 transition-transform duration-200 cursor-pointer" onClick={() => navigate('/avatars')}>
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>fingerprint</span>
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
          <header className="mb-12">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_#c0c1ff]"></span>
              <span className="font-technical-data text-label-sm text-primary tracking-[0.2em]">GATEWAY_SEQUENCE_01</span>
            </div>
            <h1 className="font-display-2xl text-[48px] md:text-display-2xl leading-tight text-on-background mb-4">Character Customization</h1>
            <p className="font-body-md text-on-surface-variant max-w-2xl">
              Select your digital manifestation. Synchronization requires a stable neural link and validated biometric signature. All avatars are rendered from high-fidelity metadata.
            </p>
            <div className="mt-6 flex items-center gap-4">
              <code className="px-3 py-1.5 rounded-lg bg-surface-container-highest text-tertiary font-technical-data text-[12px] border border-outline-variant/30">
                GET /api/v1/avatars
              </code>
              <span className="text-on-surface-variant/40 font-technical-data text-[12px]">RESPONSE: 200 OK [Latency: 14ms]</span>
            </div>
          </header>

          <div className="mb-16">
            <div className="flex overflow-x-auto gap-8 pb-8 custom-scrollbar snap-x">
              {AVATARS.map((a) => (
                <div key={a.id} className="flex-none w-[320px] snap-center group">
                  <div
                    className={`character-card glass-panel rounded-xl overflow-hidden cursor-pointer transition-all duration-500 hover:-translate-y-2 border-2 ${selected.id === a.id ? 'active' : 'border-transparent'}`}
                    onClick={() => handleSelect(a)}
                  >
                    <div className="h-64 bg-surface-container-high/50 relative overflow-hidden">
                      <img alt={`${a.name} 2D Avatar`} className="absolute w-full h-full object-cover opacity-90 group-hover:scale-110 transition-transform duration-700" src={a.imgUrl} style={{ objectPosition: a.imgPosition, scale: '1.5' }} />
                      <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent opacity-60"></div>
                    </div>
                    <div className="p-6">
                      <div className="font-headline-lg-mobile text-on-background mb-1">{a.name}</div>
                      <div className="font-technical-data text-label-sm text-on-surface-variant/60">CLASS: {a.class}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
            <div className={`lg:col-span-2 glass-panel rounded-xl p-8 neon-border-glow transition-opacity duration-300 ${fade ? 'opacity-50' : 'opacity-100'}`}>
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-headline-lg-mobile text-primary">TECHNICAL_METADATA</h3>
                <div className="flex gap-2">
                  <span className="px-2 py-1 bg-primary/20 text-primary-fixed text-[10px] rounded font-technical-data">ENCRYPTED</span>
                  <span className="px-2 py-1 bg-tertiary/20 text-tertiary text-[10px] rounded font-technical-data">STABLE</span>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                <div className="space-y-1">
                  <div className="font-label-sm text-on-surface-variant/50">MODEL_ID</div>
                  <div className="font-technical-data text-on-background font-bold">{selected.modelId}</div>
                </div>
                <div className="space-y-1">
                  <div className="font-label-sm text-on-surface-variant/50">SYNC_RATIO</div>
                  <div className="font-technical-data text-primary font-bold">{selected.sync}%</div>
                </div>
                <div className="space-y-1">
                  <div className="font-label-sm text-on-surface-variant/50">CORE_MODULE</div>
                  <div className="font-technical-data text-on-background font-bold">{MODULES[selected.tierCode]}</div>
                </div>
                <div className="space-y-1">
                  <div className="font-label-sm text-on-surface-variant/50">TIER</div>
                  <div className="font-technical-data text-tertiary font-bold">{TIERS[selected.tierCode]}</div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between font-label-sm">
                    <span className="text-on-surface-variant">PROCESSING_POWER</span>
                    <span className="text-tertiary">74%</span>
                  </div>
                  <div className="h-1 w-full bg-surface-container-highest rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary to-tertiary w-[74%] relative">
                      <div className="absolute right-0 top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_white]"></div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between font-label-sm">
                    <span className="text-on-surface-variant">NEURAL_STABILITY</span>
                    <span className="text-tertiary">92%</span>
                  </div>
                  <div className="h-1 w-full bg-surface-container-highest rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary to-tertiary w-[92%] relative">
                      <div className="absolute right-0 top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_white]"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-panel rounded-xl p-8 bg-primary/5 flex flex-col items-center justify-center text-center">
              <div className="mb-8 w-24 h-24 rounded-full border-2 border-primary border-dashed p-2 animate-[spin_10s_linear_infinite]">
                <div className="w-full h-full rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                </div>
              </div>
              <h4 className="font-headline-lg-mobile text-on-background mb-4">READY FOR SYNC</h4>
              <p className="font-technical-data text-[12px] text-on-surface-variant mb-8 leading-relaxed">
                Once initialized, your consciousness will be ported to the AETHER grid. This action is irreversible within the current session.
              </p>
              <button className="w-full py-4 bg-primary text-on-primary font-technical-data font-bold rounded-lg shadow-[0_0_20px_rgba(192,193,255,0.4)] hover:shadow-[0_0_35px_rgba(192,193,255,0.6)] hover:scale-[1.02] active:scale-95 transition-all duration-300">
                INITIALIZE_ENTRY
              </button>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-surface-container-lowest/90 border-t border-outline-variant/10 fixed bottom-0 w-full z-50 flex justify-between items-center px-margin-desktop py-4 h-14">
        <div className="font-label-sm text-label-sm text-tertiary-fixed-dim">© 2124 METAVERSE_PROTOCOLS // ENCRYPTION_ACTIVE</div>
        <div className="flex items-center gap-6 font-technical-data text-technical-data text-secondary">METAVERSE_NODE_492</div>
        <div className="flex gap-6">
          <a className="font-label-sm text-label-sm text-on-surface-variant/50 hover:text-tertiary transition-all cursor-pointer">PRIVACY_LAYER</a>
          <a className="font-label-sm text-label-sm text-on-surface-variant/50 hover:text-tertiary transition-all cursor-pointer">LICENSE_AGREEMENT</a>
          <a className="font-label-sm text-label-sm text-on-surface-variant/50 hover:text-tertiary transition-all cursor-pointer">DEBUG_MODE</a>
        </div>
      </footer>
    </div>
  );
}
