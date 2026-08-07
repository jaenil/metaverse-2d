import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useWebSocket } from '../hooks/useWebSocket';
import { useArena } from '../hooks/useArena';
import { useSpaceData } from '../hooks/useSpaceData';
import { useBuildMode } from '../hooks/useBuildMode';
import { ArenaCanvas } from '../components/ArenaCanvas';
import { HUD } from '../components/HUD';
import { SettingsModal } from '../components/SettingsModal';
import { BuildModePanel } from '../components/BuildModePanel';
import { ChatPanel } from '../components/ChatPanel';
import '../styles/space.css';

export function SpacePage() {
  const { spaceId } = useParams<{ spaceId: string }>();
  const navigate = useNavigate();
  const { token, userId } = useAuthStore();

  const [showEmotes, setShowEmotes] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatNotification, setChatNotification] = useState<{ text: string, senderId: string } | null>(null);
  const [isFading, setIsFading] = useState(false);

  const {
    state: arenaState,
    handleMessage,
    handleOpen,
    handleClose,
    applyOptimisticMove,
    setMyEmote,
    setElements
  } = useArena(userId ?? '');

  const { weather = 'none', timeOfDay = 'day' } = arenaState;

  const {
    dimensions,
    thumbnail,
    spaceError,
    worldReady,
    loadingProgress
  } = useSpaceData(spaceId, userId ?? undefined, arenaState.myPos, setElements);

  const { sendMove, sendEmote, sendSettingsUpdate, sendElementAdded, sendElementDeleted, sendChatMessage } = useWebSocket({
    spaceId: spaceId ?? '',
    token: token ?? '',
    onMessage: handleMessage,
    onOpen: handleOpen,
    onClose: handleClose,
  });

  const {
    buildMode,
    toggleBuildMode,
    availableElements,
    selectedElement,
    setSelectedElement,
    placementError,
    handleCanvasClick: handleBuildClick
  } = useBuildMode(spaceId, dimensions, arenaState.elements, sendElementAdded, sendElementDeleted);

  const handleMove = useCallback(
    (x: number, y: number) => {
      applyOptimisticMove(x, y);
      sendMove(x, y);
    },
    [applyOptimisticMove, sendMove]
  );

  // Chat notifications
  useEffect(() => {
    if (arenaState.chatMessages && arenaState.chatMessages.length > 0) {
      const latest = arenaState.chatMessages[arenaState.chatMessages.length - 1];
      if (!isChatOpen) {
        setChatNotification(latest);
        setIsFading(false);
        const fadeTimer = setTimeout(() => setIsFading(true), 3000);
        const removeTimer = setTimeout(() => {
          setChatNotification(null);
          setIsFading(false);
        }, 3500);
        return () => { clearTimeout(fadeTimer); clearTimeout(removeTimer); };
      }
    }
  }, [arenaState.chatMessages, isChatOpen]);

  if (!token) {
    navigate('/');
    return null;
  }

  if (spaceError) {
    return (
      <div className="space-loading flex flex-col items-center justify-center h-screen bg-[var(--bg)]">
        <div className="text-2xl text-[var(--danger)] font-semibold">{spaceError}</div>
        <button onClick={() => navigate('/dashboard')} className="mt-8 p-4 bg-[var(--accent)] border-none text-black cursor-pointer rounded-[var(--radius-sm)]">
          RETURN TO HUB
        </button>
      </div>
    );
  }

  return (
    <div className="space-root">
      {/* Loading Overlay */}
      {!worldReady && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1000,
          display: 'flex', flexDirection: 'column', gap: '1.5rem',
          alignItems: 'center', justifyContent: 'center',
          background: 'var(--bg)'
        }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 600, letterSpacing: '2px' }}>
            LINKING TO SERVER...
          </div>
          <div style={{ width: '300px', height: '6px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{
              width: `${loadingProgress}%`, height: '100%',
              background: 'var(--accent)', transition: 'width 0.1s linear',
              boxShadow: '0 0 10px var(--accent)'
            }} />
          </div>
          <div style={{ fontSize: '12px', color: 'var(--accent)', fontFamily: 'var(--font-ui)' }}>
            {loadingProgress}%
          </div>
        </div>
      )}

      {/* HUD Layer */}
      <HUD
        spaceId={spaceId}
        placementError={placementError}
        dimensions={dimensions}
        thumbnail={thumbnail}
        arenaState={arenaState}
        userId={userId ?? undefined}
        buildMode={buildMode}
        toggleBuildMode={toggleBuildMode}
        showEmotes={showEmotes}
        setShowEmotes={setShowEmotes}
        openSettings={() => setShowSettings(true)}
        navigate={navigate}
        sendEmote={sendEmote}
        setMyEmote={setMyEmote}
        bottomRightContent={
          buildMode ? (
            <BuildModePanel availableElements={availableElements} selectedElement={selectedElement} setSelectedElement={setSelectedElement} />
          ) : (
            <ChatPanel
              chatMessages={arenaState.chatMessages}
              userId={userId ?? undefined}
              sendChatMessage={sendChatMessage}
              isChatOpen={isChatOpen}
              setIsChatOpen={setIsChatOpen}
              chatNotification={chatNotification}
              isFading={isFading}
            />
          )
        }
      />

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          spaceId={spaceId}
          initialWeather={weather}
          initialTimeOfDay={timeOfDay}
          onClose={() => setShowSettings(false)}
          onSave={sendSettingsUpdate}
        />
      )}

      {/* Full-Screen Game Canvas */}
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
            elements={arenaState.elements}
            myUserId={userId ?? ''}
            onMove={handleMove}
            onCanvasClick={handleBuildClick}
            connected={arenaState.connected}
            weather={weather}
            timeOfDay={timeOfDay}
          />
        )}
      </div>
    </div>
  );
}
