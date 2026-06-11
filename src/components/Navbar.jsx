import React, { useState } from 'react';
import { BookOpen, ChevronDown, LogOut, Settings, Plus, Scissors, Palette } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useJournal } from '../context/JournalContext';

export const Navbar = () => {
  const { user, setAuthModalOpen, setAuthMode, setAccountModalOpen, logout } = useAuth();
  const {
    currentBook,
    userBooks,
    switchBook,
    addSpread,
    tearCurrentSpread,
    setCoverCustomizerOpen,
    canWrite,
    currentSpreadIndex,
  } = useJournal();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const avatarLetter = user ? (user.name?.[0] || user.email?.[0] || 'S').toUpperCase() : '?';

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-6 h-14"
      style={{
        background: 'rgba(10,10,15,0.85)',
        backdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      {/* Left — empty spacer to keep center balanced */}
      <div className="w-8" />

      {/* Center — Book title + page actions */}
      {currentBook && (
        <div className="flex items-center gap-2">
          {/* Book title pill */}
          <div
            className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-[8px] text-xs"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
          >
            <BookOpen size={11} />
            <span className="max-w-[160px] truncate" style={{ color: 'var(--text-primary)' }}>
              {currentBook.title}
            </span>
          </div>

          {canWrite && (
            <>
              <button
                onClick={addSpread}
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] text-xs transition-all"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
              >
                <Plus size={11} />
                <span>Add Pages</span>
              </button>

              {currentSpreadIndex > 0 && (
                <button
                  onClick={tearCurrentSpread}
                  className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] text-xs transition-all"
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'rgba(239,68,68,0.6)' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(239,68,68,0.6)'}
                >
                  <Scissors size={11} />
                  <span>Tear</span>
                </button>
              )}

              <button
                onClick={() => setCoverCustomizerOpen(true)}
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] text-xs transition-all"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
              >
                <Palette size={11} />
                <span>Style</span>
              </button>
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
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-[10px] transition-colors"
              style={{ background: dropdownOpen ? 'var(--surface-3)' : 'transparent' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
              onMouseLeave={e => e.currentTarget.style.background = dropdownOpen ? 'var(--surface-3)' : 'transparent'}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ background: 'var(--accent)' }}
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
                className="absolute right-0 top-full mt-2 w-52 rounded-[16px] py-1.5 z-50 animate-scale-in"
                style={{
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border-hover)',
                  boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
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
                    <Settings size={11} />
                    <span>Account Settings</span>
                  </button>
                  <button
                    onClick={() => { logout(); setDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2 text-xs flex items-center gap-2 transition-colors"
                    style={{ color: '#ef4444' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <LogOut size={11} />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};
