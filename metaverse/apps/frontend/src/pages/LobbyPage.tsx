import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function LobbyPage() {
  const navigate = useNavigate();
  const [selectedNode, setSelectedNode] = useState('NODE_7A');

  const nodes = [
    { id: 'NODE_7A', latency: '12ms', capacity: '45/100', status: 'OPTIMAL', top: '30%', left: '40%' },
    { id: 'NODE_9B', latency: '45ms', capacity: '92/100', status: 'HEAVY', top: '60%', left: '20%' },
    { id: 'NODE_3C', latency: '8ms', capacity: '12/100', status: 'OPTIMAL', top: '20%', left: '70%' },
    { id: 'NODE_4D', latency: '120ms', capacity: '100/100', status: 'FULL', top: '70%', left: '65%' },
    { id: 'NODE_1E', latency: '24ms', capacity: '58/100', status: 'STABLE', top: '45%', left: '85%' },
  ];

  const activeSessions = [
    { id: 'USER_8921', sync: '99%', role: 'ADMIN' },
    { id: 'USER_4432', sync: '84%', role: 'USER' },
    { id: 'USER_9912', sync: '92%', role: 'USER' },
    { id: 'USER_1120', sync: '76%', role: 'GUEST' },
  ];

  const currentNode = nodes.find(n => n.id === selectedNode) || nodes[0];

  return (
    <div className="font-body-md text-on-background selection:bg-primary/30 selection:text-primary-fixed min-h-screen relative overflow-hidden" style={{ backgroundColor: '#0b1326' }}>
      <div className="fixed inset-0 technical-grid pointer-events-none opacity-30"></div>
      
      <header className="bg-surface/80 backdrop-blur-md border-b border-outline-variant/30 shadow-[0_4px_30px_rgba(0,0,0,0.1)] fixed top-0 w-full z-50 flex justify-between items-center px-margin-desktop h-16">
        <div className="font-headline-lg text-headline-lg tracking-tighter text-primary-fixed drop-shadow-[0_0_8px_rgba(192,193,255,0.5)] cursor-pointer" onClick={() => navigate('/dashboard')}>METAVERSE</div>
        <nav className="hidden md:flex items-center gap-8 font-technical-data text-technical-data">
          <a className="text-on-surface-variant hover:text-secondary-fixed-dim transition-colors duration-300 cursor-pointer" onClick={() => navigate('/avatars')}>SYSTEM_STATUS</a>
          <a className="text-on-surface-variant hover:text-secondary-fixed-dim transition-colors duration-300 cursor-pointer" onClick={() => navigate('/maps')}>COORDINATES</a>
          <a className="text-tertiary border-b-2 border-tertiary pb-1 hover:text-secondary-fixed-dim transition-colors duration-300 cursor-pointer" onClick={() => navigate('/lobby')}>TELEMETRY</a>
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
            <a className="flex items-center gap-3 text-primary font-bold border-l-4 border-primary pl-4 bg-primary-fixed/10 py-3 translate-x-1 transition-transform duration-200 cursor-pointer">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
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
          <header className="mb-8 flex justify-between items-end">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-technical-data text-label-sm text-primary tracking-[0.2em]">04.</span>
                <span className="font-display-2xl text-[48px] md:text-[36px] leading-tight text-on-background">MULTIPLAYER_LOBBY</span>
              </div>
              <div className="mt-2 flex items-center gap-4">
                <code className="text-on-surface-variant/60 font-technical-data text-[12px]">
                  PROTOCOL: WSS // ESTABLISHING_UPLINK
                </code>
              </div>
            </div>
            <div className="text-right flex items-center gap-4">
              <div className="font-technical-data text-[10px] text-tertiary text-right">
                <div>ACTIVE_NODES: 324</div>
                <div>GLOBAL_PING: 14ms</div>
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-tertiary flex items-center justify-center animate-[spin_4s_linear_infinite]">
                <span className="material-symbols-outlined text-tertiary text-[20px]">public</span>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter h-[600px]">
            {/* Node Graph Area */}
            <div className="lg:col-span-2 glass-panel rounded-xl overflow-hidden relative border border-outline-variant/30 flex items-center justify-center bg-surface-container-lowest">
              <div className="absolute inset-0 blueprint-sketch opacity-20"></div>
              
              {/* Fake connections */}
              <svg className="absolute inset-0 w-full h-full z-0 pointer-events-none">
                <line x1="40%" y1="30%" x2="20%" y2="60%" stroke="rgba(192,193,255,0.2)" strokeWidth="1" strokeDasharray="4" />
                <line x1="40%" y1="30%" x2="70%" y2="20%" stroke="rgba(192,193,255,0.2)" strokeWidth="1" strokeDasharray="4" />
                <line x1="40%" y1="30%" x2="85%" y2="45%" stroke="rgba(192,193,255,0.5)" strokeWidth="2" />
                <line x1="70%" y1="20%" x2="85%" y2="45%" stroke="rgba(192,193,255,0.2)" strokeWidth="1" strokeDasharray="4" />
                <line x1="85%" y1="45%" x2="65%" y2="70%" stroke="rgba(192,193,255,0.2)" strokeWidth="1" strokeDasharray="4" />
                <line x1="20%" y1="60%" x2="65%" y2="70%" stroke="rgba(192,193,255,0.2)" strokeWidth="1" strokeDasharray="4" />
              </svg>

              {/* Nodes */}
              {nodes.map(node => (
                <div 
                  key={node.id} 
                  className={`absolute z-10 -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 ${selectedNode === node.id ? 'scale-125 z-20' : 'hover:scale-110'}`}
                  style={{ top: node.top, left: node.left }}
                  onClick={() => setSelectedNode(node.id)}
                >
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center ${selectedNode === node.id ? 'bg-primary shadow-[0_0_20px_#c0c1ff]' : 'bg-surface-container-highest border border-primary/50'}`}>
                    {selectedNode === node.id && <div className="w-8 h-8 rounded-full border border-primary animate-ping absolute"></div>}
                  </div>
                  <div className={`absolute top-6 left-1/2 -translate-x-1/2 font-technical-data text-[10px] whitespace-nowrap bg-surface-container-highest/80 px-2 py-1 rounded backdrop-blur-sm border ${selectedNode === node.id ? 'border-primary text-primary' : 'border-outline-variant/30 text-on-surface-variant'}`}>
                    {node.id}
                  </div>
                </div>
              ))}
              
              <div className="absolute bottom-4 left-4 font-technical-data text-[10px] text-on-surface-variant/50">
                SCROLL TO ZOOM // DRAG TO PAN
              </div>
            </div>

            {/* Sidebar Panels */}
            <div className="flex flex-col gap-gutter h-full">
              {/* Node Inspection */}
              <div className="glass-panel rounded-xl p-6 border border-outline-variant/30 flex-1 flex flex-col">
                <h3 className="font-technical-data text-primary text-[12px] font-bold mb-4 tracking-widest border-b border-primary/30 pb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">memory</span>
                  NODE_INSPECTION
                </h3>
                
                <div className="space-y-4 mb-6 flex-1">
                  <div className="flex justify-between items-end border-b border-outline-variant/10 pb-2">
                    <span className="font-technical-data text-[10px] text-on-surface-variant/70">ID</span>
                    <span className="font-technical-data text-[14px] text-on-background font-bold">{currentNode.id}</span>
                  </div>
                  <div className="flex justify-between items-end border-b border-outline-variant/10 pb-2">
                    <span className="font-technical-data text-[10px] text-on-surface-variant/70">LATENCY</span>
                    <span className={`font-technical-data text-[14px] font-bold ${parseInt(currentNode.latency) < 50 ? 'text-tertiary' : parseInt(currentNode.latency) < 100 ? 'text-primary' : 'text-error'}`}>{currentNode.latency}</span>
                  </div>
                  <div className="flex justify-between items-end border-b border-outline-variant/10 pb-2">
                    <span className="font-technical-data text-[10px] text-on-surface-variant/70">CAPACITY</span>
                    <span className="font-technical-data text-[14px] text-on-background">{currentNode.capacity}</span>
                  </div>
                  <div className="flex justify-between items-end border-b border-outline-variant/10 pb-2">
                    <span className="font-technical-data text-[10px] text-on-surface-variant/70">STATUS</span>
                    <span className="font-technical-data text-[12px] text-primary bg-primary/10 px-2 py-0.5 rounded">{currentNode.status}</span>
                  </div>
                </div>

                <button className="w-full py-3 bg-primary text-on-primary font-technical-data font-bold text-[12px] hover:bg-primary-fixed hover:glow-cyan transition-all disabled:opacity-50 flex justify-center items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">link</span>
                  CONNECT_TO_NODE
                </button>
              </div>

              {/* Active Sessions */}
              <div className="glass-panel rounded-xl p-6 border border-outline-variant/30 flex-1 flex flex-col">
                <h3 className="font-technical-data text-primary text-[12px] font-bold mb-4 tracking-widest border-b border-primary/30 pb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">group</span>
                  ACTIVE_SESSIONS ({activeSessions.length})
                </h3>
                
                <div className="overflow-y-auto custom-scrollbar pr-2 flex-1 space-y-2">
                  {activeSessions.map((session, i) => (
                    <div key={i} className="flex justify-between items-center p-2 rounded bg-surface-container-highest/50 border border-outline-variant/10 hover:border-primary/30 transition-colors cursor-pointer group">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></div>
                        <span className="font-technical-data text-[12px] text-on-background group-hover:text-primary transition-colors">{session.id}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-technical-data text-[9px] text-on-surface-variant/60">{session.role}</span>
                        <span className="font-technical-data text-[10px] text-tertiary">{session.sync}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 glass-panel rounded-xl p-4 border border-outline-variant/30 flex items-center gap-4">
             <span className="material-symbols-outlined text-on-surface-variant">chat</span>
             <input type="text" className="flex-1 bg-transparent border-none outline-none font-technical-data text-[12px] text-on-background placeholder:text-on-surface-variant/50" placeholder="BROADCAST_MESSAGE_TO_LOBBY..." />
             <button className="px-4 py-2 bg-surface-container-highest text-on-surface-variant font-technical-data text-[10px] hover:text-primary hover:bg-surface-container-high transition-colors rounded">SEND</button>
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
