import React from 'react';
import { useJournal } from '../../context/JournalContext';

export const TearAnimationOverlay = () => {
  const { isTearing } = useJournal();

  if (!isTearing) return null;

  // Generate 16 random physical paper scrap shreds
  const scraps = Array.from({ length: 16 }).map((_, i) => {
    const left = 35 + (i * 4) % 30; // Random starting near spine
    const delay = (i * 0.03).toFixed(2);
    const duration = (0.5 + Math.random() * 0.35).toFixed(2);
    const rotation = Math.floor(Math.random() * 360);
    const width = 12 + Math.floor(Math.random() * 20);
    const height = 16 + Math.floor(Math.random() * 30);

    return { id: i, left, delay, duration, rotation, width, height };
  });

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {scraps.map((s) => (
        <div
          key={s.id}
          className="absolute bg-[#f7f2e6] border border-[#d6c8b0] shadow-lg rounded-xs opacity-90 animate-scrap-fall"
          style={{
            left: `${s.left}%`,
            top: '20%',
            width: `${s.width}px`,
            height: `${s.height}px`,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
            transform: `rotate(${s.rotation}deg)`
          }}
        />
      ))}
    </div>
  );
};
