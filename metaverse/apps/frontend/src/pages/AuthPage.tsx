import { useState } from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Lock, User, UserPlus, LogIn, ShieldCheck, ChevronDownIcon } from 'lucide-react';

// ─── Image with graceful fallback ───────────────────────────────────────────
const ERROR_IMG =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg==';

function RobotImage({ src }: { src: string }) {
  const [err, setErr] = useState(false);
  return (
    <img
      src={err ? ERROR_IMG : src}
      alt="Robot Sketch Outline"
      onError={() => setErr(true)}
      className="w-full h-auto object-contain"
    />
  );
}

// ─── Auth form (self-contained, no shadcn dependencies) ─────────────────────
const IC = 'w-full bg-[#0d0d24] border border-indigo-500/30 rounded-lg text-zinc-100 placeholder:text-zinc-600 text-sm py-2.5 pr-3 pl-10 outline-none focus:border-indigo-500/70 focus:ring-2 focus:ring-indigo-500/20 transition';

function AuthForm() {
  const [signInData, setSignInData] = useState({ username: '', password: '' });
  const [signUpData, setSignUpData] = useState({ username: '', password: '', userType: '' });

  const handleSignIn = (e: React.FormEvent) => { e.preventDefault(); console.log('Sign In:', signInData); };
  const handleSignUp = (e: React.FormEvent) => { e.preventDefault(); console.log('Sign Up:', signUpData); };

  return (
    <div
      className="w-full rounded-2xl backdrop-blur-xl border border-indigo-500/20"
      style={{ background: 'rgba(10,10,26,0.92)', boxShadow: '0 0 0 1px rgba(99,102,241,0.15), 0 32px 64px rgba(0,0,0,0.7), 0 0 80px rgba(99,102,241,0.06)' }}
    >
      {/* Brand mark */}
      <div className="flex flex-col items-center pt-8 pb-4 gap-2">
        <div
          className="w-11 h-11 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center"
          style={{ boxShadow: '0 0 20px rgba(99,102,241,0.3)' }}
        >
          <ShieldCheck className="w-5 h-5 text-indigo-400" />
        </div>
        <span className="text-[10px] font-semibold tracking-[0.2em] text-zinc-500 uppercase">Secure Access</span>
      </div>

      <TabsPrimitive.Root defaultValue="signin">
        {/* Tab bar */}
        <div className="px-6 pb-0">
          <TabsPrimitive.List className="grid grid-cols-2 bg-[#0d0d24] border border-indigo-500/20 p-0.5 rounded-lg w-full">
            <TabsPrimitive.Trigger
              value="signin"
              className="flex items-center justify-center gap-1.5 py-2 text-sm text-zinc-400 rounded-md transition-all data-[state=active]:bg-zinc-700 data-[state=active]:text-white"
            >
              <LogIn className="w-4 h-4" /> Sign In
            </TabsPrimitive.Trigger>
            <TabsPrimitive.Trigger
              value="signup"
              className="flex items-center justify-center gap-1.5 py-2 text-sm text-zinc-400 rounded-md transition-all data-[state=active]:bg-zinc-700 data-[state=active]:text-white"
            >
              <UserPlus className="w-4 h-4" /> Sign Up
            </TabsPrimitive.Trigger>
          </TabsPrimitive.List>
        </div>

        {/* ─── Sign In ─── */}
        <TabsPrimitive.Content value="signin">
          <form onSubmit={handleSignIn} className="px-6 pt-6 pb-8 space-y-5">
            <div>
              <h2 className="text-xl font-semibold text-zinc-100">Welcome back</h2>
              <p className="text-sm text-zinc-400 mt-0.5">Sign in to your account to continue</p>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm text-zinc-300 font-medium block">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input type="text" placeholder="Enter your username" className={IC} value={signInData.username} onChange={e => setSignInData({ ...signInData, username: e.target.value })} required />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm text-zinc-300 font-medium block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input type="password" placeholder="Enter your password" className={IC} value={signInData.password} onChange={e => setSignInData({ ...signInData, password: e.target.value })} required />
              </div>
            </div>
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors text-sm mt-2">
              Sign In
            </button>
          </form>
        </TabsPrimitive.Content>

        {/* ─── Sign Up ─── */}
        <TabsPrimitive.Content value="signup">
          <form onSubmit={handleSignUp} className="px-6 pt-6 pb-8 space-y-5">
            <div>
              <h2 className="text-xl font-semibold text-zinc-100">Create account</h2>
              <p className="text-sm text-zinc-400 mt-0.5">Fill in the details below to get started</p>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm text-zinc-300 font-medium block">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input type="text" placeholder="Choose a username" className={IC} value={signUpData.username} onChange={e => setSignUpData({ ...signUpData, username: e.target.value })} required />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm text-zinc-300 font-medium block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input type="password" placeholder="Create a password" className={IC} value={signUpData.password} onChange={e => setSignUpData({ ...signUpData, password: e.target.value })} required />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm text-zinc-300 font-medium block">Account Type</label>
              <SelectPrimitive.Root value={signUpData.userType} onValueChange={v => setSignUpData({ ...signUpData, userType: v })}>
                <SelectPrimitive.Trigger className="flex w-full items-center justify-between bg-[#0d0d24] border border-indigo-500/30 rounded-lg text-sm text-zinc-100 py-2.5 px-3 outline-none focus:border-indigo-500/70 focus:ring-2 focus:ring-indigo-500/20 transition data-[placeholder]:text-zinc-600">
                  <SelectPrimitive.Value placeholder="Select account type" />
                  <ChevronDownIcon className="w-4 h-4 text-zinc-500 shrink-0" />
                </SelectPrimitive.Trigger>
                <SelectPrimitive.Portal>
                  <SelectPrimitive.Content className="z-50 min-w-[8rem] overflow-hidden rounded-lg border border-indigo-500/25 bg-[#0d0d24] shadow-xl" position="popper" sideOffset={4}>
                    <SelectPrimitive.Viewport className="p-1">
                      {['user', 'admin'].map(v => (
                        <SelectPrimitive.Item key={v} value={v} className="relative flex cursor-default select-none items-center rounded-md py-2 pl-3 pr-8 text-sm text-zinc-200 outline-none focus:bg-zinc-700 focus:text-zinc-100 capitalize data-[disabled]:opacity-50">
                          <SelectPrimitive.ItemText>{v.charAt(0).toUpperCase() + v.slice(1)}</SelectPrimitive.ItemText>
                        </SelectPrimitive.Item>
                      ))}
                    </SelectPrimitive.Viewport>
                  </SelectPrimitive.Content>
                </SelectPrimitive.Portal>
              </SelectPrimitive.Root>
            </div>
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors text-sm mt-2">
              Create Account
            </button>
          </form>
        </TabsPrimitive.Content>
      </TabsPrimitive.Root>
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────
export function AuthPage() {
  return (
    <div className="auth-page min-h-screen bg-[#050510] flex items-center justify-center relative overflow-hidden font-sans">
      {/* Base perspective grid */}
      <div className="absolute inset-0 opacity-50 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(99,102,241,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.4) 1px, transparent 1px)', backgroundSize: '60px 60px', maskImage: 'linear-gradient(to bottom, transparent 0%, black 20%, black 75%, transparent 100%)' }} />

      {/* Perspective floor grid */}
      <div className="absolute bottom-0 left-0 right-0 h-1/2 opacity-40 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(139,92,246,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.6) 1px, transparent 1px)', backgroundSize: '80px 80px', transform: 'perspective(400px) rotateX(60deg)', transformOrigin: 'bottom center' }} />

      {/* Atmospheric glows */}
      <div className="absolute -top-60 -left-60 w-[700px] h-[700px] bg-indigo-600/15 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute -bottom-60 -right-60 w-[600px] h-[600px] bg-violet-700/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Robot image */}
      <div className="absolute top-[12%] left-[4%] md:left-[8%] w-[220px] md:w-[300px] opacity-75 rotate-[-5deg] pointer-events-none z-0">
        <RobotImage src="/image.png" />
      </div>

      {/* VR Headset */}
      <svg className="absolute bottom-[20%] right-[10%] opacity-50 text-cyan-400 rotate-12 pointer-events-none" width="160" height="100" viewBox="0 0 160 100" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M20,30 Q40,10 80,10 Q120,10 140,30 L150,50 Q155,70 140,80 Q120,90 80,90 Q40,90 20,80 L10,50 Z" strokeDasharray="4 2" />
        <rect x="30" y="30" width="100" height="40" rx="10" />
        <path d="M80,30 L80,70" /><circle cx="55" cy="50" r="10" strokeWidth="1" /><circle cx="105" cy="50" r="10" strokeWidth="1" />
      </svg>

      {/* Robotic Hand */}
      <svg className="absolute top-[10%] right-[18%] opacity-40 text-indigo-400 -rotate-12 pointer-events-none" width="140" height="180" viewBox="0 0 140 180" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M50,180 L40,120 L30,60 L40,30 L50,10 L60,30 L60,80" />
        <path d="M70,180 L70,110 L75,50 L85,20 L95,50 L85,90" />
        <path d="M90,180 L100,120 L110,60 L120,40 L130,60 L115,100" />
        <path d="M30,120 L10,90 L5,70 L15,60 L25,80" />
        <circle cx="40" cy="120" r="4" /><circle cx="30" cy="60" r="3" /><circle cx="70" cy="110" r="4" /><circle cx="75" cy="50" r="3" /><circle cx="100" cy="120" r="4" /><circle cx="110" cy="60" r="3" /><circle cx="10" cy="90" r="3" />
        <line x1="30" y1="150" x2="110" y2="150" strokeDasharray="3 3" />
      </svg>

      {/* HUD Blueprint */}
      <svg className="absolute top-[40%] left-[5%] opacity-40 text-violet-300 pointer-events-none" width="180" height="120" viewBox="0 0 180 120" fill="none" stroke="currentColor" strokeWidth="1">
        <rect x="10" y="10" width="160" height="100" rx="4" />
        <line x1="10" y1="30" x2="170" y2="30" /><line x1="50" y1="10" x2="50" y2="30" />
        <path d="M20,50 L80,50 M20,70 L60,70 M20,90 L90,90" strokeDasharray="2 2" />
        <circle cx="130" cy="70" r="20" /><circle cx="130" cy="70" r="10" strokeDasharray="1 3" /><polyline points="130,70 145,55 160,55" />
      </svg>

      {/* Circuit nodes */}
      <svg className="absolute bottom-[8%] left-[22%] opacity-40 text-cyan-400 pointer-events-none" width="200" height="150" viewBox="0 0 200 150" fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M10,140 L50,100 L120,100 L160,60 L190,60" />
        <path d="M50,100 L70,120 L150,120" strokeDasharray="4 4" />
        <path d="M120,100 L140,80 L180,80" />
        <circle cx="10" cy="140" r="4" fill="currentColor" /><circle cx="50" cy="100" r="3" /><circle cx="120" cy="100" r="4" fill="currentColor" /><circle cx="160" cy="60" r="3" /><circle cx="190" cy="60" r="4" fill="currentColor" />
        <rect x="145" y="115" width="10" height="10" /><rect x="175" y="75" width="10" height="10" />
      </svg>

      {/* Hexagon */}
      <svg className="absolute top-[8%] left-[40%] opacity-30 text-indigo-400 pointer-events-none" width="90" height="104" viewBox="0 0 90 104">
        <polygon points="45,2 88,26 88,78 45,102 2,78 2,26" fill="none" stroke="currentColor" strokeWidth="1" />
        <polygon points="45,18 72,33 72,63 45,78 18,63 18,33" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
      </svg>

      {/* Rotating cube */}
      <svg className="absolute top-[5%] right-[8%] opacity-30 text-cyan-400 pointer-events-none" width="120" height="120" viewBox="0 0 120 120" style={{ animation: 'spin 30s linear infinite' }}>
        <rect x="30" y="40" width="60" height="60" fill="none" stroke="currentColor" strokeWidth="1" />
        <polygon points="30,40 50,20 110,20 90,40" fill="none" stroke="currentColor" strokeWidth="1" />
        <polygon points="90,40 110,20 110,80 90,100" fill="none" stroke="currentColor" strokeWidth="1" />
      </svg>

      {/* Portal rings */}
      <svg className="absolute top-1/2 left-[2%] -translate-y-1/2 opacity-20 text-cyan-400 pointer-events-none" width="160" height="160" viewBox="0 0 160 160">
        <circle cx="80" cy="80" r="70" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="6 4" />
        <circle cx="80" cy="80" r="55" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 6" />
        <circle cx="80" cy="80" r="40" fill="none" stroke="currentColor" strokeWidth="0.8" />
        <circle cx="80" cy="80" r="4" fill="currentColor" opacity="0.4" />
      </svg>
      <svg className="absolute top-[60%] right-[3%] opacity-20 text-violet-400 pointer-events-none" width="130" height="130" viewBox="0 0 160 160">
        <circle cx="80" cy="80" r="70" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 6" />
        <circle cx="80" cy="80" r="50" fill="none" stroke="currentColor" strokeWidth="0.5" />
        <circle cx="80" cy="80" r="4" fill="currentColor" opacity="0.4" />
      </svg>

      {/* Scan lines */}
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(139,92,246,1) 3px, rgba(139,92,246,1) 4px)' }} />

      {/* Particles */}
      {([
        { top: '18%', left: '32%', s: 3, c: '#22d3ee' },
        { top: '28%', left: '72%', s: 2, c: '#818cf8' },
        { top: '55%', left: '15%', s: 2.5, c: '#a78bfa' },
        { top: '62%', left: '80%', s: 2, c: '#67e8f9' },
        { top: '78%', left: '45%', s: 3, c: '#a5b4fc' },
        { top: '12%', left: '58%', s: 2, c: '#c4b5fd' },
        { top: '42%', left: '88%', s: 2.5, c: '#22d3ee' },
        { top: '85%', left: '28%', s: 2, c: '#818cf8' },
      ] as const).map((p, i) => (
        <div key={i} className="absolute rounded-full pointer-events-none" style={{ top: p.top, left: p.left, width: p.s, height: p.s, background: p.c, boxShadow: `0 0 ${p.s * 4}px ${p.c}`, animation: `authpulse ${2 + (i % 3)}s ease-in-out infinite alternate` }} />
      ))}

      {/* Connecting lines */}
      <svg className="absolute inset-0 w-full h-full opacity-15 pointer-events-none" preserveAspectRatio="none">
        <line x1="32%" y1="18%" x2="72%" y2="28%" stroke="#6366f1" strokeWidth="0.5" />
        <line x1="72%" y1="28%" x2="80%" y2="62%" stroke="#8b5cf6" strokeWidth="0.5" />
        <line x1="15%" y1="55%" x2="32%" y2="18%" stroke="#06b6d4" strokeWidth="0.5" />
        <line x1="45%" y1="78%" x2="80%" y2="62%" stroke="#6366f1" strokeWidth="0.5" />
        <line x1="58%" y1="12%" x2="72%" y2="28%" stroke="#8b5cf6" strokeWidth="0.5" />
        <line x1="88%" y1="42%" x2="80%" y2="62%" stroke="#06b6d4" strokeWidth="0.5" />
      </svg>

      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 50% 55% at 50% 50%, rgba(5,5,16,0.05) 0%, rgba(5,5,16,0.65) 100%)' }} />

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes authpulse { from { opacity: 0.4; transform: scale(1); } to { opacity: 1; transform: scale(1.6); } }
      `}</style>

      {/* Auth form */}
      <div className="relative z-10 w-full max-w-md px-4 py-8">
        <AuthForm />
      </div>
    </div>
  );
}
