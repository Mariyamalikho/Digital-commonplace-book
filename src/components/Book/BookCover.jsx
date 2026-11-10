import React, { useState } from 'react';
import { Check, Pencil, Share2, Palette, ChevronRight } from 'lucide-react';
import { useJournal } from '../../context/JournalContext';
import { useAuth } from '../../context/AuthContext';
import { COVER_THEMES, DEFAULT_JOURNAL_TITLE, DEFAULT_JOURNAL_SUBTITLE } from '../../utils/constants';

// Classical ornamental bookbinder line
const OrnamentalLine = ({ accent }) => (
  <svg width="140" height="12" viewBox="0 0 140 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="0" y1="6" x2="52" y2="6" stroke={accent} strokeOpacity="0.75" strokeWidth="1"/>
    <path d="M58 6 L64 2 L70 6 L64 10 Z" fill={accent} fillOpacity="0.85"/>
    <line x1="76" y1="6" x2="140" y2="6" stroke={accent} strokeOpacity="0.75" strokeWidth="1"/>
  </svg>
);

/**
 * BookCover Component
 * Renders the tactile, physical front cover of a journal with authentic bookbinder styling,
 * gold-embossed typography, and clean interaction modes.
 */
export const BookCover = ({ isPreview = false }) => {
  const { user, setAuthModalOpen, setAuthMode } = useAuth();
  const { 
    currentBook, 
    updateJournalTitle, 
    canWrite, 
    setShareModalOpen, 
    setCoverCustomizerOpen, 
    goToNextSpread, 
    guestToken, 
    hasSeenGuestUpsell 
  } = useJournal();

  const handleOpenAttempt = (e) => {
    if (e && e.target && (e.target.closest('button') || e.target.closest('input'))) return;

    if (user) {
      goToNextSpread();
    } else if (guestToken) {
      if (hasSeenGuestUpsell) {
        goToNextSpread();
      } else {
        setAuthMode('guest_welcome');
        setAuthModalOpen(true);
      }
    } else {
      setAuthMode('login');
      setAuthModalOpen(true);
    }
  };

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(currentBook?.title || '');
  const [subtitleInput, setSubtitleInput] = useState(currentBook?.subtitle || '');
  const [hoveringOpen, setHoveringOpen] = useState(false);

  const cover = currentBook?.cover || {};
  const themeKey = cover.theme || 'dark-academia';
  const patternKey = cover.pattern || 'noise';
  const t = COVER_THEMES[themeKey] || COVER_THEMES['dark-academia'];

  // Base bookbinder surface tone
  const baseColor = cover.color || (
    themeKey === 'dark-academia' ? '#1c140e' :
    themeKey === 'sand' ? '#211810' :
    themeKey === 'midnight' ? '#0e1622' :
    themeKey === 'emerald' ? '#0e1b13' :
    themeKey === 'royal' ? '#210e16' : '#141416'
  );

  // Authentic leather / textured bookcloth lighting gradient
  const coverBg = `
    linear-gradient(145deg, ${baseColor} 0%, ${baseColor}f0 40%, ${baseColor}d8 75%, ${baseColor} 100%)
  `;

  const handleSave = () => {
    updateJournalTitle(titleInput, subtitleInput);
    setIsEditingTitle(false);
  };

  const ribbonColor = cover.ribbonColor || t.accent;

  return (
    <div className="w-full max-w-[480px] mx-auto px-4 py-8 md:py-12 animate-fade-in">
      <div
        className="relative w-full max-w-[480px] mx-auto rounded-r-[20px] rounded-l-[4px] p-8 md:p-12 overflow-hidden group select-none flex flex-col items-center justify-center cursor-pointer aspect-[3/4]"
        onClick={handleOpenAttempt}
        style={{
          background: coverBg,
          boxShadow: `
            0 0 0 1px rgba(255,255,255,0.06),
            0 2px 2px rgba(255,255,255,0.08) inset,
            0 -2px 3px rgba(0,0,0,0.6) inset,
            0 20px 50px rgba(0,0,0,0.7),
            0 35px 80px rgba(0,0,0,0.5)
          `,
          transition: 'box-shadow 0.3s ease, transform 0.25s ease',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-3px)';
          e.currentTarget.style.boxShadow = '0 0 0 1px rgba(255,255,255,0.08), 0 2px 2px rgba(255,255,255,0.12) inset, 0 -2px 3px rgba(0,0,0,0.6) inset, 0 28px 65px rgba(0,0,0,0.85), 0 45px 95px rgba(0,0,0,0.6)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 0 0 1px rgba(255,255,255,0.06), 0 2px 2px rgba(255,255,255,0.08) inset, 0 -2px 3px rgba(0,0,0,0.6) inset, 0 20px 50px rgba(0,0,0,0.7), 0 35px 80px rgba(0,0,0,0.5)';
        }}
      >
        {/* Subtle Texture Overlay */}
        <div
          className={`absolute inset-0 pointer-events-none pattern-${patternKey}`}
          style={{
            WebkitMaskImage: 'radial-gradient(circle at center, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.8) 60%, black 100%)',
            maskImage: 'radial-gradient(circle at center, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.8) 60%, black 100%)'
          }}
        />

        {/* Book Spine (Left Edge Embossing & Leather Hinge) */}
        <div 
          className="absolute top-0 left-0 bottom-0 w-[28px] pointer-events-none z-10"
          style={{
            background: `linear-gradient(90deg, 
              rgba(0,0,0,0.65) 0%, 
              rgba(255,255,255,0.15) 3px, 
              rgba(0,0,0,0.2) 16px, 
              rgba(0,0,0,0.8) 20px, 
              rgba(0,0,0,0.95) 24px, 
              rgba(255,255,255,0.2) 26px, 
              transparent 28px
            )`,
            boxShadow: 'inset 1px 0 1px rgba(255,255,255,0.2)'
          }}
        />

        {/* Inset Gold Tooling Frame */}
        <div
          className="absolute inset-[12px] rounded-r-[14px] rounded-l-[2px] pointer-events-none"
          style={{ border: `1px solid ${t.accent}33` }}
        />

        {/* Top Accent Gilded Rule */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] rounded-tr-[20px] rounded-tl-[4px]"
          style={{ background: t.accent, opacity: 0.8 }}
        />

        {/* Bookbinder Silk Ribbon */}
        <div
          className="absolute top-0 left-6 z-20"
          style={{ width: '28px', height: '100%', bottom: '0' }}
          title="Bookmark ribbon"
        >
          <div
            className="w-full h-full shadow-md"
            style={{
              background: `linear-gradient(180deg, ${ribbonColor} 0%, ${ribbonColor}cc 100%)`,
              clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 14px), 50% 100%, 0 calc(100% - 14px))',
              boxShadow: `0 4px 16px rgba(0,0,0,0.5), inset 1px 0 0 rgba(255,255,255,0.2)`,
            }}
          />
        </div>

        {/* Top Action (Share) */}
        <div className="absolute top-4 left-4 z-30 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity font-ui">
          {canWrite && (
            <button
              onClick={e => { e.stopPropagation(); setShareModalOpen(true); }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[6px] text-xs font-medium transition-all"
              style={{
                background: 'rgba(16,14,12,0.85)',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
              }}
            >
              <Share2 size={11} />
              Share
            </button>
          )}
        </div>

        {/* Bottom Customize Button */}
        <div className="absolute bottom-4 right-4 z-30 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity font-ui">
          {canWrite && (
            <button
              onClick={e => { e.stopPropagation(); setCoverCustomizerOpen(true); }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[6px] text-xs font-medium transition-all"
              style={{
                background: 'rgba(16,14,12,0.85)',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
              }}
            >
              <Palette size={11} />
              Customize
            </button>
          )}
        </div>

        {/* Central Content */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-[580px] px-8 text-center gap-4">
          {isEditingTitle ? (
            <div
              className="w-full max-w-xs p-6 rounded-[12px] space-y-4 animate-scale-in"
              style={{
                background: 'var(--surface-1)',
                border: '1px solid var(--border)',
              }}
              onClick={e => e.stopPropagation()}
            >
              <p className="text-xs font-ui font-medium" style={{ color: t.accent }}>Edit Cover</p>
              <input
                autoFocus
                type="text"
                value={titleInput}
                onChange={e => setTitleInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSave()}
                className="w-full text-center text-xl font-serifTitle bg-transparent border-b pb-2 focus:outline-none"
                style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                placeholder="Journal Title"
              />
              <input
                type="text"
                value={subtitleInput}
                onChange={e => setSubtitleInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSave()}
                className="w-full text-center text-sm font-serifHeading bg-transparent border-b pb-2 focus:outline-none"
                style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                placeholder="Subtitle"
              />
              <button
                onClick={handleSave}
                className="w-full py-2.5 rounded-[6px] text-sm font-ui font-semibold flex items-center justify-center gap-2"
                style={{ background: t.accent, color: '#120e09' }}
              >
                <Check size={14} />
                Save Title
              </button>
            </div>
          ) : (
            <>
              {/* Ornamental Headpiece */}
              <OrnamentalLine accent={t.accent} />

              {/* Title Header */}
              <div className="space-y-2">
                <h1
                  className="font-serifTitle font-normal leading-[1.12] tracking-wide"
                  style={{
                    color: t.text,
                    fontSize: 'clamp(1.75rem, 4.5vw, 2.5rem)',
                    textShadow: '0 2px 8px rgba(0,0,0,0.8), 0 1px 2px rgba(0,0,0,0.9)',
                  }}
                >
                  {currentBook?.title || DEFAULT_JOURNAL_TITLE}
                </h1>

                {/* Subtitle with edit control */}
                <div className="flex items-center justify-center gap-2">
                  <p
                    className="text-xs tracking-[0.16em] uppercase font-serifHeading"
                    style={{ color: t.sub }}
                  >
                    {currentBook?.subtitle || DEFAULT_JOURNAL_SUBTITLE}
                  </p>
                  {canWrite && (
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setIsEditingTitle(true);
                        setTitleInput(currentBook?.title || '');
                        setSubtitleInput(currentBook?.subtitle || '');
                      }}
                      className="opacity-100 md:opacity-0 md:group-hover:opacity-75 md:hover:!opacity-100 transition-opacity"
                      style={{ color: t.accent }}
                      title="Edit title"
                    >
                      <Pencil size={11} />
                    </button>
                  )}
                </div>
              </div>

              {/* Ornamental Tailpiece */}
              <OrnamentalLine accent={t.accent} />

              {/* Author / Scholar Attribution */}
              <p
                className="text-[11px] tracking-[0.2em] uppercase font-serifHeading"
                style={{ color: t.accent }}
              >
                {currentBook?.ownerName || (isPreview ? 'Your Name' : 'Scholar')}
              </p>

              {/* Open CTA */}
              <button
                onClick={(e) => { e.stopPropagation(); handleOpenAttempt(); }}
                onMouseEnter={() => setHoveringOpen(true)}
                onMouseLeave={() => setHoveringOpen(false)}
                className="mt-3 flex items-center gap-2 px-6 py-2.5 rounded-[8px] text-xs font-ui font-medium transition-all"
                style={{
                  background: hoveringOpen ? t.accent : 'var(--surface-2)',
                  color: hoveringOpen ? '#120e09' : t.text,
                  border: `1px solid ${hoveringOpen ? t.accent : 'var(--border)'}`,
                  fontWeight: hoveringOpen ? '600' : '500'
                }}
              >
                <span>Open Journal</span>
                <ChevronRight size={13} />
              </button>

              {/* Page count */}
              <p
                className="text-[11px] tracking-wider font-serifHeading"
                style={{ color: 'var(--text-tertiary)' }}
              >
                {(currentBook?.spreads?.length || 0) * 2} pages
              </p>
            </>
          )}
        </div>

        {/* Bottom edge shadow */}
        <div
          className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 100%)' }}
        />
      </div>
    </div>
  );
};
