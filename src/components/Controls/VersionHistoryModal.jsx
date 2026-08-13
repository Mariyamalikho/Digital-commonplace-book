import React, { useState, useEffect } from 'react';
import { X, History, RotateCcw, Clock } from 'lucide-react';
import { useJournal } from '../../context/JournalContext';
import { versionService } from '../../services/versionService';

export const VersionHistoryModal = () => {
  const { currentBook, syncBookState, canWrite } = useJournal();
  const [isOpen, setIsOpen] = useState(false);
  const [snapshots, setSnapshots] = useState([]);
  const [restored, setRestored] = useState('');

  useEffect(() => {
    if (isOpen && currentBook) {
      setSnapshots(versionService.getSnapshots(currentBook.id));
    }
  }, [isOpen, currentBook]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] text-xs transition-colors"
        style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
      >
        <History size={11} />
        <span className="hidden md:block">History</span>
      </button>
    );
  }

  const handleRestore = (snap) => {
    try {
      const book = versionService.restoreSnapshot(snap);
      syncBookState(book, false);
      setRestored(`Restored snapshot from ${new Date(snap.timestamp).toLocaleTimeString()}`);
      setTimeout(() => setRestored(''), 3000);
    } catch (err) {
      alert('Restore failed: ' + err.message);
    }
  };

  return (
    <div className="modal-overlay" role="button" tabIndex={0} onClick={() => setIsOpen(false)}>
      <div className="modal-panel w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-display font-normal text-xl" style={{ color: 'var(--text-primary)' }}>Version History</h2>
          <button aria-label="Close modal" onClick={() => setIsOpen(false)} className="w-7 h-7 rounded-[8px] flex items-center justify-center transition-colors"
            style={{ color: 'var(--text-tertiary)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-3)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <X size={15} />
          </button>
        </div>
        <p className="text-xs mb-5" style={{ color: 'var(--text-tertiary)' }}>Restore a previous version of your journal</p>

        {restored && (
          <div className="flex items-center gap-2 p-3 rounded-[10px] mb-4 text-xs"
            style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', color: '#34d399' }}>
            ✓ {restored}
          </div>
        )}

        <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
          {snapshots.length === 0 ? (
            <div className="flex flex-col items-center py-10 gap-3">
              <History size={24} style={{ color: 'var(--text-disabled)' }} />
              <p className="text-xs text-center" style={{ color: 'var(--text-tertiary)' }}>
                No snapshots yet. They'll be created automatically as you edit.
              </p>
            </div>
          ) : (
            snapshots.map(snap => (
              <div
                key={snap.id}
                className="flex items-center gap-3 p-3 rounded-[10px] transition-all"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
              >
                <div className="w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0"
                  style={{ background: 'var(--surface-3)' }}>
                  <Clock size={13} style={{ color: 'var(--text-tertiary)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                    {new Date(snap.timestamp).toLocaleString()}
                  </p>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                    {snap.spreadCount} spreads
                  </p>
                </div>
                {canWrite && (
                  <button
                    onClick={() => handleRestore(snap)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-[8px] text-xs font-medium transition-all shrink-0"
                    style={{ background: 'var(--accent-light)', color: 'var(--accent)', border: '1px solid var(--border)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--accent)' && (e.currentTarget.style.color = '#fff')}
                  >
                    <RotateCcw size={11} />
                    Restore
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
