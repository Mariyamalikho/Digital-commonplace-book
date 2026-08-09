import React, { useState } from 'react';
import { Plus, Search, BookOpen, Copy, Trash2, ChevronRight, Clock, Palette, Layers } from 'lucide-react';
import { useJournal } from '../../context/JournalContext';
import { useAuth } from '../../context/AuthContext';

const THEME_CONFIGS = {
  'midnight':      { label: 'Midnight',      gradient: 'linear-gradient(135deg, #1a1040 0%, #0a0820 100%)', accent: '#6c63ff' },
  'sand':          { label: 'Sand',           gradient: 'linear-gradient(135deg, #2a1f0e 0%, #16100a 100%)', accent: '#c9a96e' },
  'emerald':       { label: 'Emerald',        gradient: 'linear-gradient(135deg, #0d2820 0%, #071510 100%)', accent: '#34d399' },
  'obsidian':      { label: 'Obsidian',       gradient: 'linear-gradient(135deg, #1c1c1c 0%, #0a0a0a 100%)', accent: '#a0a0a0' },
  'royal':         { label: 'Royal',          gradient: 'linear-gradient(135deg, #1c0e3a 0%, #0e0720 100%)', accent: '#9f7aea' },
  'dark-academia': { label: 'Dark Academia',  gradient: 'linear-gradient(135deg, #261d0e 0%, #140e06 100%)', accent: '#c8a96e' },
};

const formatDate = (iso) => {
  if (!iso) return 'Just now';
  try {
    return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(iso));
  } catch { return iso; }
};

const BookCard = ({ book, onOpen, onDuplicate }) => {
  const theme = THEME_CONFIGS[book.cover?.theme] || THEME_CONFIGS['midnight'];
  const pageCount = (book.spreads?.length || 0) * 2;

  return (
    <div
      className="group relative rounded-[20px] overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1"
      style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)' }}
      onClick={() => onOpen(book.id)}
    >
      {/* Cover Thumbnail */}
      <div
        className="relative h-44 flex flex-col justify-end p-5 overflow-hidden"
        style={{ background: book.cover?.color ? `linear-gradient(135deg, ${book.cover.color}ee 0%, ${book.cover.color}99 100%)` : theme.gradient }}
      >
        {/* Subtle grain texture overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: '128px'
        }} />

        {/* Accent stripe top */}
        <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-[20px]" style={{ background: theme.accent }} />

        {/* Ribbon bookmark */}
        {book.cover?.ribbonColor && (
          <div
            className="absolute top-0 right-8 w-3 h-12 opacity-80"
            style={{
              background: book.cover.ribbonColor,
              clipPath: 'polygon(0 0, 100% 0, 100% 85%, 50% 100%, 0 85%)',
              boxShadow: `0 4px 12px ${book.cover.ribbonColor}66`
            }}
          />
        )}

        <div className="relative z-10">
          <p className="font-display text-white/90 text-lg font-normal leading-snug line-clamp-2">
            {book.title}
          </p>
        </div>
      </div>

      {/* Card Footer */}
      <div
        className="px-5 py-4 border-t"
        style={{ background: 'var(--surface-2)', borderColor: 'var(--border)' }}
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[11px] font-medium" style={{ color: theme.accent }}>
              {theme.label}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
              by {book.ownerName || 'Scholar'}
            </p>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => { e.stopPropagation(); onDuplicate(book); }}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
              style={{ background: 'var(--surface-3)', color: 'var(--text-secondary)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
              title="Duplicate"
            >
              <Copy size={12} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1.5" style={{ color: 'var(--text-tertiary)' }}>
          <Clock size={10} />
          <span className="text-[11px]">{formatDate(book.createdAt)}</span>
          <span className="mx-1 opacity-30">·</span>
          <span className="text-[11px]">{pageCount} pages</span>
        </div>
      </div>
    </div>
  );
};

export const BookshelfDashboard = () => {
  const { user, setAuthModalOpen, setAuthMode } = useAuth();
  const { userBooks, switchBook, setViewMode, saveCurrentBookState } = useJournal();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterTheme, setFilterTheme] = useState('all');
  const [isCreatingBook, setIsCreatingBook] = useState(false);
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookTheme, setNewBookTheme] = useState('midnight');

  const filteredBooks = userBooks.filter(book => {
    const matchesSearch = !searchQuery ||
      book.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTheme = filterTheme === 'all' ||
      (book.cover?.theme || 'midnight') === filterTheme;
    return matchesSearch && matchesTheme;
  });

  const handleOpenBook = (bookId) => {
    switchBook(bookId);
    setViewMode('reader');
  };

  const handleDuplicate = (book) => {
    const dup = JSON.parse(JSON.stringify(book));
    dup.id = 'book-' + Date.now();
    dup.title = `${book.title} — Copy`;
    dup.createdAt = new Date().toISOString();
    saveCurrentBookState(dup, false);
  };

  const handleCreateBook = (e) => {
    e.preventDefault();
    if (!newBookTitle.trim()) return;
    const themeConf = THEME_CONFIGS[newBookTheme];
    const newBook = {
      id: 'book-' + Date.now(),
      ownerId: user ? user.id : 'user-guest-001',
      ownerName: user ? user.name : 'Scholar',
      title: newBookTitle.trim(),
      subtitle: 'A Private Commonplace Journal',
      createdAt: new Date().toISOString(),
      cover: {
        theme: newBookTheme,
        color: newBookTheme === 'midnight' ? '#110d28' : newBookTheme === 'sand' ? '#1f1508' : newBookTheme === 'emerald' ? '#0a1f18' : newBookTheme === 'obsidian' ? '#141414' : newBookTheme === 'royal' ? '#160a30' : '#1c1408',
        ribbonColor: themeConf.accent,
      },
      privacy: 'private',
      spreads: [
        {
          id: 'spread-1',
          leftPage: {
            id: 'page-1', pageNumber: 1,
            date: new Date().toISOString().split('T')[0],
            title: 'First Entry',
            content: '', drawing: null, media: [], voiceNotes: [], notes: []
          },
          rightPage: {
            id: 'page-2', pageNumber: 2,
            date: new Date().toISOString().split('T')[0],
            title: 'Reflections',
            content: '', drawing: null, media: [], voiceNotes: [], notes: []
          }
        }
      ],
      members: [{ userId: user ? user.id : 'user-guest-001', name: user ? user.name : 'Scholar', role: 'owner' }]
    };
    saveCurrentBookState(newBook, false);
    handleOpenBook(newBook.id);
    setNewBookTitle('');
    setIsCreatingBook(false);
  };

  return (
    <div className="min-h-screen flex flex-col animate-fade-in" style={{ background: 'var(--bg)', color: 'var(--text-primary)' }}>

      {/* ---- Hero Header ---- */}
      <div className="flex flex-col items-center pt-20 pb-12 px-6 text-center relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, var(--accent) 0%, transparent 70%)' }} />

        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
            style={{ background: 'var(--accent-light)', color: 'var(--accent)', border: '1px solid var(--border-hover)' }}>
            <Layers size={11} />
            <span>Your Private Library</span>
          </div>

          <h1 className="font-display text-4xl md:text-5xl font-normal tracking-tight" style={{ color: 'var(--text-primary)', lineHeight: 1.15 }}>
            {user ? `${user.name}'s Library` : 'Folio Library'}
          </h1>
          <p className="text-base max-w-md leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Your private collection of journals, notebooks, and anthologies.
          </p>

          <button
            onClick={() => setIsCreatingBook(true)}
            className="btn btn-primary mt-2 px-5 py-2.5 rounded-[12px] text-sm font-medium"
            style={{ background: 'var(--accent)' }}
          >
            <Plus size={15} />
            New Journal
          </button>
        </div>
      </div>

      {/* ---- Search + Filter Bar ---- */}
      <div className="max-w-5xl mx-auto w-full px-6 mb-8">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search journals…"
              className="input-field pl-9 py-2.5 text-sm rounded-[12px]"
              style={{ background: 'var(--surface-2)' }}
            />
          </div>

          {/* Theme Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {['all', ...Object.keys(THEME_CONFIGS)].map(t => (
              <button
                key={t}
                onClick={() => setFilterTheme(t)}
                className="px-3 py-1.5 rounded-[8px] text-xs font-medium whitespace-nowrap transition-all"
                style={{
                  background: filterTheme === t ? 'var(--accent)' : 'var(--surface-2)',
                  color: filterTheme === t ? '#fff' : 'var(--text-secondary)',
                  border: `1px solid ${filterTheme === t ? 'var(--accent)' : 'var(--border)'}`,
                }}
              >
                {t === 'all' ? 'All' : THEME_CONFIGS[t].label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ---- Book Cards Grid ---- */}
      <div className="max-w-5xl mx-auto w-full px-6 pb-24">
        {filteredBooks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-5 animate-fade-in">
            <div className="w-16 h-16 rounded-[20px] flex items-center justify-center"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
              <BookOpen size={24} style={{ color: 'var(--text-tertiary)' }} />
            </div>
            <div className="text-center">
              <p className="text-base font-medium mb-1" style={{ color: 'var(--text-primary)' }}>No journals found</p>
              <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                {searchQuery ? 'Try a different search term' : 'Create your first journal to get started'}
              </p>
            </div>
            <button onClick={() => setIsCreatingBook(true)} className="btn btn-primary text-sm" style={{ background: 'var(--accent)' }}>
              <Plus size={14} /> Create Journal
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* New Book Dashed Card */}
            <button
              onClick={() => setIsCreatingBook(true)}
              className="rounded-[20px] border-2 border-dashed h-[272px] flex flex-col items-center justify-center gap-3 transition-all"
              style={{ borderColor: 'var(--border-hover)', color: 'var(--text-tertiary)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.color = 'var(--text-tertiary)'; }}
            >
              <div className="w-10 h-10 rounded-[12px] flex items-center justify-center border-2 border-current">
                <Plus size={18} />
              </div>
              <span className="text-sm font-medium">New Journal</span>
            </button>

            {filteredBooks.map(book => (
              <BookCard
                key={book.id}
                book={book}
                onOpen={handleOpenBook}
                onDuplicate={handleDuplicate}
              />
            ))}
          </div>
        )}
      </div>

      {/* ---- Create New Book Modal ---- */}
      {isCreatingBook && (
        <div className="modal-overlay" onClick={() => setIsCreatingBook(false)}>
          <div className="modal-panel w-full max-w-md p-8 md:p-10" onClick={e => e.stopPropagation()}>
            <h2 className="font-display text-2xl font-normal mb-1" style={{ color: 'var(--text-primary)' }}>
              Create Journal
            </h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
              Start a new private commonplace book
            </p>

            <form onSubmit={handleCreateBook} className="space-y-5">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Journal Title
                </label>
                <input
                  autoFocus
                  type="text"
                  value={newBookTitle}
                  onChange={e => setNewBookTitle(e.target.value)}
                  placeholder="e.g. Philosophy & Fragments"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Theme
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(THEME_CONFIGS).map(([key, conf]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setNewBookTheme(key)}
                      className="relative p-3 rounded-[12px] text-left transition-all border"
                      style={{
                        background: conf.gradient,
                        borderColor: newBookTheme === key ? conf.accent : 'var(--border)',
                        boxShadow: newBookTheme === key ? `0 0 0 2px ${conf.accent}44` : 'none'
                      }}
                    >
                      <div className="w-4 h-1 rounded-full mb-2" style={{ background: conf.accent }} />
                      <span className="text-[11px] text-white/80 font-medium">{conf.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button aria-label="Close modal"
                  type="button"
                  onClick={() => setIsCreatingBook(false)}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-1"
                  style={{ background: 'var(--accent)' }}
                  disabled={!newBookTitle.trim()}
                >
                  Create &amp; Open
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
