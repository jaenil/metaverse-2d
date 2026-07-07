import { useState } from 'react';

const WALLETS = ['Metamask', 'Kaikas', 'Klip', 'Phantom', 'Petra', 'Martian'];
const WALLET_ICONS: Record<string, string> = {
  Metamask: 'account_balance_wallet',
  Kaikas: 'token',
  Klip: 'grid_view',
  Phantom: 'visibility',
  Petra: 'diamond',
  Martian: 'hub',
};

export function ProfilePage() {
  const [nickname, setNickname] = useState('User');
  const [sellerName, setSellerName] = useState('User');

  return (
    <>
      {/* Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-96 h-96 blueprint-sketch" data-alt="A detailed, hand-drawn wireframe sketch" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAZ1cdg6IaPpw4T6XsIB6Iy9RXHEGCUZgJJj55ifaYOQaCo7Eq13Lx9f8BaHEM0ZEN1w1FFkfk0qz2NUXLhoAcFVKQsIJKc5Xrlt-uDNDNk7gzXZM3vrDr0yy7bQxc3C2mbItZ_DvhsOYkWbSQgRycztHAIGdYT0TUdKcKFEVCrPYmOKNTJVIzw8I-RfwbfUipqK4RBDsu5QOzOKOa4v-eoDwAU38QVRSy1rUfvvBHfVo37sMLQP9uAHykhgWZ57jL5tM28PwXErKI")', opacity: 0.15, mixBlendMode: 'screen', transform: 'translate(3.75781px, 9.95122px)' }}></div>
        <div className="absolute bottom-20 right-10 w-64 h-64 blueprint-sketch rotate-12" data-alt="A collection of floating 3D geometric wireframe cubes" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDyOAOIeUE5EbL4I5tHAt7c91iNvqizGKYZacX3BXJAyQ6sW3IKMonU6l4Wmm3GBp9H32ZiWKMaA_RazxieG4xqMX95e0Lpu9LU28vFR3xpH6Z_3HdaVXOfhOb_zFvFQOZcqRdChCSTpzNmUuLHCOyHizku2hXQO-yiLGx4vfdL3GH5fd_5wZdoJ_6mJtjBAkLsAQWJSy6WM5nTtai-Cx09_0-dtacZaYhFWM-W37B8WRFcGbN7naTpO-8IIWNzdSXEuvWwRiwX5K4")', opacity: 0.05, mixBlendMode: 'screen', transform: 'translate(7.51562px, 19.9024px) rotate(12deg)' }}></div>
        <div className="absolute top-1/2 left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]"></div>
        <div className="absolute top-1/4 right-1/4 w-64 h-64 blueprint-sketch -rotate-12" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDyOAOIeUE5EbL4I5tHAt7c91iNvqizGKYZacX3BXJAyQ6sW3IKMonU6l4Wmm3GBp9H32ZiWKMaA_RazxieG4xqMX95e0Lpu9LU28vFR3xpH6Z_3HdaVXOfhOb_zFvFQOZcqRdChCSTpzNmUuLHCOyHizku2hXQO-yiLGx4vfdL3GH5fd_5wZdoJ_6mJtjBAkLsAQWJSy6WM5nTtai-Cx09_0-dtacZaYhFWM-W37B8WRFcGbN7naTpO-8IIWNzdSXEuvWwRiwX5K4")', opacity: 0.05, mixBlendMode: 'screen', transform: 'translate(11.2734px, 29.8537px) rotate(-12deg)' }}></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-margin-mobile md:px-margin-desktop py-12 md:py-24">
        {/* Header */}
        <div className="mb-12">
          <h1 className="font-headline-lg text-headline-lg text-primary mb-2">Profile Settings</h1>
          <p className="font-technical-data text-technical-data text-on-surface-variant uppercase tracking-widest">System Configuration // ID: METAVERSE_USER_01</p>
          <div className="h-px w-full mt-6 opacity-30 bg-gradient-to-r from-transparent via-outline-variant to-transparent"></div>
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
              <div className="flex justify-between items-end">
                <label className="font-label-sm text-label-sm text-tertiary-fixed-dim uppercase tracking-wider block transition-colors group-focus-within:text-primary">Asset Store Seller Nickname</label>
              </div>
              <input
                className="w-full bg-surface-container-lowest/50 border border-outline-variant/30 rounded-none px-4 py-3 font-technical-data text-technical-data focus:border-tertiary focus:ring-0 transition-all text-on-surface placeholder:text-on-surface-variant/30 outline-none"
                placeholder="Enter Seller Name"
                value={sellerName}
                onChange={(e) => setSellerName(e.target.value)}
              />
              <p className="text-[10px] font-technical-data text-on-surface-variant/60 uppercase">This will be shown when you upload assets to the Asset Store.</p>
            </div>
          </div>

          <div className="h-px w-full opacity-30 bg-gradient-to-r from-transparent via-outline-variant to-transparent"></div>

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
              {/* Wallet Items */}
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

          <div className="h-px w-full opacity-30 bg-gradient-to-r from-transparent via-outline-variant to-transparent"></div>

          {/* Actions */}
          <div className="flex flex-col md:flex-row items-center gap-6 pt-4">
            <button className="w-full md:w-auto px-12 py-3 bg-primary text-on-primary font-label-sm text-label-sm uppercase tracking-widest hover:bg-primary-fixed hover:shadow-[0_0_15px_rgba(76,215,246,0.3)] transition-all duration-300">
              Save Changes
            </button>
            <button className="w-full md:w-auto px-8 py-3 border border-outline text-on-surface-variant font-label-sm text-label-sm uppercase tracking-widest hover:bg-surface-container-high transition-all">
              Discard
            </button>
          </div>

          <div className="pt-24 pb-12 flex flex-col items-start gap-4">
            <div className="h-px w-full opacity-10 mb-4 bg-gradient-to-r from-transparent via-outline-variant to-transparent"></div>
            <button className="font-label-sm text-label-sm text-error/60 hover:text-error transition-colors flex items-center gap-2 group">
              <span className="material-symbols-outlined text-[16px] group-hover:animate-pulse">warning</span>
              DELETE_ACCOUNT_PERMANENTLY
            </button>
            <p className="font-technical-data text-[10px] text-on-surface-variant/40 max-w-sm uppercase">Warning: Account deletion is irreversible. All assets and credentials will be purged from METAVERSE.</p>
          </div>
        </section>
      </div>
    </>
  );
}

