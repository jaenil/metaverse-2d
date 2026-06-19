import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSpace } from '../api';
import { useAuthStore } from '../store/authStore';
import { useWebSocket } from '../hooks/useWebSocket';
import { useArena } from '../hooks/useArena';
import { ArenaCanvas } from '../components/ArenaCanvas';
import type { SpaceElement } from '../types';
import '../styles/space.css';

export function SpacePage() {
  const { spaceId } = useParams<{ spaceId: string }>();
  const navigate = useNavigate();
  const { token, userId } = useAuthStore();

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [elements, setElements] = useState<SpaceElement[]>([]);
  const [spaceLoading, setSpaceLoading] = useState(true);
  const [spaceError, setSpaceError] = useState('');

  const {
    state: arenaState,
    handleMessage,
    handleOpen,
    handleClose,
    applyOptimisticMove,
  } = useArena(userId ?? '');

  // Fetch space details (dimensions + elements)
  useEffect(() => {
    if (!spaceId) return;
    getSpace(spaceId).then((res) => {
      if (res.status === 200) {
        setDimensions({ width: res.data.space.width, height: res.data.space.height });
        setElements(res.data.elements);
      } else {
        setSpaceError('Space not found.');
      }
      setSpaceLoading(false);
    });
  }, [spaceId]);

  const { sendMove } = useWebSocket({
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

  if (!token) {
    navigate('/');
    return null;
  }

  if (spaceLoading) {
    return <div className="space-loading">Loading space…</div>;
  }

  if (spaceError) {
    return (
      <div className="space-error">
        <p>{spaceError}</p>
        <button onClick={() => navigate('/dashboard')}>Back to dashboard</button>
      </div>
    );
  }

  return (
    <div className="space-root">
      <header className="space-header">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          ← Back
        </button>
        <div className="space-header-info">
          <span className="space-id-label">Space: {spaceId?.slice(-6)}</span>
          <span className={`ws-status ${arenaState.connected ? 'online' : 'offline'}`}>
            {arenaState.connected ? '● Connected' : '○ Reconnecting…'}
          </span>
        </div>
        <div className="space-user-count">
          {arenaState.users.size + (arenaState.myPos ? 1 : 0)} online
        </div>
      </header>

      <div className="space-body">
        <div className="arena-wrap">
          {dimensions.width > 0 && (
            <ArenaCanvas
              width={dimensions.width}
              height={dimensions.height}
              myPos={arenaState.myPos}
              users={arenaState.users}
              elements={elements}
              myUserId={userId ?? ''}
              onMove={handleMove}
              connected={arenaState.connected}
            />
          )}
        </div>

        <aside className="space-sidebar">
          <h3>Controls</h3>
          <div className="controls-grid">
            <kbd>W</kbd><span>Up</span>
            <kbd>S</kbd><span>Down</span>
            <kbd>A</kbd><span>Left</span>
            <kbd>D</kbd><span>Right</span>
          </div>
          <p className="controls-note">Arrow keys also work.</p>

          <h3 style={{ marginTop: '1.5rem' }}>Your position</h3>
          {arenaState.myPos ? (
            <p className="pos-display">
              x: {arenaState.myPos.x}, y: {arenaState.myPos.y}
            </p>
          ) : (
            <p className="pos-display dimmed">Waiting for spawn…</p>
          )}

          <h3 style={{ marginTop: '1.5rem' }}>Users in space</h3>
          <ul className="user-list">
            <li className="user-item me">You ({userId?.slice(-4)})</li>
            {[...arenaState.users.values()].map((u) => (
              <li key={u.userId} className="user-item">
                {u.userId.slice(-4)} — ({u.x}, {u.y})
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}
