import React from 'react';

/**
 * BookSkeleton Component
 * Renders an artisanal book spread skeleton loader during asynchronous transitions.
 * Preserves the exact physical proportions of the book to eliminate cumulative layout shift (CLS).
 */
export const BookSkeleton = () => {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 flex flex-col items-center justify-center animate-pulse select-none">
      <div 
        className="w-full rounded-r-[16px] rounded-l-[4px] border overflow-hidden flex flex-col md:flex-row aspect-[3/4] md:aspect-[3/2] shadow-2xl"
        style={{
          background: 'var(--surface-1)',
          borderColor: 'var(--border)'
        }}
      >
        {/* Left Page Skeleton */}
        <div 
          className="flex-1 p-6 md:p-10 flex flex-col justify-between border-b md:border-b-0 md:border-r"
          style={{ background: 'var(--parchment)', borderColor: 'var(--parchment-line)' }}
        >
          <div className="space-y-4">
            {/* Date line */}
            <div className="w-28 h-3 rounded" style={{ background: 'var(--parchment-line)', opacity: 0.7 }} />
            {/* Title line */}
            <div className="w-3/4 h-6 rounded" style={{ background: 'var(--parchment-line)', opacity: 0.9 }} />
            {/* Body lines */}
            <div className="space-y-3 pt-4">
              <div className="w-full h-3 rounded" style={{ background: 'var(--parchment-line)', opacity: 0.5 }} />
              <div className="w-11/12 h-3 rounded" style={{ background: 'var(--parchment-line)', opacity: 0.5 }} />
              <div className="w-4/5 h-3 rounded" style={{ background: 'var(--parchment-line)', opacity: 0.5 }} />
              <div className="w-9/12 h-3 rounded" style={{ background: 'var(--parchment-line)', opacity: 0.5 }} />
              <div className="w-2/3 h-3 rounded" style={{ background: 'var(--parchment-line)', opacity: 0.5 }} />
            </div>
          </div>
          {/* Footer page number */}
          <div className="w-12 h-2 rounded self-start" style={{ background: 'var(--parchment-line)', opacity: 0.5 }} />
        </div>

        {/* Book Spine Divider */}
        <div className="hidden md:block w-3 spine-divider shrink-0" />

        {/* Right Page Skeleton */}
        <div 
          className="flex-1 p-6 md:p-10 flex flex-col justify-between"
          style={{ background: 'var(--parchment)' }}
        >
          <div className="space-y-4">
            <div className="w-28 h-3 rounded" style={{ background: 'var(--parchment-line)', opacity: 0.7 }} />
            <div className="w-2/3 h-6 rounded" style={{ background: 'var(--parchment-line)', opacity: 0.9 }} />
            <div className="space-y-3 pt-4">
              <div className="w-full h-3 rounded" style={{ background: 'var(--parchment-line)', opacity: 0.5 }} />
              <div className="w-5/6 h-3 rounded" style={{ background: 'var(--parchment-line)', opacity: 0.5 }} />
              <div className="w-4/5 h-3 rounded" style={{ background: 'var(--parchment-line)', opacity: 0.5 }} />
              <div className="w-3/4 h-3 rounded" style={{ background: 'var(--parchment-line)', opacity: 0.5 }} />
            </div>
          </div>
          <div className="w-12 h-2 rounded self-end" style={{ background: 'var(--parchment-line)', opacity: 0.5 }} />
        </div>
      </div>
    </div>
  );
};
