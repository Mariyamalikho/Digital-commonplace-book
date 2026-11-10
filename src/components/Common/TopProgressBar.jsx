import React from 'react';

/**
 * TopProgressBar Component
 * Minimalist, elegant antique-brass loading indicator mounted at the top viewport edge.
 */
export const TopProgressBar = ({ active = false }) => {
  if (!active) return null;

  return (
    <div 
      className="fixed top-0 left-0 right-0 z-[100] h-[2px] overflow-hidden pointer-events-none"
      style={{ background: 'rgba(196, 155, 69, 0.15)' }}
    >
      <div 
        className="h-full w-full origin-left animate-[loadingBar_1.4s_ease-in-out_infinite]"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, var(--accent) 50%, var(--accent-hover) 100%)',
          boxShadow: '0 0 8px var(--accent)'
        }}
      />
      <style>{`
        @keyframes loadingBar {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};
