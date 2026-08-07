import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/space.css';

interface SettingsModalProps {
  spaceId: string | undefined;
  initialWeather: 'none' | 'rain' | 'snow';
  initialTimeOfDay: 'day' | 'night';
  onClose: () => void;
  onSave: (weather: 'none' | 'rain' | 'snow', timeOfDay: 'day' | 'night') => void;
}

export function SettingsModal({ spaceId, initialWeather, initialTimeOfDay, onClose, onSave }: SettingsModalProps) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [draftWeather, setDraftWeather] = useState(initialWeather);
  const [draftTimeOfDay, setDraftTimeOfDay] = useState(initialTimeOfDay);

  const handleCopy = () => {
    if (!spaceId) return;
    navigator.clipboard.writeText(spaceId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'auto' }}>
      <div className="hud-panel" style={{ position: 'relative', width: '350px', padding: '1.5rem', gap: '1.5rem', boxShadow: '0 8px 32px rgba(0,0,0,0.8)' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="hud-panel-label" style={{ margin: 0, fontSize: '14px', color: 'var(--accent)' }}>SPACE SETTINGS</span>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>

        {/* Space ID Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span className="hud-panel-label" style={{ marginBottom: 0 }}>Invite Link / Space ID</span>
          <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(0,0,0,0.4)', padding: '4px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <input 
              type="text" 
              readOnly 
              value={spaceId || ''} 
              style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--text-main)', padding: '0.25rem 0.5rem', outline: 'none', fontSize: '12px', fontFamily: 'var(--font-mono)' }} 
            />
            <button
              onClick={handleCopy}
              style={{ padding: '0.4rem 1rem', background: copied ? 'var(--online)' : 'var(--accent)', border: 'none', color: '#000', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px', borderRadius: '6px', fontFamily: 'var(--font-mono)', letterSpacing: '0.5px' }}>
              {copied ? 'COPIED!' : 'COPY'}
            </button>
          </div>
        </div>

        <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)' }} />

        {/* Environment Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Time of Day */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span className="hud-panel-label" style={{ marginBottom: 0 }}>Time of Day</span>
            <div style={{ display: 'flex', gap: '4px', background: 'rgba(0,0,0,0.4)', padding: '4px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
              {['day', 'night'].map((time) => (
                <button 
                  key={time}
                  onClick={() => setDraftTimeOfDay(time as 'day' | 'night')} 
                  style={{ 
                    flex: 1, padding: '0.4rem', border: 'none', borderRadius: '4px', cursor: 'pointer', 
                    background: draftTimeOfDay === time ? 'var(--accent)' : 'transparent', 
                    color: draftTimeOfDay === time ? '#000' : 'rgba(255,255,255,0.7)', 
                    fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' 
                  }}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          {/* Weather */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span className="hud-panel-label" style={{ marginBottom: 0 }}>Weather</span>
            <div style={{ display: 'flex', gap: '4px', background: 'rgba(0,0,0,0.4)', padding: '4px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
              {[
                { id: 'none', label: 'Clear' },
                { id: 'rain', label: 'Rain' },
                { id: 'snow', label: 'Snow' }
              ].map((w) => (
                <button 
                  key={w.id}
                  onClick={() => setDraftWeather(w.id as 'none' | 'rain' | 'snow')} 
                  style={{ 
                    flex: 1, padding: '0.4rem', border: 'none', borderRadius: '4px', cursor: 'pointer', 
                    background: draftWeather === w.id ? 'var(--accent)' : 'transparent', 
                    color: draftWeather === w.id ? '#000' : 'rgba(255,255,255,0.7)', 
                    fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' 
                  }}
                >
                  {w.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', marginTop: '0.5rem' }} />

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button
            onClick={() => {
              onSave(draftWeather, draftTimeOfDay);
              onClose();
            }}
            style={{ padding: '0.75rem', background: 'var(--accent)', border: 'none', color: '#000', cursor: 'pointer', fontWeight: 'bold', borderRadius: '8px', fontFamily: 'var(--font-mono)', fontSize: '13px', letterSpacing: '1px' }}>
            SAVE SETTINGS
          </button>

          <button 
            onClick={() => navigate('/dashboard')} 
            style={{ padding: '0.75rem', background: 'rgba(217, 56, 30, 0.1)', border: '1px solid var(--danger)', color: 'var(--danger)', cursor: 'pointer', fontWeight: 'bold', borderRadius: '8px', fontFamily: 'var(--font-mono)', fontSize: '13px', letterSpacing: '1px' }}>
            LEAVE SPACE
          </button>
        </div>

      </div>
    </div>
  );
}
