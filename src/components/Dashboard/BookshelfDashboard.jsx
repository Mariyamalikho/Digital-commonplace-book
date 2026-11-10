import React, { useState } from 'react';
import { Plus, Search, BookOpen, Copy, Clock } from 'lucide-react';
import { useJournal } from '../../context/JournalContext';
import { useAuth } from '../../context/AuthContext';
import { useDebounce } from '../../hooks/useDebounce';

const THEME_CONFIGS = {
  'dark-academia': { label: 'Dark Academia', color: '#1c140e', accent: '#c49b45' },
  'sand':          { label: 'Sand Linen',    color: '#211810', accent: '#c49b45' },
  'midnight':      { label: 'Oxford Navy',   color: '#0e1622', accent: '#c8a355' },
  'emerald':       { label: 'Forest Moss',   color: '#0e1b13', accent: '#b5a669' },
  'royal':         { label: 'Morocco Wine',  color: '#210e16', accent: '#d4959b' },
  'obsidian':      { label: 'Charcoal',      color: '#141416', accent: '#b5b5ba' },
};

const formatDate = (iso) => {
  if (!iso) return 'Recent';
  try {
    return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(iso));
  } catch { return iso; }
};

const BookCard = ({ book, onOpen, onDuplicate }) => {
  const theme = THEME_CONFIGS[book.cover?.theme] || THEME_CONFIGS['dark-academia'];
  const pageCount = (book.spreads?.length || 0) * 2;

  return (
    <div
      className="group relative rounded-[12px] overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-1 card"
      onClick={() => onOpen(book.id)}
    >
      {/* Cover Thumbnail */}
      <div
        className="relative h-44 flex flex-col justify-end p-5 overflow-hidden"
        style={{ background: book.cover?.color || theme.color }}
      >
        {/* Subtle gold tooling accent top */}
        <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: theme.accent, opacity: 0.85 }} />

        {/* Ribbon bookmark */}
        {book.cover?.ribbonColor && (
          <div
            className="absolute top-0 right-7 w-3 h-10 opacity-90 shadow-sm"
            style={{
              background: book.cover.ribbonColor,
              clipPath: 'polygon(0 0, 100% 0, 100% 85%, 50% 100%, 0 85%)',
            }}
          />
        )}

        <div className="relative z-10">
          <p className="font-serifTitle text-white/95 text-lg font-normal leading-snug line-clamp-2">
            {book.title}
          </p>
        </div>
      </div>

      {/* Card Footer */}
      <div
        className="px-4 py-3 border-t font-ui"
        style={{ background: 'var(--surface-2)', borderColor: 'var(--border)' }}
      >
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-[11px] font-semibold tracking-wider uppercase" style={{ color: theme.accent }}>
              {theme.label}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
              by {book.ownerName || 'Scholar'}
            </p>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => { e.stopPropagation(); onDuplicate(book); }}
              className="w-7 h-7 rounded-[6px] flex items-center justify-center transition-colors"
              style={{ background: 'var(--surface-3)', color: 'var(--text-secondary)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
              title="Duplicate Journal"
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
  const { user } = useAuth();
  const { userBooks, switchBook, setViewMode, syncBookState } = useJournal();

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 250);
  const [filterTheme, setFilterTheme] = useState('all');
  const [isCreatingBook, setIsCreatingBook] = useState(false);
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookTheme, setNewBookTheme] = useState('dark-academia');

  const filteredBooks = userBooks.filter(book => {
    const matchesSearch = !debouncedSearch ||
      book.title.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchesTheme = filterTheme === 'all' ||
      (book.cover?.theme || 'dark-academia') === filterTheme;
    return matchesSearch && matchesTheme;
  });

  const handleOpenBook = (bookId) => {
    switchBook(bookId);
    setViewMode('reader');
  };

  const handleDuplicate = (book) => {
    const dup = JSON.parse(JSON.stringify(book));
    dup.id = 'book-' + Date.now();
    dup.title = `${book.title} (Copy)`;
    dup.createdAt = new Date().toISOString();
    syncBookState(dup, false);
  };

  const handleCreateBook = (e) => {
    e.preventDefault();
    if (!newBookTitle.trim()) return;
    const themeConf = THEME_CONFIGS[newBookTheme] || THEME_CONFIGS['dark-academia'];
    const newBook = {
      id: 'book-' + Date.now(),
      ownerId: user ? user.id : 'user-guest-001',
      ownerName: user ? user.name : 'Scholar',
      title: newBookTitle.trim(),
      subtitle: 'A Private Commonplace Journal',
      createdAt: new Date().toISOString(),
      cover: {
        theme: newBookTheme,
        color: themeConf.color,
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
    syncBookState(newBook, false);
    handleOpenBook(newBook.id);
    setNewBookTitle('');
    setIsCreatingBook(false);
  };

  return (
    <div className="min-h-screen flex flex-col animate-fade-in" style={{ background: 'var(--bg)', color: 'var(--text-primary)' }}>

      {/* ---- Clean Editorial Header ---- */}
      <div className="flex flex-col items-center pt-20 pb-10 px-6 text-center">
        <h1 className="font-serifTitle text-3xl md:text-4xl font-normal tracking-wide mb-2" style={{ color: 'var(--text-primary)' }}>
          {user ? `${user.name}'s Library` : 'Commonplace Library'}
        </h1>
        <p className="text-base max-w-md font-serifHeading" style={{ color: 'var(--text-secondary)' }}>
          Private journals, anthologies, and marginalia.
        </p>

        <button
          onClick={() => setIsCreatingBook(true)}
          className="btn btn-primary mt-5 px-5 py-2.5 text-xs font-ui font-semibold"
        >
          <Plus size={14} />
          New Journal
        </button>
      </div>

      {/* ---- Search + Filter Bar ---- */}
      <div className="max-w-5xl mx-auto w-full px-6 mb-8 font-ui">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search with Debounce */}
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Filter journals by title…"
              className="input-field pl-9 py-2 text-sm"
            />
          </div>

          {/* Theme Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {['all', ...Object.keys(THEME_CONFIGS)].map(t => (
              <button
                key={t}
                onClick={() => setFilterTheme(t)}
                className="px-3 py-1.5 rounded-[6px] text-xs font-medium whitespace-nowrap transition-all"
                style={{
                  background: filterTheme === t ? 'var(--accent)' : 'var(--surface-2)',
                  color: filterTheme === t ? '#120e09' : 'var(--text-secondary)',
                  border: `1px solid ${filterTheme === t ? 'var(--accent)' : 'var(--border)'}`,
                  fontWeight: filterTheme === t ? '600' : '500',
                }}
              >
                {t === 'all' ? 'All Editions' : THEME_CONFIGS[t].label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ---- Grid ---- */}
      <div className="max-w-5xl mx-auto w-full px-6 pb-24">
        {filteredBooks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-14 h-14 rounded-[10px] flex items-center justify-center surface-2">
              <BookOpen size={22} style={{ color: 'var(--text-tertiary)' }} />
            </div>
            <div className="text-center">
              <p className="text-base font-serifTitle mb-1" style={{ color: 'var(--text-primary)' }}>No journals found</p>
              <p className="text-sm font-serifHeading" style={{ color: 'var(--text-tertiary)' }}>
                {searchQuery ? 'No journals match your search term' : 'Create your first volume to begin commonplacing'}
              </p>
            </div>
            <button onClick={() => setIsCreatingBook(true)} className="btn btn-primary text-xs font-ui">
              <Plus size={13} /> Create Journal
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* New Book Outline Card */}
            <button
              onClick={() => setIsCreatingBook(true)}
              className="rounded-[12px] border-2 border-dashed h-[272px] flex flex-col items-center justify-center gap-3 transition-colors font-ui"
              style={{ borderColor: 'var(--border)', color: 'var(--text-tertiary)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-tertiary)'; }}
            >
              <div className="w-9 h-9 rounded-[8px] flex items-center justify-center border border-current">
                <Plus size={16} />
              </div>
              <span className="text-xs font-medium uppercase tracking-wider">New Volume</span>
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

      {/* ---- Create Modal ---- */}
      {isCreatingBook && (
        <div className="modal-overlay" role="button" tabIndex={0} onClick={() => setIsCreatingBook(false)}>
          <div className="modal-panel w-full max-w-md p-8 font-ui" onClick={e => e.stopPropagation()}>
            <h2 className="font-serifTitle text-2xl font-normal mb-1" style={{ color: 'var(--text-primary)' }}>
              New Volume
            </h2>
            <p className="text-xs mb-5 font-serifHeading" style={{ color: 'var(--text-secondary)' }}>
              Scaffold a new commonplace book in your collection
            </p>

            <form onSubmit={handleCreateBook} className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Volume Title
                </label>
                <input
                  autoFocus
                  type="text"
                  value={newBookTitle}
                  onChange={e => setNewBookTitle(e.target.value)}
                  placeholder="e.g. Philosophical Extracts"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Binding Style
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(THEME_CONFIGS).map(([key, conf]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setNewBookTheme(key)}
                      className="p-3 rounded-[8px] text-left transition-all border"
                      style={{
                        background: conf.color,
                        borderColor: newBookTheme === key ? conf.accent : 'var(--border)',
                        outline: newBookTheme === key ? `2px solid ${conf.accent}` : 'none'
                      }}
                    >
                      <div className="w-3 h-1 rounded-full mb-2" style={{ background: conf.accent }} />
                      <span className="text-[11px] text-white/90 font-medium block truncate">{conf.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreatingBook(false)}
                  className="btn btn-secondary flex-1 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-1 text-xs font-semibold"
                  disabled={!newBookTitle.trim()}
                >
                  Create Volume
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
