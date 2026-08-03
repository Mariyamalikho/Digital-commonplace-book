import React, { useState } from 'react';
import { Pencil, Plus, Trash2, X, User } from 'lucide-react';
import { useJournal } from '../../context/JournalContext';

export const EditorNotes = ({ pageId, notes = [], accent = '#6c63ff' }) => {
  const { addEditorNoteToPage, deleteEditorNoteFromPage, canAddEditorNotes } = useJournal();
  const [isOpen, setIsOpen] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');

  const accentLight = `${accent}15`;
  const accentMid   = `${accent}30`;

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    addEditorNoteToPage(pageId, newNoteText.trim());
    setNewNoteText('');
  };

  return (
    <div className="relative w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-[8px] text-[11px] font-medium transition-all"
        style={{
          background: 'rgba(0,0,0,0.06)',
          border: '1px solid var(--parchment-line)',
          color: 'var(--ink-mid)',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = accentLight; e.currentTarget.style.color = accent; e.currentTarget.style.borderColor = accentMid; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.06)'; e.currentTarget.style.color = 'var(--ink-mid)'; e.currentTarget.style.borderColor = 'var(--parchment-line)'; }}
        title="Leave a Sticky Note"
      >
        <Pencil size={11} />
        <span>Leave a Note</span>
        {notes.length > 0 && <span style={{ color: accent, fontWeight: 'bold' }}>({notes.length})</span>}
      </button>

      {isOpen && (
        <div
          className="absolute left-0 bottom-full mb-2 w-full max-w-sm rounded-[14px] shadow-2xl z-50 p-4 text-xs"
          style={{
            background: 'var(--surface-1)',
            border: `1px solid ${accentMid}`,
            boxShadow: `0 16px 48px rgba(0,0,0,0.5), 0 0 0 1px ${accentLight}`,
            color: 'var(--text-primary)',
          }}
        >
          <div className="flex items-center justify-between border-b pb-2.5 mb-3" style={{ borderColor: accentLight }}>
            <span className="font-medium text-sm flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
              <Pencil size={14} style={{ color: accent }} />
              <span>Page Notes</span>
            </span>
            <button aria-label="Close modal" onClick={() => setIsOpen(false)} style={{ color: 'var(--text-tertiary)' }} className="hover:text-white transition-colors">
              <X size={14} />
            </button>
          </div>

          <div className="max-h-48 overflow-y-auto space-y-2 mb-3 pr-1">
            {notes.length === 0 ? (
              <p className="text-[11px] italic text-center py-2" style={{ color: 'var(--text-tertiary)' }}>No notes on this page yet.</p>
            ) : (
              notes.map((note) => (
                <div key={note.id} className="p-3 rounded-[10px] relative group" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                  <div className="flex items-center justify-between text-[10px] mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                    <span className="font-medium flex items-center gap-1" style={{ color: accent }}>
                      <User size={10} />
                      <span>{note.authorName}</span>
                    </span>
                    <span>{note.createdAt}</span>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-primary)' }}>{note.text}</p>

                  {canAddEditorNotes && (
                    <button
                      onClick={() => deleteEditorNoteFromPage(pageId, note.id)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                      style={{ color: '#ef4444' }}
                      title="Remove Note"
                    >
                      <Trash2 size={11} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {canAddEditorNotes && (
            <form onSubmit={handleAddNote} className="flex gap-2 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
              <input
                type="text"
                placeholder="Write your note here..."
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                className="flex-grow px-3 py-2 rounded-[8px] text-xs focus:outline-none"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                onFocus={e => e.currentTarget.style.borderColor = accent}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
              />
              <button
                type="submit"
                className="px-3 py-2 rounded-[8px] text-white transition-all font-semibold"
                style={{ background: accent }}
                title="Post Note"
              >
                <Plus size={14} />
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
