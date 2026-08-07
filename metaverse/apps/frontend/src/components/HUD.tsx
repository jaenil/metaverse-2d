import { MiniMap } from './MiniMap';
import type { ArenaUser, SpaceElement, ChatMessage } from '../types';

interface HUDProps {
  spaceId?: string;
  placementError: string | null;
  dimensions: { width: number; height: number };
  thumbnail: string | null;
  arenaState: {
    myPos: { x: number; y: number } | null;
    users: Map<string, ArenaUser>;
    elements: SpaceElement[];
    chatMessages?: ChatMessage[];
  };
  userId?: string;
  buildMode: boolean;
  toggleBuildMode: () => void;
  showEmotes: boolean;
  setShowEmotes: (show: boolean) => void;
  openSettings: () => void;
  navigate: (path: string) => void;
  sendEmote: (emote: string) => void;
  setMyEmote: (emote: string) => void;
  bottomRightContent: React.ReactNode;
}

export function HUD({
  spaceId,
  placementError,
  dimensions,
  thumbnail,
  arenaState,
  userId,
  buildMode,
  toggleBuildMode,
  showEmotes,
  setShowEmotes,
  openSettings,
  navigate,
  sendEmote,
  setMyEmote,
  bottomRightContent
}: HUDProps) {
  const onlineCount = arenaState.users.size + 1;

  return (
    <div className="hud-overlay pointer-events-none">
      {/* Top Left: Title */}
      <div className="hud-top-left">
        <div className="space-title">
          <span className="space-title-accent">ZONE //</span> {spaceId?.slice(-6).toUpperCase()}
        </div>
      </div>

      {/* Placement Error Banner */}
      {placementError && (
        <div className="absolute top-5 left-1/2 -translate-x-1/2 bg-black/85 border border-[#d9381e] text-[#d9381e] px-5 py-2 font-[var(--font-retro)] text-xs tracking-wider z-[200] whitespace-nowrap pointer-events-none">
          ⚠ {placementError}
        </div>
      )}





      {/* Top Right: Users online & MiniMap */}
      <div className="hud-top-right flex flex-col items-end gap-4 pointer-events-auto">
        <div className="hud-pill">
          <span className="hud-ws-pip online" />
          {onlineCount} ONLINE
        </div>
        {dimensions.width > 0 && (
          <MiniMap
            width={dimensions.width}
            height={dimensions.height}
            thumbnail={thumbnail}
            elements={arenaState.elements}
            users={arenaState.users}
            myPos={arenaState.myPos}
            myUserId={userId ?? ''}
          />
        )}
      </div>

      {/* Bottom Left: Players List & Controls */}
      <div className="hud-bottom-left pointer-events-auto">
        <div className="hud-panel relative" style={{ position: 'relative' }}>
          <span className="hud-panel-label">Players in space</span>
          <div className="player-list">
            <div className="player-item me">
              <span className="player-pip" />
              <span className="player-name">You ({userId?.slice(-4)})</span>
              {arenaState.myPos && (
                <span className="player-pos">({arenaState.myPos.x},{arenaState.myPos.y})</span>
              )}
            </div>
            {[...arenaState.users.values()].map((u) => (
              <div key={u.userId} className="player-item">
                <span className="player-pip" />
                <span className="player-name">{u.userId.slice(-4)}</span>
                <span className="player-pos">({u.x},{u.y})</span>
              </div>
            ))}
          </div>
        </div>
        {!buildMode && (
          <div className="hud-panel relative" style={{ position: 'relative' }}>
            <div className="pos-readout">
              <div className="pos-coord">
                <span className="pos-coord-axis">X</span>
                <span className="pos-coord-val">{arenaState.myPos?.x ?? '—'}</span>
              </div>
              <div className="pos-coord">
                <span className="pos-coord-axis">Y</span>
                <span className="pos-coord-val">{arenaState.myPos?.y ?? '—'}</span>
              </div>
            </div>
            <div className="h-[1px] bg-[var(--border)] my-4" />
            <span className="hud-panel-label">Movement</span>
            <div className="controls-key-grid">
              <div />
              <div className="key-cap">W</div>
              <div />
              <div className="key-cap">A</div>
              <div className="key-cap">S</div>
              <div className="key-cap">D</div>
              <div className="key-cap wide">ARROW KEYS ALSO WORK</div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Center: Action Bar */}
      <div className="hud-action-bar pointer-events-auto">
        <div className="action-slot clickable" onClick={() => navigate('/dashboard')}>
          <span className="slot-icon">←</span>
          <span className="slot-label">Leave</span>
        </div>
        <div className={`action-slot clickable ${buildMode ? 'bg-[rgba(var(--accent-raw),0.2)]' : ''}`} onClick={toggleBuildMode}>
          <span className="slot-icon">◈</span>
          <span className="slot-label">Build</span>
        </div>
        <div className="relative">
          <div className="action-slot clickable" onClick={() => setShowEmotes(!showEmotes)}>
            <span className="slot-icon">◉</span>
            <span className="slot-label">Emote</span>
          </div>
          {showEmotes && (
            <div className="absolute bottom-[110%] left-1/2 -translate-x-1/2 bg-black/80 p-2 rounded-lg flex gap-2 border border-[var(--border)] pointer-events-auto">
              {['👋', '😂', '❤️', '❓'].map(emoji => (
                <div
                  key={emoji}
                  className="text-2xl cursor-pointer p-1 transition-transform hover:scale-125"
                  onClick={() => {
                    sendEmote(emoji);
                    setMyEmote(emoji);
                    setShowEmotes(false);
                  }}
                >
                  {emoji}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="action-slot clickable" onClick={openSettings}>
          <span className="slot-icon">⚙</span>
          <span className="slot-label">Settings</span>
        </div>
      </div>

      {/* Bottom Right Container */}
      <div style={{ position: 'absolute', bottom: '20px', right: '20px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', pointerEvents: 'none', transition: 'width 0.3s', width: buildMode || arenaState.chatMessages ? '300px' : 'auto' }}>
        {bottomRightContent}
      </div>

      <div className="hud-vignette pointer-events-none" />
    </div>
  );
}
