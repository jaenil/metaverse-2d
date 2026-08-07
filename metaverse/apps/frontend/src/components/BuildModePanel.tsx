import type { Element } from '../types';

interface BuildModePanelProps {
  availableElements: Element[];
  selectedElement: Element | null;
  setSelectedElement: (el: Element) => void;
}

export function BuildModePanel({ availableElements, selectedElement, setSelectedElement }: BuildModePanelProps) {
  return (
    <>
      <span className="hud-panel-label">Build Mode</span>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px', maxHeight: '150px', overflowY: 'auto' }}>
        {availableElements.map(el => (
          <div
            key={el.id}
            onClick={() => setSelectedElement(el)}
            style={{
              width: '40px', height: '40px', border: selectedElement?.id === el.id ? '2px solid var(--accent)' : '1px solid var(--border)',
              cursor: 'pointer', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <img src={el.imageUrl} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} alt={el.id} />
          </div>
        ))}
      </div>
      {selectedElement ? (
        <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--accent)' }}>Click canvas to place</div>
      ) : (
        <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>Select an element</div>
      )}
    </>
  );
}
