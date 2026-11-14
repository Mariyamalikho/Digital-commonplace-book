import React, { useState, Suspense, lazy } from 'react';
import { BookOpen, ChevronDown, LogOut, Settings, Plus, Scissors } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useJournal } from '../context/JournalContext';

const ManageJournalsModal = lazy(() => import('./Controls/ManageJournalsModal').then(m => ({ default: m.ManageJournalsModal })));

export const Navbar = () => {
  const { user, setAccountModalOpen, logout } = useAuth();
  const {
    currentBook,
    userBooks,
    switchBook,
    addSpread,
    tearCurrentSpread,
    canWrite,
    currentSpreadIndex,
  } = useJournal();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [manageJournalsModalOpen, setManageJournalsModalOpen] = useState(false);
  const avatarLetter = user ? (user.name?.[0] || user.email?.[0] || 'S').toUpperCase() : '?';

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-6 h-14 font-ui"
        style={{
          background: 'var(--surface-1)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        {/* Left spacing */}
        <div className="w-8" />

        {/* Center — Book title + page actions */}
        {currentBook && (
          <div className="flex items-center gap-1 md:gap-2">
            {/* Book title button */}
            <button
              onClick={() => setManageJournalsModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 md:px-3 py-1 rounded-[6px] text-xs transition-colors hover:bg-white/5"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
            >
              <BookOpen size={12} style={{ color: 'var(--accent)' }} />
              <span className="max-w-[100px] md:max-w-[200px] truncate font-serifTitle" style={{ color: 'var(--text-primary)' }}>
                {currentBook.title}
              </span>
              <ChevronDown size={11} className="opacity-50" />
            </button>

            {canWrite && (
              <>
                <button
                  onClick={addSpread}
                  className="flex items-center gap-1 px-2 md:px-2.5 py-1 rounded-[6px] text-xs transition-colors"
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                  title="Add Pages"
                >
                  <Plus size={12} />
                  <span className="hidden md:inline">Add Pages</span>
                </button>

                {currentSpreadIndex > 0 && (
                  <button
                    onClick={tearCurrentSpread}
                    className="flex items-center gap-1 px-2 md:px-2.5 py-1 rounded-[6px] text-xs transition-colors"
                    style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'rgba(239,68,68,0.7)' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(239,68,68,0.7)'}
                    title="Tear Pages"
                  >
                    <Scissors size={12} />
                    <span className="hidden md:inline">Tear</span>
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {/* Right — User menu */}
        <div className="flex items-center gap-2">
          {user && (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-[8px] transition-colors"
                style={{ background: dropdownOpen ? 'var(--surface-3)' : 'transparent' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                onMouseLeave={e => e.currentTarget.style.background = dropdownOpen ? 'var(--surface-3)' : 'transparent'}
              >
                <div
                  className="w-7 h-7 rounded-[6px] flex items-center justify-center text-xs font-bold"
                  style={{ background: 'var(--accent)', color: '#120e09' }}
                >
                  {avatarLetter}
                </div>
                <ChevronDown
                  size={12}
                  style={{ color: 'var(--text-tertiary)' }}
                  className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {dropdownOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-52 rounded-[10px] py-1.5 z-50 animate-scale-in"
                  style={{
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border-hover)',
                    boxShadow: '0 16px 48px rgba(0,0,0,0.7)',
                  }}
                >
                  <div className="px-4 py-2.5 border-b" style={{ borderColor: 'var(--border)' }}>
                    <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{user.name}</p>
                    <p className="text-[11px] mt-0.5 truncate" style={{ color: 'var(--text-tertiary)' }}>{user.email}</p>
                  </div>

                  <div className="py-1 max-h-44 overflow-y-auto">
                    {userBooks.map(b => (
                      <button
                        key={b.id}
                        onClick={() => { switchBook(b.id); setDropdownOpen(false); }}
                        className="w-full text-left px-4 py-2 text-xs flex items-center gap-2 transition-colors"
                        style={{ color: currentBook?.id === b.id ? 'var(--accent)' : 'var(--text-secondary)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-3)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <BookOpen size={11} />
                        <span className="truncate">{b.title}</span>
                      </button>
                    ))}
                  </div>

                  <div className="border-t pt-1" style={{ borderColor: 'var(--border)' }}>
                    <button
                      onClick={() => { setAccountModalOpen(true); setDropdownOpen(false); }}
                      className="w-full text-left px-4 py-2 text-xs flex items-center gap-2 transition-colors"
                      style={{ color: 'var(--text-secondary)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-3)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <Settings size={12} />
                      <span>Account Settings</span>
                    </button>
                    <button
                      onClick={() => { logout(); setDropdownOpen(false); }}
                      className="w-full text-left px-4 py-2 text-xs flex items-center gap-2 transition-colors"
                      style={{ color: '#ef4444' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <LogOut size={12} />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Lazy Suspense for Manage Journals modal */}
      {manageJournalsModalOpen && (
        <Suspense fallback={null}>
          <ManageJournalsModal isOpen={manageJournalsModalOpen} onClose={() => setManageJournalsModalOpen(false)} />
        </Suspense>
      )}
    </>
  );
};
