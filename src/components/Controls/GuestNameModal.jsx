import React, { useState } from 'react';
import { useJournal } from '../../context/JournalContext';
import { Edit3 } from 'lucide-react';

export const GuestNameModal = () => {
  const { guestRole, guestName, setGuestName } = useJournal();
  const [nameInput, setNameInput] = useState('');

  // Only show this modal if they are a Guest Editor and haven't set their name yet
  const shouldShow = guestRole === 'editor' && !guestName;

  if (!shouldShow) return null;

  const handleSave = () => {
    if (nameInput.trim()) {
      setGuestName(nameInput.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
      <div
        className="rounded-2xl max-w-sm w-full p-8 md:p-10 shadow-[0_25px_60px_rgba(0,0,0,0.9)] relative flex flex-col items-center text-center border animate-scale-in"
        style={{
          backgroundColor: 'var(--theme-card-bg)',
          borderColor: 'var(--theme-card-border)',
          color: 'var(--theme-text-accent)'
        }}
      >
        <div className="w-12 h-12 rounded-full mb-4 flex items-center justify-center shadow-lg" style={{ backgroundColor: 'var(--theme-accent)', color: '#fff' }}>
          <Edit3 size={24} />
        </div>

        <h2 className="font-serifTitle text-2xl font-normal tracking-wide mb-2">
          Welcome, Guest Editor!
        </h2>
        <p className="font-serifHeading italic text-sm opacity-80 mb-6 leading-relaxed">
          You've been invited to edit this journal. Please enter your name so others know who is leaving notes.
        </p>

        <input
          autoFocus
          type="text"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          placeholder="Your Name"
          className="w-full bg-transparent border-b-2 py-2 text-center text-lg font-bold outline-none transition-colors mb-6 placeholder:opacity-40"
          style={{ borderColor: 'var(--theme-card-border)', color: '#fff' }}
          onFocus={(e) => e.target.style.borderColor = 'var(--theme-accent)'}
          onBlur={(e) => e.target.style.borderColor = 'var(--theme-card-border)'}
        />

        <button
          onClick={handleSave}
          disabled={!nameInput.trim()}
          className="w-full py-3.5 font-serifHeading italic text-lg rounded-xl transition-all font-bold disabled:opacity-50 text-white"
          style={{ backgroundColor: 'var(--theme-accent)' }}
          onMouseEnter={e => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = 'var(--theme-accent-hover)')}
          onMouseLeave={e => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = 'var(--theme-accent)')}
        >
          Enter Journal
        </button>
      </div>
    </div>
  );
};
