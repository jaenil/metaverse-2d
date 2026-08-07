import { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';

interface ChatPanelProps {
  chatMessages: ChatMessage[];
  userId: string | undefined;
  sendChatMessage: (text: string) => void;
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
  chatNotification: { text: string; senderId: string } | null;
  isFading: boolean;
}

export function ChatPanel({
  chatMessages,
  userId,
  sendChatMessage,
  isChatOpen,
  setIsChatOpen,
  chatNotification,
  isFading
}: ChatPanelProps) {
  const [chatInput, setChatInput] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isChatOpen && chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages, isChatOpen]);

  return (
    <>
      {!isChatOpen && chatNotification && (
        <div style={{ pointerEvents: 'auto', marginBottom: '1rem', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.75rem 1rem', borderRadius: '16px', maxWidth: '280px', display: 'flex', flexDirection: 'column', gap: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)', opacity: isFading ? 0 : 1, transition: 'opacity 0.5s ease-out', animation: 'fadeIn 0.3s' }}>
          <span style={{ fontSize: '10px', color: 'var(--accent)', fontWeight: 'bold' }}>{chatNotification.senderId.slice(-4)} says:</span>
          <span style={{ fontSize: '13px', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{chatNotification.text}</span>
        </div>
      )}
      {isChatOpen ? (
        <div style={{ display: 'flex', flexDirection: 'column', height: '350px', width: '100%', pointerEvents: 'auto', background: 'rgba(12, 8, 8, 0.65)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '1rem', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--accent)', fontSize: '16px' }}>forum</span>
              <span className="hud-panel-label" style={{ margin: 0 }}>Space Chat</span>
            </div>
            <button onClick={() => setIsChatOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>remove</span>
            </button>
          </div>

          <div ref={chatContainerRef} className="chat-scrollbar" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '0.75rem', paddingRight: '0.25rem' }}>
            {chatMessages?.map((msg, i) => {
              const isMe = msg.senderId === userId;
              return (
                <div key={i} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isMe ? 'flex-end' : 'flex-start',
                  width: '100%'
                }}>
                  <div style={{
                    fontSize: '9px',
                    color: isMe ? 'var(--accent)' : 'rgba(255,255,255,0.5)',
                    marginBottom: '3px',
                    padding: '0 4px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    {isMe ? 'You' : msg.senderId.slice(-4)}
                  </div>
                  <div style={{
                    background: isMe ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
                    color: isMe ? '#000' : 'var(--text-main)',
                    padding: '0.5rem 0.75rem',
                    borderRadius: isMe ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                    border: isMe ? 'none' : '1px solid rgba(255,255,255,0.1)',
                    maxWidth: '85%',
                    fontSize: '13px',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    wordBreak: 'break-word',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                  }}>
                    {msg.text}
                  </div>
                </div>
              );
            })}
            {(!chatMessages || chatMessages.length === 0) && (
              <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', textAlign: 'center', margin: 'auto', fontStyle: 'italic' }}>
                No messages yet... Be the first to say hi!
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(0,0,0,0.4)', padding: '0.35rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <input
              type="text"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && chatInput.trim()) {
                  sendChatMessage(chatInput.trim());
                  setChatInput('');
                }
              }}
              style={{
                flex: 1,
                padding: '0.25rem 0.75rem',
                fontFamily: 'Inter, system-ui, sans-serif',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                boxShadow: 'none',
                color: 'white'
              }}
              placeholder="Type a message..."
            />
            <button
              onClick={() => {
                if (chatInput.trim()) {
                  sendChatMessage(chatInput.trim());
                  setChatInput('');
                }
              }}
              style={{
                background: 'var(--accent)',
                color: '#000',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'transform 0.2s',
              }}
              onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px', marginLeft: '2px' }}>send</span>
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setIsChatOpen(true)} style={{ pointerEvents: 'auto', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,0.5)', transition: 'transform 0.2s', color: 'var(--accent)' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
          <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>chat</span>
        </button>
      )}
    </>
  );
}
