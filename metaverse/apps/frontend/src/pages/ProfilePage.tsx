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

export function ProfilePage() {
  const [nickname, setNickname] = useState('User');
  const [sellerName, setSellerName] = useState('User');
  const { clearAuth } = useAuthStore();
  const navigate = useNavigate();

  function handleLogout() {
    clearAuth();
    navigate('/');
  }

  return (
    <>
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 md:px-16 lg:px-24 py-16 md:py-32">
        {/* Header */}
        <div className="mb-20">
          <h1 className="font-headline-lg text-5xl md:text-6xl text-primary mb-4">Profile Settings</h1>
          <p className="font-technical-data text-base text-on-surface-variant uppercase tracking-widest opacity-80">System Configuration // ID: METAVERSE_USER_01</p>
          <div className="technical-line mt-8"></div>
        </div>

        <section className="space-y-50">
          {/* Identity Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-24">
            <div className="space-y-5 group">
              <label className="font-label-sm text-sm text-tertiary-fixed-dim uppercase tracking-wider block transition-colors group-focus-within:text-primary">Nickname</label>
              <input
                className="w-full bg-surface-container-lowest/50 border border-outline-variant/30 rounded-none px-8 py-6 font-technical-data text-lg focus:border-tertiary focus:ring-0 transition-all text-on-surface placeholder:text-on-surface-variant/30 outline-none"
                placeholder="Enter Nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />
            </div>
            <div className="space-y-5 group">
              <label className="font-label-sm text-sm text-tertiary-fixed-dim uppercase tracking-wider block transition-colors group-focus-within:text-primary">Asset Store Seller Nickname</label>
              <input
                className="w-full bg-surface-container-lowest/50 border border-outline-variant/30 rounded-none px-8 py-6 font-technical-data text-lg focus:border-tertiary focus:ring-0 transition-all text-on-surface placeholder:text-on-surface-variant/30 outline-none"
                placeholder="Enter Seller Name"
                value={sellerName}
                onChange={(e) => setSellerName(e.target.value)}
              />
              <p className="text-xs font-technical-data text-on-surface-variant/60 uppercase mt-2">This will be shown when you upload assets to the Asset Store.</p>
            </div>
          </div>

          <div className="technical-line opacity-30"></div>

          {/* Wallet Section */}
          <div className="space-y-10">
            <div className="flex justify-between items-end pb-4 border-b border-outline-variant/10">
              <div>
                <h2 className="font-headline-lg text-4xl md:text-5xl text-primary mb-3">Connect Wallet</h2>
                <p className="font-technical-data text-base text-on-surface-variant uppercase opacity-80">Link personal identities</p>
              </div>
              <a className="font-label-sm text-sm text-tertiary-fixed-dim hover:text-primary transition-colors flex items-center gap-2 cursor-pointer mb-3">
                WALLET_GUIDE.PDF <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </a>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pt-6">
              {WALLETS.map(w => (
                <button key={w} className="flex items-center justify-between px-8 py-6 bg-surface-container-lowest/30 border border-outline-variant/20 hover:border-primary/50 hover:bg-surface-container-low/50 transition-all group">
                  <div className="flex items-center gap-5">
                    <span className="material-symbols-outlined text-primary text-3xl group-hover:scale-110 transition-transform">{WALLET_ICONS[w] || 'account_balance_wallet'}</span>
                    <span className="font-technical-data text-lg uppercase tracking-widest">{w}</span>
                  </div>
                  <span className="material-symbols-outlined text-xl text-on-surface-variant/30 group-hover:translate-x-1 transition-transform">chevron_right</span>
                </button>
              ))}
            </div>
          </div>

          <div className="technical-line opacity-30"></div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-8 pt-16">
            <button className="w-full sm:w-auto px-20 py-5 bg-primary text-on-primary font-label-sm text-base uppercase tracking-widest hover:bg-primary-fixed hover:glow-cyan transition-all duration-300">
              Save Changes
            </button>
            <button className="w-full sm:w-auto px-16 py-5 border border-outline text-on-surface-variant font-label-sm text-base uppercase tracking-widest hover:bg-surface-container-high transition-all">
              Discard
            </button>
          </div>

          <div className="pt-40 pb-20 flex flex-col items-start gap-6">
            <div className="technical-line opacity-10 mb-8"></div>
            <button className="font-label-sm text-base text-error/60 hover:text-error transition-colors flex items-center gap-3 group">
              <span className="material-symbols-outlined text-[24px] group-hover:animate-pulse">warning</span>
              DELETE_ACCOUNT_PERMANENTLY
            </button>
            <p className="font-technical-data text-sm text-on-surface-variant/40 max-w-2xl uppercase">Warning: Account deletion is irreversible. All assets and credentials will be purged from METAVERSE.</p>
          </div>
        </section>
      </div>
    </>
  );
}
