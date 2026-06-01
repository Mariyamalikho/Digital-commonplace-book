import React, { useEffect } from 'react';
import { useJournal } from '../../context/JournalContext';

export const NavigationDots = () => {
  const { currentBook, currentSpreadIndex, goToSpread, goToNextSpread, goToPrevSpread } = useJournal();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
      if (e.key === 'ArrowLeft') goToPrevSpread();
      else if (e.key === 'ArrowRight') goToNextSpread();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNextSpread, goToPrevSpread]);

  if (!currentBook) return null;

  const totalDots = currentBook.spreads.length + 1; // +1 for cover

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
      <div
        className="flex items-center gap-1.5 px-3 py-2 rounded-full"
        style={{
          background: 'rgba(10,10,15,0.8)',
          backdropFilter: 'blur(16px)',
          border: '1px solid var(--border)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        }}
      >
        {Array.from({ length: totalDots }).map((_, idx) => {
          const isActive = currentSpreadIndex === idx;
          return (
            <button
              key={idx}
              onClick={() => goToSpread(idx)}
              title={idx === 0 ? 'Cover' : `Spread ${idx}`}
              className="transition-all duration-200"
              style={{
                width: isActive ? '20px' : '6px',
                height: '6px',
                borderRadius: '3px',
                background: isActive ? 'var(--accent)' : 'rgba(255,255,255,0.2)',
              }}
            />
          );
        })}
      </div>
    </div>
  );
};
