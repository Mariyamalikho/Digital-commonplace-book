import React, { useState } from 'react';
import { Check, Pencil, Share2, Palette, ChevronRight } from 'lucide-react';
import { useJournal } from '../../context/JournalContext';
import { useAuth } from '../../context/AuthContext';

const THEME_ACCENTS = {
  midnight:        { accent: '#6c63ff', glow: 'rgba(108,99,255,0.25)', text: '#e8e6ff',  sub: '#9d97e8', shine: 'rgba(108,99,255,0.12)' },
  sand:            { accent: '#c9a96e', glow: 'rgba(201,169,110,0.25)', text: '#faefd8', sub: '#b89660', shine: 'rgba(201,169,110,0.10)' },
  emerald:         { accent: '#34d399', glow: 'rgba(52,211,153,0.20)',  text: '#d1fae5', sub: '#25a876', shine: 'rgba(52,211,153,0.08)'  },
  obsidian:        { accent: '#b0b0b0', glow: 'rgba(176,176,176,0.15)', text: '#f4f4f4', sub: '#808080', shine: 'rgba(176,176,176,0.07)' },
  royal:           { accent: '#9f7aea', glow: 'rgba(159,122,234,0.25)', text: '#ede9fe', sub: '#7c5ec0', shine: 'rgba(159,122,234,0.12)' },
  'dark-academia': { accent: '#c8a96e', glow: 'rgba(200,169,110,0.25)', text: '#faefd8', sub: '#a88650', shine: 'rgba(200,169,110,0.10)' },
};

// Subtle SVG noise pattern moved to index.css

// Thin ornamental SVG line
const OrnamentalLine = ({ accent }) => (
  <svg width="120" height="12" viewBox="0 0 120 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="0" y1="6" x2="44" y2="6" stroke={accent} strokeOpacity="0.35" strokeWidth="0.75"/>
    <path d="M50 6 L55 2 L60 6 L55 10 Z" fill={accent} fillOpacity="0.5"/>
    <line x1="66" y1="6" x2="120" y2="6" stroke={accent} strokeOpacity="0.35" strokeWidth="0.75"/>
  </svg>
);

/**
 * BookCover Component
 * Renders the interactive 3D front cover of a journal with dynamic titles,
 * customizable CSS patterns, and access control actions (share/customize).
 *
 * @param {Object} props
 * @param {boolean} [props.isPreview=false] - If true, disables interaction for preview mode
 */
export const BookCover = ({ isPreview = false }) => {
  const { user, setAuthModalOpen, setAuthMode } = useAuth();
  const { currentBook, updateJournalTitle, canWrite, setShareModalOpen, setCoverCustomizerOpen, goToNextSpread, role, guestToken, hasSeenGuestUpsell } = useJournal();

  /**
   * Handles user attempts to open the book.
   * If the user is unauthenticated but has a guest token, we show a one-time
   * "guest_welcome" upsell modal. If they dismiss it, we let them in.
   */
  const handleOpenAttempt = (e) => {
    // Ignore clicks on buttons or inputs within the cover
    if (e && e.target && (e.target.closest('button') || e.target.closest('input'))) return;
    
    if (user) {
      // Authenticated users go straight in
      goToNextSpread();
    } else if (guestToken) {
      // Guests go straight in ONLY if they have already seen the upsell
      if (hasSeenGuestUpsell) {
        goToNextSpread();
      } else {
        setAuthMode('guest_welcome');
        setAuthModalOpen(true);
      }
    } else {
      // Completely unauthenticated users without a token must log in
      setAuthMode('login');
      setAuthModalOpen(true);
    }
  };

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(currentBook?.title || '');
  const [subtitleInput, setSubtitleInput] = useState(currentBook?.subtitle || '');
  const [hoveringOpen, setHoveringOpen] = useState(false);

  const cover = currentBook?.cover || {};
  const themeKey = cover.theme || 'midnight';
  const patternKey = cover.pattern || 'noise';
  const t = THEME_ACCENTS[themeKey] || THEME_ACCENTS.midnight;

  // Base cover color
  const baseColor = cover.color || (themeKey === 'midnight' ? '#110d28' : themeKey === 'sand' ? '#1f1508' : themeKey === 'emerald' ? '#0a1f18' : themeKey === 'obsidian' ? '#141414' : themeKey === 'royal' ? '#160a30' : '#1c1408');

  // Multi-stop gradient: rich, layered
  const coverBg = `
    radial-gradient(ellipse at 30% 20%, ${t.glow} 0%, transparent 55%),
    radial-gradient(ellipse at 75% 80%, ${t.shine} 0%, transparent 50%),
    linear-gradient(160deg, ${baseColor}ff 0%, ${baseColor}ee 40%, ${baseColor}dd 70%, ${baseColor}ff 100%)
  `;

  const handleSave = () => {
    updateJournalTitle(titleInput, subtitleInput);
    setIsEditingTitle(false);
  };

  const ribbonColor = cover.ribbonColor || t.accent;

  return (
    <div className="w-full max-w-[480px] mx-auto px-4 py-8 md:py-12 animate-fade-in">
      <div
        onClick={handleOpenAttempt}
        className="relative rounded-[24px] overflow-hidden cursor-pointer group"
        style={{
          background: coverBg,
          minHeight: '620px',
          boxShadow: `
            0 0 0 1px rgba(255,255,255,0.05),
            0 2px 1px rgba(255,255,255,0.06) inset,
            0 -1px 1px rgba(0,0,0,0.3) inset,
            0 24px 50px rgba(0,0,0,0.45),
            0 48px 80px rgba(0,0,0,0.3),
            0 0 60px ${t.glow}
          `,
          transition: 'box-shadow 0.4s ease, transform 0.3s ease',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = `0 0 0 1px rgba(255,255,255,0.06), 0 2px 1px rgba(255,255,255,0.08) inset, 0 -1px 1px rgba(0,0,0,0.3) inset, 0 32px 60px rgba(0,0,0,0.55), 0 64px 100px rgba(0,0,0,0.35), 0 0 80px ${t.glow}`;
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = `0 0 0 1px rgba(255,255,255,0.05), 0 2px 1px rgba(255,255,255,0.06) inset, 0 -1px 1px rgba(0,0,0,0.3) inset, 0 24px 50px rgba(0,0,0,0.45), 0 48px 80px rgba(0,0,0,0.3), 0 0 60px ${t.glow}`;
        }}
      >
        {/* Selected Pattern Overlay 
            Applies a CSS background pattern utility class (e.g. pattern-noise, pattern-dots)
            defined in index.css based on user's customization choices. */}
        <div 
          className={`absolute inset-0 pointer-events-none pattern-${patternKey}`}
          style={{ opacity: (themeKey === 'obsidian' || themeKey === 'midnight' || themeKey === 'royal') ? 0.5 : 1 }} 
        />

        {/* Fine inner border frame */}
        <div
          className="absolute inset-[10px] rounded-[16px] pointer-events-none"
          style={{ border: `1px solid ${t.accent}22` }}
        />

        {/* Top accent stripe (gradient → transparent) */}
        <div
          className="absolute top-0 left-0 right-0 h-[3px] rounded-t-[24px]"
          style={{ background: `linear-gradient(90deg, transparent 0%, ${t.accent}cc 30%, ${t.accent} 50%, ${t.accent}cc 70%, transparent 100%)` }}
        />

        {/* Full-height Ribbon Bookmark — left side */}
        <div
          className="absolute top-0 left-5 z-20 ribbon-wiggle-natural"
          style={{ width: '32px', height: '100%', bottom: '0' }}
          title="Bookmark ribbon"
        >
          <div
            className="w-full h-full shadow-lg"
            style={{
              background: `linear-gradient(180deg, ${ribbonColor} 0%, ${ribbonColor}dd 100%)`,
              clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 16px), 50% 100%, 0 calc(100% - 16px))',
              boxShadow: `0 6px 24px ${ribbonColor}66, inset 2px 0 0 rgba(255,255,255,0.18)`,
            }}
          />
        </div>

        {/* Top-left action (Share) */}
        <div className="absolute top-5 left-5 z-30 opacity-0 group-hover:opacity-100 transition-all duration-[250ms]">
          {canWrite && (
            <button
              onClick={e => { e.stopPropagation(); setShareModalOpen(true); }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[8px] text-xs font-medium transition-all"
              style={{
                background: 'rgba(0,0,0,0.45)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: 'rgba(255,255,255,0.8)',
              }}
            >
              <Share2 size={11} />
              Share
            </button>
          )}
        </div>


        {/* Central Content */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-[620px] px-10 text-center gap-5">

          {isEditingTitle ? (
            /* ---- Edit mode ---- */
            <div
              className="w-full max-w-xs p-6 rounded-[18px] space-y-4 animate-scale-in"
              style={{
                background: 'rgba(0,0,0,0.55)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(255,255,255,0.12)',
              }}
              onClick={e => e.stopPropagation()}
            >
              <p className="text-xs font-medium" style={{ color: `${t.accent}cc` }}>Edit Cover</p>
              <input
                autoFocus
                type="text"
                value={titleInput}
                onChange={e => setTitleInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSave()}
                className="w-full text-center text-xl font-display bg-transparent border-b pb-2 focus:outline-none"
                style={{ borderColor: 'rgba(255,255,255,0.18)', color: '#fff' }}
                placeholder="Journal Title"
              />
              <input
                type="text"
                value={subtitleInput}
                onChange={e => setSubtitleInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSave()}
                className="w-full text-center text-sm bg-transparent border-b pb-2 focus:outline-none"
                style={{ borderColor: 'rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.55)' }}
                placeholder="Subtitle"
              />
              <button
                onClick={handleSave}
                className="w-full py-2.5 rounded-[10px] text-sm font-medium flex items-center justify-center gap-2 text-white"
                style={{ background: t.accent }}
              >
                <Check size={14} />
                Save
              </button>
            </div>
          ) : (
            /* ---- Display mode ---- */
            <>
              {/* Top ornamental line */}
              <OrnamentalLine accent={t.accent} />

              {/* Title */}
              <div className="space-y-3">
                <h1
                  className="font-display font-normal leading-[1.1] tracking-[0.04em]"
                  style={{
                    color: t.text,
                    fontSize: 'clamp(2rem, 5vw, 3rem)',
                    textShadow: `0 2px 40px ${t.glow}, 0 0 80px ${t.glow}`,
                  }}
                >
                  {currentBook?.title || 'My Journal'}
                </h1>

                {/* Subtitle row with edit pencil */}
                <div className="flex items-center justify-center gap-2">
                  <p
                    className="text-xs tracking-[0.2em] uppercase font-light"
                    style={{ color: t.sub }}
                  >
                    {currentBook?.subtitle || 'A Commonplace Journal'}
                  </p>
                  {canWrite && (
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setIsEditingTitle(true);
                        setTitleInput(currentBook?.title || '');
                        setSubtitleInput(currentBook?.subtitle || '');
                      }}
                      className="opacity-0 group-hover:opacity-50 hover:!opacity-100 transition-opacity"
                      style={{ color: t.accent }}
                      title="Edit title"
                    >
                      <Pencil size={11} />
                    </button>
                  )}
                </div>
              </div>

              {/* Bottom ornamental line */}
              <OrnamentalLine accent={t.accent} />

              {/* Author */}
              <p
                className="text-[11px] tracking-[0.3em] uppercase"
                style={{ color: `${t.accent}60` }}
              >
                {currentBook?.ownerName || (isPreview ? 'Your Name' : 'Scholar')}
              </p>

              {/* Open CTA */}
              <button
                onClick={(e) => { e.stopPropagation(); handleOpenAttempt(); }}
                onMouseEnter={() => setHoveringOpen(true)}
                onMouseLeave={() => setHoveringOpen(false)}
                className="mt-2 flex items-center gap-2 px-7 py-3 rounded-[14px] text-sm font-medium transition-all duration-[250ms]"
                style={{
                  background: hoveringOpen ? t.accent : 'rgba(255,255,255,0.06)',
                  backdropFilter: 'blur(12px)',
                  border: `1px solid ${hoveringOpen ? t.accent : t.accent + '40'}`,
                  color: hoveringOpen ? '#fff' : t.text,
                  boxShadow: hoveringOpen ? `0 8px 32px ${t.glow}` : 'none',
                  transform: hoveringOpen ? 'scale(1.03)' : 'scale(1)',
                }}
              >
                Open Journal
                <ChevronRight size={14} className="transition-transform" style={{ transform: hoveringOpen ? 'translateX(2px)' : 'translateX(0)' }} />
              </button>

              {/* Page count hint */}
              <p
                className="text-[10px] tracking-widest"
                style={{ color: `${t.accent}40` }}
              >
                {(currentBook?.spreads?.length || 0) * 2} pages
              </p>
            </>
          )}
        </div>

        {/* Bottom edge shadow for depth */}
        <div
          className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 100%)' }}
        />
      </div>
    </div>
  );
};
