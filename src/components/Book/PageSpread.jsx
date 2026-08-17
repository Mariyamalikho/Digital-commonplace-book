import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useJournal } from '../../context/JournalContext';
import { useAuth } from '../../context/AuthContext';
import { PageContent } from './PageContent';
import { BookCover } from './BookCover';

export const PageSpread = () => {
  const { currentBook, currentSpreadIndex, isTearing, isFlipping, flipDirection, goToNextSpread, goToPrevSpread } = useJournal();
  const [activeMobileTab, setActiveMobileTab] = useState('left');

  const { setAuthMode, setAuthModalOpen } = useAuth();

  if (!currentBook) {
    return (
      <div className="flex flex-col md:flex-row items-center justify-center min-h-[70vh] gap-12 px-4 animate-scale-in">

        {/* Render the actual BookCover at full size so it acts as the primary aesthetic element */}
        <div className="w-full max-w-[480px] shrink-0 cursor-pointer">
          <BookCover isPreview={true} />
        </div>

        <div className="text-center md:text-left max-w-md">
          <h1 className="font-serifTitle text-4xl md:text-5xl mb-4" style={{ color: 'var(--text-primary)' }}>
            Digital Commonplace Book
          </h1>
          <p className="font-serifHeading italic text-base md:text-lg mb-8" style={{ color: 'var(--text-secondary)' }}>
            A private, aesthetic space to collect your thoughts, marginalia, quotes, and memories.
          </p>
          <div className="flex items-center justify-center md:justify-start gap-4">
            <button
              onClick={() => { setAuthMode('login'); setAuthModalOpen(true); }}
              className="px-6 py-2.5 rounded-[10px] text-sm font-medium transition-all"
              style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--surface-2)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent'; }}
            >
              Sign In
            </button>
            <button
              onClick={() => { setAuthMode('signup'); setAuthModalOpen(true); }}
              className="px-6 py-2.5 rounded-[10px] text-sm font-medium transition-all shadow-xl"
              style={{ background: 'var(--accent)', color: '#fff' }}
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentSpreadIndex === 0) {
    return <BookCover />;
  }

  const currentSpread = currentBook.spreads[currentSpreadIndex - 1];
  if (!currentSpread) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 animate-fade-in-delayed">
        <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>No pages in this spread.</p>
      </div>
    );
  }

  const NavButton = ({ direction, onClick, disabled }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`absolute top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center transition-all disabled:opacity-0 disabled:pointer-events-none z-30 ${!disabled ? 'hover:scale-110' : ''}`}
      style={{
        [direction === 'left' ? 'left' : 'right']: '-20px',
        background: 'rgba(10,10,15,0.8)',
        backdropFilter: 'blur(12px)',
        border: '1px solid var(--border-hover)',
        color: 'var(--text-secondary)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
      }}
      onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
    >
      {direction === 'left' ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
    </button>
  );

  return (
    <div className={`relative w-full max-w-5xl mx-auto px-4 py-6 md:py-8 ${isTearing ? 'animate-page-tear pointer-events-none' : ''}`}>

      {/* DESKTOP: Two-page spread */}
      <div
        className="hidden md:grid md:grid-cols-2 gap-0 relative rounded-[20px] overflow-hidden perspective-1000"
        style={{
          boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
        }}
      >
        {/* Spine divider */}
        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-6 spine-divider z-30 pointer-events-none" />

        {/* Left Page */}
        <div className="rounded-l-[20px] overflow-hidden">
          <PageContent page={currentSpread.leftPage} side="left" />
        </div>

        {/* Right Page */}
        <div className="rounded-r-[20px] overflow-hidden">
          <PageContent page={currentSpread.rightPage} side="right" />
        </div>

        {/* 3D Flip overlays (preserved exactly) */}
        {isFlipping && flipDirection === 'next' && (
          <div className="absolute top-0 right-0 w-1/2 h-full z-40 origin-left animate-single-page-next overflow-hidden rounded-r-[20px] pointer-events-none shadow-2xl">
            <PageContent page={currentSpread.rightPage} side="right" />
          </div>
        )}
        {isFlipping && flipDirection === 'prev' && (
          <div className="absolute top-0 left-0 w-1/2 h-full z-40 origin-right animate-single-page-prev overflow-hidden rounded-l-[20px] pointer-events-none shadow-2xl">
            <PageContent page={currentSpread.leftPage} side="left" />
          </div>
        )}
      </div>

      {/* MOBILE: Single page view */}
      <div className={`block md:hidden rounded-[16px] overflow-hidden ${isFlipping ? (flipDirection === 'next' ? 'animate-single-page-next' : 'animate-single-page-prev') : ''}`}
        style={{ boxShadow: '0 12px 40px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex text-xs border-b" style={{ background: 'var(--surface-2)', borderColor: 'var(--border)' }}>
          <button
            onClick={() => setActiveMobileTab('left')}
            className="flex-1 py-2.5 font-medium transition-colors"
            style={{ color: activeMobileTab === 'left' ? 'var(--text-primary)' : 'var(--text-tertiary)', borderBottom: activeMobileTab === 'left' ? '2px solid var(--accent)' : '2px solid transparent' }}
          >
            Page {currentSpread.leftPage.pageNumber}
          </button>
          <button
            onClick={() => setActiveMobileTab('right')}
            className="flex-1 py-2.5 font-medium transition-colors"
            style={{ color: activeMobileTab === 'right' ? 'var(--text-primary)' : 'var(--text-tertiary)', borderBottom: activeMobileTab === 'right' ? '2px solid var(--accent)' : '2px solid transparent' }}
          >
            Page {currentSpread.rightPage.pageNumber}
          </button>
        </div>
        <PageContent
          page={activeMobileTab === 'left' ? currentSpread.leftPage : currentSpread.rightPage}
          side={activeMobileTab}
        />
      </div>

      {/* Navigation Arrows */}
      <NavButton direction="left" onClick={goToPrevSpread} disabled={currentSpreadIndex === 0} />
      <NavButton direction="right" onClick={goToNextSpread} disabled={currentSpreadIndex >= currentBook.spreads.length} />
    </div>
  );
};
