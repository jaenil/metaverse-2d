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
    <>
      <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop">
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
    </>
  );
}
