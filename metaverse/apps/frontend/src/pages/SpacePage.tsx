import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSpace, getElements, addSpaceElement, deleteSpaceElement } from '../api';
import { useAuthStore } from '../store/authStore';
import { useWebSocket } from '../hooks/useWebSocket';
import { useArena } from '../hooks/useArena';
import { ArenaCanvas } from '../components/ArenaCanvas';
import { MiniMap } from '../components/MiniMap';
import type { SpaceElement, Element } from '../types';
import '../styles/space.css';

const ERASER_ELEMENT = { id: 'ERASER', imageUrl: 'https://img.icons8.com/color/48/eraser.png', width: 1, height: 1, static: false } as Element;

export function SpacePage() {
  const { spaceId } = useParams<{ spaceId: string }>();
  const navigate = useNavigate();
  const { token, userId } = useAuthStore();

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [elements, setElements] = useState<SpaceElement[]>([]);
  const [spaceLoading, setSpaceLoading] = useState(true);
  const [spaceError, setSpaceError] = useState('');

  const [buildMode, setBuildMode] = useState(false);
  const [availableElements, setAvailableElements] = useState<Element[]>([]);
  const [selectedElement, setSelectedElement] = useState<Element | null>(null);
  
  const [showEmotes, setShowEmotes] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const {
    state: arenaState,
    handleMessage,
    handleOpen,
    handleClose,
    applyOptimisticMove,
    setMyEmote
  } = useArena(userId ?? '');

  // Fetch space details (dimensions + elements)
  useEffect(() => {
    if (!spaceId) return;
    getSpace(spaceId).then((res) => {
      if (res.data.space) {
        setDimensions({
          width: res.data.space.width,
          height: res.data.space.height,
        });
        setThumbnail(res.data.space.thumbnail || null);
        setElements(res.data.elements.map((e: any) => ({
          id: e.id,
          elementId: e.element.id,
          x: e.x,
          y: e.y,
          element: e.element,
        })));
      }
      setSpaceLoading(false);
    }).catch(err => {
      console.error(err);
      setSpaceError('Failed to load space data.');
      setSpaceLoading(false);
    });
  }, [spaceId]);

  const { sendMove, sendEmote } = useWebSocket({
    spaceId: spaceId ?? '',
    token: token ?? '',
    onMessage: handleMessage,
    onOpen: handleOpen,
    onClose: handleClose,
  });

  const handleMove = useCallback(
    (x: number, y: number) => {
      // Optimistic update — server corrects if out of bounds
      applyOptimisticMove(x, y);
      sendMove(x, y);
    },
    [applyOptimisticMove, sendMove]
  );

  const toggleBuildMode = async () => {
    if (!buildMode && availableElements.length === 0) {
      try {
        const res = await getElements();
        setAvailableElements([ERASER_ELEMENT, ...res.data.elements]);
      } catch (e) {
        console.error("Failed to load elements", e);
      }
    }
    setBuildMode(!buildMode);
    setSelectedElement(null);
  };

  const handleCanvasClick = async (x: number, y: number) => {
    if (!buildMode || !selectedElement || !spaceId) return;
    
    if (selectedElement.id === 'ERASER') {
      const target = elements.find(el => {
        const ew = el.element?.width ?? 1;
        const eh = el.element?.height ?? 1;
        return x >= el.x && x < el.x + ew && y >= el.y && y < el.y + eh;
      });
      if (target) {
        try {
          const res = await deleteSpaceElement(target.id, spaceId);
          if (res.status === 200) {
            setElements(prev => prev.filter(e => e.id !== target.id));
          }
        } catch (e) { console.error("Failed to delete element", e); }
      }
      return;
    }

    try {
      const res = await addSpaceElement({ elementId: selectedElement.id, spaceId, x, y });
      if (res.status === 200) {
        setElements((prev) => [
          ...prev, 
          {
            id: res.data.element.id,
            elementId: selectedElement.id,
            x, y,
            element: selectedElement
          }
        ]);
      }
    } catch (e) {
      console.error("Failed to place element", e);
    }
  };

  if (!token) {
    navigate('/');
    return null;
  }

  if (spaceLoading) {
    return (
      <div className="space-loading">
        <div className="glitch-text" data-text="INITIALIZING...">INITIALIZING...</div>
      </div>
    );
  }

  if (spaceError) {
    return (
      <div className="space-loading">
        <div className="glitch-text" data-text={spaceError}>{spaceError}</div>
        <button onClick={() => navigate('/dashboard')} style={{ marginTop: '2rem', padding: '1rem', background: 'var(--accent)', border: 'none', color: '#000', cursor: 'pointer' }}>
          RETURN TO HUB
        </button>
      </div>
    );
  }

  const onlineCount = arenaState.users.size + 1;

  return (
    <div className="space-root">
      {/* HUD Layer */}
      <div className="hud-overlay">
        
        {/* Top Left: Title & Actions */}
        <div className="hud-top-left">
          <div className="space-title">
            <span className="space-title-accent">ZONE //</span> {spaceId?.slice(-6).toUpperCase()}
          </div>
        </div>

        {/* Bottom Center: Action Bar */}
        <div className="hud-action-bar">
          <div className="action-slot clickable glitch-hover" data-text="Leave" onClick={() => navigate('/dashboard')}>
            <span className="slot-icon">←</span>
            <span className="slot-label">Leave</span>
          </div>
          <div className="action-slot clickable glitch-hover" data-text="Build" onClick={toggleBuildMode} style={{ background: buildMode ? 'rgba(var(--accent-raw), 0.2)' : '' }}>
            <span className="slot-icon">◈</span>
            <span className="slot-label">Build</span>
          </div>
          <div style={{ position: 'relative' }}>
            <div className="action-slot clickable glitch-hover" data-text="Emote" onClick={() => setShowEmotes(!showEmotes)}>
              <span className="slot-icon">◉</span>
              <span className="slot-label">Emote</span>
            </div>
            {showEmotes && (
              <div style={{ position: 'absolute', bottom: '110%', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.8)', padding: '0.5rem', borderRadius: '8px', display: 'flex', gap: '0.5rem', border: '1px solid var(--border)', pointerEvents: 'auto' }}>
                {['👋', '😂', '❤️', '❓'].map(emoji => (
                  <div 
                    key={emoji} 
                    style={{ fontSize: '1.5rem', cursor: 'pointer', padding: '0.2rem', transition: 'transform 0.1s' }}
                    onMouseOver={e => e.currentTarget.style.transform = 'scale(1.2)'}
                    onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
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
          <div className="action-slot clickable glitch-hover" data-text="Settings" onClick={() => setShowSettings(true)}>
            <span className="slot-icon">⚙</span>
            <span className="slot-label">Settings</span>
          </div>
        </div>

        {/* Settings Modal */}
        {showSettings && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'auto' }}>
            <div style={{ background: '#111', border: '1px solid var(--border)', padding: '2rem', width: '350px', display: 'flex', flexDirection: 'column', gap: '1.5rem', boxShadow: '0 0 20px rgba(var(--accent-raw), 0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0, color: 'var(--text-bright)' }}>SETTINGS</h2>
                <button onClick={() => setShowSettings(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Invite Link / Space ID</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input type="text" readOnly value={spaceId} style={{ flex: 1, padding: '0.5rem', background: '#000', border: '1px solid var(--border)', color: 'var(--text-main)' }} />
                  <button 
                    onClick={() => navigator.clipboard.writeText(spaceId!)}
                    style={{ padding: '0.5rem 1rem', background: 'var(--accent)', border: 'none', color: '#000', cursor: 'pointer', fontWeight: 'bold' }}>
                    COPY
                  </button>
                </div>
              </div>

              <div style={{ height: '1px', background: 'var(--border)' }} />

              <button onClick={() => navigate('/dashboard')} style={{ padding: '0.75rem', background: 'transparent', border: '1px solid #d9381e', color: '#d9381e', cursor: 'pointer', fontWeight: 'bold' }}>
                LEAVE SPACE
              </button>
            </div>
          </div>
        )}

        {/* Top Right: Users online & MiniMap */}
        <div className="hud-top-right" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1rem' }}>
          <div className="hud-pill">
            <span className="hud-ws-pip online" />
            {onlineCount} ONLINE
          </div>
          {dimensions.width > 0 && (
            <MiniMap 
              width={dimensions.width}
              height={dimensions.height}
              thumbnail={thumbnail}
              elements={elements}
              users={arenaState.users}
              myPos={arenaState.myPos}
              myUserId={userId ?? ''}
            />
          )}
        </div>

        {/* Bottom Left: Players List */}
        <div className="hud-panel hud-bottom-left">
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

        {/* Bottom Right: Controls & Position */}
        <div className="hud-panel hud-bottom-right">
          {buildMode ? (
            <>
              <span className="hud-panel-label">Build Mode</span>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem', maxHeight: '150px', overflowY: 'auto' }}>
                {availableElements.map(el => (
                  <div 
                    key={el.id} 
                    onClick={() => setSelectedElement(el)}
                    style={{ 
                      width: 40, height: 40, 
                      border: selectedElement?.id === el.id ? '2px solid var(--accent)' : '1px solid var(--border)',
                      cursor: 'pointer', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                    <img src={el.imageUrl} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  </div>
                ))}
              </div>
              {selectedElement ? <div style={{marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--accent)'}}>Click canvas to place</div> : <div style={{marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)'}}>Select an element</div>}
            </>
          ) : (
            <>
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
              <div style={{ height: '1px', background: 'var(--border)', margin: '1rem 0' }} />
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
            </>
          )}
        </div>

        {/* Ambient Vignette Overlay */}
        <div className="hud-vignette" />
      </div>

      {/* ── Full-Screen Game Canvas ─────────────────────────────────────── */}
      <div className="arena-fullscreen-wrap">
        {dimensions.width > 0 && (
          <ArenaCanvas
            width={dimensions.width}
            height={dimensions.height}
            thumbnail={thumbnail}
            myPos={arenaState.myPos}
            myAvatarUrl={arenaState.myAvatarUrl}
            myEmote={arenaState.myEmote}
            myEmoteExpiresAt={arenaState.myEmoteExpiresAt}
            users={arenaState.users}
            elements={elements}
            myUserId={userId ?? ''}
            onMove={handleMove}
            onCanvasClick={handleCanvasClick}
            connected={arenaState.connected}
          />
        )}
      </div>

    </div>
  );
}
