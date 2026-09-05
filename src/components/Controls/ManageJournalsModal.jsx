import React, { useState } from 'react';
import { BookOpen, Plus, Trash2, X } from 'lucide-react';
import { useJournal } from '../../context/JournalContext';
import { useAuth } from '../../context/AuthContext';

export const ManageJournalsModal = ({ isOpen, onClose }) => {
  const { userBooks, currentBook, switchBook, createNewBook, deleteBook, role } = useJournal();
  const { user } = useAuth();
  const [newTitle, setNewTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  if (!isOpen) return null;

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setIsCreating(true);
    try {
      await createNewBook(newTitle.trim());
      setNewTitle('');
      onClose(); // Optional: close modal after creating to drop them right into the new book
    } catch (error) {
      alert(error.message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (e, book) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete "${book.title}"? This cannot be undone.`)) {
      try {
        await deleteBook(book.id);
      } catch (error) {
        alert(error.message);
      }
    }
  };

  const handleSwitch = (bookId) => {
    switchBook(bookId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div 
        className="relative w-full max-w-md rounded-[20px] shadow-2xl overflow-hidden animate-fade-in-up"
        style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-xl font-serifTitle" style={{ color: 'var(--text-primary)' }}>Manage Journals</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/5 transition-colors"
            style={{ color: 'var(--text-tertiary)' }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-2 max-h-[300px] overflow-y-auto mb-6 pr-2 custom-scrollbar">
            {userBooks.map(book => {
              const isCurrent = currentBook?.id === book.id;
              const isOwner = book.ownerId === user?.id;
              return (
                <div 
                  key={book.id}
                  onClick={() => handleSwitch(book.id)}
                  className={`flex items-center justify-between p-3 rounded-[12px] cursor-pointer transition-all ${isCurrent ? 'ring-1' : 'hover:bg-white/5'}`}
                  style={{ 
                    background: isCurrent ? 'var(--surface-2)' : 'transparent',
                    ringColor: isCurrent ? 'var(--accent)' : 'transparent'
                  }}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <BookOpen size={16} style={{ color: isCurrent ? 'var(--accent)' : 'var(--text-secondary)' }} />
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                        {book.title}
                      </span>
                      <span className="text-xs truncate" style={{ color: 'var(--text-tertiary)' }}>
                        {isOwner ? 'Owner' : 'Shared'}
                      </span>
                    </div>
                  </div>
                  
                  {isOwner && userBooks.length > 1 && (
                    <button 
                      onClick={(e) => handleDelete(e, book)}
                      className="p-2 rounded-md hover:bg-red-500/10 transition-colors"
                      style={{ color: 'var(--text-tertiary)' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <form onSubmit={handleCreate} className="flex gap-2">
            <input
              type="text"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="New journal title..."
              className="flex-1 px-4 py-2 text-sm rounded-[10px] outline-none transition-all"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              disabled={isCreating}
            />
            <button
              type="submit"
              disabled={!newTitle.trim() || isCreating}
              className="px-4 py-2 rounded-[10px] text-sm font-medium flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'var(--accent)', color: '#fff' }}
            >
              <Plus size={16} />
              {isCreating ? 'Creating...' : 'Create'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
