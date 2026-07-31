import React, { useState, useEffect } from 'react';
import { X, Keyboard } from 'lucide-react';
import { useJournal } from '../../context/JournalContext';

export const KeyboardShortcutsModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { goToNextSpread, goToPrevSpread } = useJournal();

  useEffect(() => {
    const handler = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
      if (e.key === '?' || (e.ctrlKey && e.key === '/')) { e.preventDefault(); setIsOpen(p => !p); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const shortcuts = [
    { key: '← / →', desc: 'Previous / Next spread' },
    { key: 'Ctrl+S',  desc: 'Auto-save snapshot' },
    { key: 'Esc',     desc: 'Close modal' },
    { key: '?',       desc: 'Toggle shortcuts' },
  ];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-7 h-7 rounded-[8px] flex items-center justify-center text-xs font-medium transition-colors"
        style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-tertiary)' }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
        title="Keyboard shortcuts (?)"
      >
        ?
      </button>
    );
  }

  return (
    <div className="modal-overlay" onClick={() => setIsOpen(false)}>
      <div className="modal-panel w-full max-w-xs p-5" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Keyboard size={15} style={{ color: 'var(--accent)' }} />
            <h2 className="font-display text-lg" style={{ color: 'var(--text-primary)' }}>Shortcuts</h2>
          </div>
          <button aria-label="Close modal" onClick={() => setIsOpen(false)} className="w-6 h-6 rounded-[6px] flex items-center justify-center"
            style={{ color: 'var(--text-tertiary)' }}>
            <X size={13} />
          </button>
        </div>

        <div className="space-y-1.5">
          {shortcuts.map(s => (
            <div key={s.key} className="flex items-center justify-between py-1.5 px-3 rounded-[8px]"
              style={{ background: 'var(--surface-2)' }}>
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{s.desc}</span>
              <kbd className="px-2 py-0.5 rounded-[6px] text-[11px] font-mono font-medium"
                style={{ background: 'var(--surface-3)', color: 'var(--accent)', border: '1px solid var(--border)' }}>
                {s.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
