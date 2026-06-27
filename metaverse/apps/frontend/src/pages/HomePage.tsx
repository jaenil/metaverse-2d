import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const WALLETS = ['Metamask', 'Kaikas', 'Klip', 'Phantom', 'Petra', 'Martian'];
const WALLET_ICONS: Record<string, string> = {
  Metamask: 'account_balance_wallet',
  Kaikas: 'token',
  Klip: 'grid_view',
  Phantom: 'visibility',
  Petra: 'diamond',
  Martian: 'hub',
};

export function HomePage() {
  const [nickname, setNickname] = useState('User');
  const [sellerName, setSellerName] = useState('User');
  const { clearAuth } = useAuthStore();
  const navigate = useNavigate();

  function handleLogout() {
    clearAuth();
    navigate('/');
  }

  return (
    <div className="font-body-md text-on-background selection:bg-primary selection:text-on-primary min-h-screen relative overflow-hidden" style={{ backgroundColor: '#060e20' }}>
      {/* Background Elements */}
      <div className="fixed inset-0 z-0 technical-grid opacity-30"></div>
      <div className="fixed inset-0 z-0">
        <div className="absolute top-20 left-10 w-96 h-96 blueprint-sketch" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAZ1cdg6IaPpw4T6XsIB6Iy9RXHEGCUZgJJj55ifaYOQaCo7Eq13Lx9f8BaHEM0ZEN1w1FFkfk0qz2NUXLhoAcFVKQsIJKc5Xrlt-uDNDNk7gzXZM3vrDr0yy7bQxc3C2mbItZ_DvhsOYkWbSQgRycztHAIGdYT0TUdKcKFEVCrPYmOKNTJVIzw8I-RfwbfUipqK4RBDsu5QOzOKOa4v-eoDwAU38QVRSy1rUfvvBHfVo37sMLQP9uAHykhgWZ57jL5tM28PwXErKI")' }}></div>
        <div className="absolute bottom-20 right-10 w-64 h-64 blueprint-sketch rotate-12 opacity-5" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDyOAOIeUE5EbL4I5tHAt7c91iNvqizGKYZacX3BXJAyQ6sW3IKMonU6l4Wmm3GBp9H32ZiWKMaA_RazxieG4xqMX95e0Lpu9LU28vFR3xpH6Z_3HdaVXOfhOb_zFvFQOZcqRdChCSTpzNmUuLHCOyHizku2hXQO-yiLGx4vfdL3GH5fd_5wZdoJ_6mJtjBAkLsAQWJSy6WM5nTtai-Cx09_0-dtacZaYhFWM-W37B8WRFcGbN7naTpO-8IIWNzdSXEuvWwRiwX5K4")' }}></div>
        <div className="absolute top-1/2 left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]"></div>
      </div>

      {/* Navigation */}
      <header className="w-full top-0 sticky border-b border-outline-variant/30 bg-surface/80 backdrop-blur-md flex justify-between items-center px-margin-mobile md:px-margin-desktop py-4 z-50 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
        <div className="flex items-center gap-8">
          <span className="font-display-2xl text-headline-lg-mobile md:text-headline-lg text-primary tracking-widest uppercase cursor-pointer" onClick={() => navigate('/dashboard')}>METAVERSE</span>
          <nav className="hidden md:flex gap-6">
            <a className="text-on-surface-variant font-label-sm text-label-sm uppercase hover:text-primary transition-colors duration-300 cursor-pointer" onClick={() => navigate('/maps')}>Schematics</a>
            <a className="text-on-surface-variant font-label-sm text-label-sm uppercase hover:text-primary transition-colors duration-300 cursor-pointer" onClick={() => navigate('/avatars')}>Assets</a>
            <a className="text-on-surface-variant font-label-sm text-label-sm uppercase hover:text-primary transition-colors duration-300 cursor-pointer" onClick={() => navigate('/lobby')}>Network</a>
            <a className="text-on-surface-variant font-label-sm text-label-sm uppercase hover:text-primary transition-colors duration-300 cursor-pointer" onClick={() => navigate('/dashboard')}>Terminal</a>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined">account_balance_wallet</span>
          </button>
          <button className="text-on-surface-variant hover:text-primary transition-colors" onClick={handleLogout}>
            <span className="material-symbols-outlined">logout</span>
          </button>
          <div className="w-8 h-8 rounded-full border border-primary/20 overflow-hidden">
            <img className="w-full h-full object-cover" alt="User Avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBBxSIcoXQKHmOKyfPhqP63yu2xR506H9l2J9BgUY6ah2zMeU2tGBHjkyOwvrLeMIYzZPDFPXFi-eQFuDf3ilJelgvmwCeqSemWCGE0UJwtpsNFDO54Et-kTWXG8IQfZjL65q3CCmbHQYaI8yCfBP1pbamyxScLI_5AzYVwUhJzgMVFWGBRwPh20_VDRrFxTBLbgwJFoqxCRjIP5GKWcTH7vt7crKbcgQ0Ka5Q07xLfmd6XmJPx6LYtgTJPR-3Ed9y1cclR14_C-a0" />
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-margin-mobile md:px-margin-desktop py-12 md:py-24">
        {/* Header */}
        <div className="mb-12">
          <h1 className="font-headline-lg text-headline-lg text-primary mb-2">Profile Settings</h1>
          <p className="font-technical-data text-technical-data text-on-surface-variant uppercase tracking-widest">System Configuration // ID: METAVERSE_USER_01</p>
          <div className="technical-line mt-6"></div>
        </div>

        <section className="space-y-12">
          {/* Identity Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2 group">
              <label className="font-label-sm text-label-sm text-tertiary-fixed-dim uppercase tracking-wider block transition-colors group-focus-within:text-primary">Nickname</label>
              <input
                className="w-full bg-surface-container-lowest/50 border border-outline-variant/30 rounded-none px-4 py-3 font-technical-data text-technical-data focus:border-tertiary focus:ring-0 transition-all text-on-surface placeholder:text-on-surface-variant/30 outline-none"
                placeholder="Enter Nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />
            </div>
            <div className="space-y-2 group">
              <label className="font-label-sm text-label-sm text-tertiary-fixed-dim uppercase tracking-wider block transition-colors group-focus-within:text-primary">Asset Store Seller Nickname</label>
              <input
                className="w-full bg-surface-container-lowest/50 border border-outline-variant/30 rounded-none px-4 py-3 font-technical-data text-technical-data focus:border-tertiary focus:ring-0 transition-all text-on-surface placeholder:text-on-surface-variant/30 outline-none"
                placeholder="Enter Seller Name"
                value={sellerName}
                onChange={(e) => setSellerName(e.target.value)}
              />
              <p className="text-[10px] font-technical-data text-on-surface-variant/60 uppercase">This will be shown when you upload assets to the Asset Store.</p>
            </div>
          </div>

          <div className="technical-line opacity-30"></div>

          {/* Wallet Section */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-1">Connect Wallet</h2>
                <p className="font-technical-data text-technical-data text-on-surface-variant uppercase">Link personal identities</p>
              </div>
              <a className="font-label-sm text-label-sm text-tertiary-fixed-dim hover:text-primary transition-colors flex items-center gap-2 cursor-pointer">
                WALLET_GUIDE.PDF <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </a>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {WALLETS.map(w => (
                <button key={w} className="flex items-center justify-between px-4 py-3 bg-surface-container-lowest/30 border border-outline-variant/20 hover:border-primary/50 hover:bg-surface-container-low/50 transition-all group">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">{WALLET_ICONS[w] || 'account_balance_wallet'}</span>
                    <span className="font-technical-data text-technical-data uppercase">{w}</span>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant/30 group-hover:translate-x-1 transition-transform">chevron_right</span>
                </button>
              ))}
            </div>
          </div>

          <div className="technical-line opacity-30"></div>

          {/* Actions */}
          <div className="flex flex-col md:flex-row items-center gap-6 pt-4">
            <button className="w-full md:w-auto px-12 py-3 bg-primary text-on-primary font-label-sm text-label-sm uppercase tracking-widest hover:bg-primary-fixed hover:glow-cyan transition-all duration-300">
              Save Changes
            </button>
            <button className="w-full md:w-auto px-8 py-3 border border-outline text-on-surface-variant font-label-sm text-label-sm uppercase tracking-widest hover:bg-surface-container-high transition-all">
              Discard
            </button>
          </div>

          <div className="pt-24 pb-12 flex flex-col items-start gap-4">
            <div className="technical-line opacity-10 mb-4"></div>
            <button className="font-label-sm text-label-sm text-error/60 hover:text-error transition-colors flex items-center gap-2 group">
              <span className="material-symbols-outlined text-[16px] group-hover:animate-pulse">warning</span>
              DELETE_ACCOUNT_PERMANENTLY
            </button>
            <p className="font-technical-data text-[10px] text-on-surface-variant/40 max-w-sm uppercase">Warning: Account deletion is irreversible. All assets and credentials will be purged from METAVERSE.</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-12 border-t border-outline-variant/10 relative z-10 bg-surface/50 mt-auto">
        <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="space-y-1 text-center md:text-left">
            <span className="font-headline-lg text-primary text-xl">METAVERSE</span>
            <p className="font-label-sm text-label-sm text-on-surface-variant/40 uppercase">© 2124 METAVERSE PROTOCOL. ALL RIGHTS RESERVED.</p>
          </div>
          <div className="flex gap-6 flex-wrap justify-center">
            <a className="font-label-sm text-label-sm text-on-surface-variant/40 hover:text-tertiary-fixed-dim transition-colors uppercase cursor-pointer">Documentation</a>
            <a className="font-label-sm text-label-sm text-on-surface-variant/40 hover:text-tertiary-fixed-dim transition-colors uppercase cursor-pointer">Privacy</a>
            <a className="font-label-sm text-label-sm text-on-surface-variant/40 hover:text-tertiary-fixed-dim transition-colors uppercase cursor-pointer">Terms</a>
            <a className="font-label-sm text-label-sm text-on-surface-variant/40 hover:text-tertiary-fixed-dim transition-colors uppercase cursor-pointer">Node Status</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
