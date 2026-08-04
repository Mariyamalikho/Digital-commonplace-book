import React, { useState } from 'react';
import { Share2, Copy, Check, X, Eye, Edit3 } from 'lucide-react';
import { useJournal } from '../../context/JournalContext';

export const ShareModal = () => {
  const { currentBook, shareModalOpen, setShareModalOpen, createShareToken } = useJournal();
  const [role, setRole] = useState('visitor');
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!shareModalOpen || !currentBook) return null;

  const handleGenerateLink = async () => {
    setIsGenerating(true);
    const token = await createShareToken(role);
    if (token) {
      const baseUrl = window.location.origin + window.location.pathname;
      setGeneratedLink(`${baseUrl}?invite=${token}`);
    }
    setIsGenerating(false);
  };

  const handleCopy = () => {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
      <div
        className="rounded-2xl max-w-md w-full p-8 shadow-[0_25px_60px_rgba(0,0,0,0.9)] relative flex flex-col items-center text-center border"
        style={{
          backgroundColor: 'var(--theme-card-bg)',
          borderColor: 'var(--theme-card-border)',
          color: 'var(--theme-text-accent)'
        }}
      >
        <button aria-label="Close modal"
          onClick={() => setShareModalOpen(false)}
          className="absolute top-4 right-4 opacity-60 hover:opacity-100 transition-opacity"
        >
          <X size={18} />
        </button>

        <div className="text-sm mb-2" style={{ color: 'var(--theme-accent)' }}>✦</div>

        <h2 className="font-serifTitle text-2xl font-bold tracking-wide mb-1">
          Share Journal Access
        </h2>
        <p className="font-serifHeading italic text-sm opacity-90 mb-5">
          Generate an invite link for <strong>{currentBook.title}</strong> (Valid 30 days)
        </p>

        {/* Role Selector */}
        <div className="w-full space-y-3 mb-5 text-left font-serifHeading">
          <label className="block italic text-sm font-semibold text-white">Select Permission Role</label>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <button
              onClick={() => setRole('visitor')}
              className="p-3.5 rounded-xl border-2 text-left flex flex-col justify-between transition-all relative overflow-hidden"
              style={{
                backgroundColor: role === 'visitor' ? 'var(--theme-card-bg)' : 'var(--theme-bg-darkest)',
                borderColor: role === 'visitor' ? 'var(--theme-accent)' : 'var(--theme-card-border)',
                opacity: role === 'visitor' ? 1 : 0.6,
              }}
            >
              {role === 'visitor' && (
                <div className="absolute inset-0 opacity-10" style={{ backgroundColor: 'var(--theme-accent)' }} />
              )}
              <div className="flex items-center space-x-1.5 font-bold text-sm relative z-10" style={{ color: role === 'visitor' ? 'var(--theme-text-accent)' : '#fff' }}>
                <Eye size={16} />
                <span>Visitor</span>
              </div>
              <span className="text-[11px] mt-1.5 relative z-10" style={{ color: role === 'visitor' ? 'var(--theme-text-accent)' : '#fff', opacity: 0.8 }}>
                Read-only browsing. Cannot edit or comment.
              </span>
            </button>

            <button
              onClick={() => setRole('editor')}
              className="p-3.5 rounded-xl border-2 text-left flex flex-col justify-between transition-all relative overflow-hidden"
              style={{
                backgroundColor: role === 'editor' ? 'var(--theme-card-bg)' : 'var(--theme-bg-darkest)',
                borderColor: role === 'editor' ? 'var(--theme-accent)' : 'var(--theme-card-border)',
                opacity: role === 'editor' ? 1 : 0.6,
              }}
            >
              {role === 'editor' && (
                <div className="absolute inset-0 opacity-10" style={{ backgroundColor: 'var(--theme-accent)' }} />
              )}
              <div className="flex items-center space-x-1.5 font-bold text-sm relative z-10" style={{ color: role === 'editor' ? 'var(--theme-text-accent)' : '#fff' }}>
                <Edit3 size={16} />
                <span>Editor</span>
              </div>
              <span className="text-[11px] mt-1.5 relative z-10" style={{ color: role === 'editor' ? 'var(--theme-text-accent)' : '#fff', opacity: 0.8 }}>
                Can view pages & add/remove sticky notes.
              </span>
            </button>
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerateLink}
          disabled={isGenerating}
          className="w-full py-3.5 font-serifHeading italic text-lg rounded-xl transition-all font-bold border-2 text-white hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
          style={{
            backgroundColor: 'var(--theme-bg-darkest)',
            borderColor: 'var(--theme-accent)'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = 'var(--theme-accent)';
            e.currentTarget.style.color = '#fff';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = 'var(--theme-bg-darkest)';
            e.currentTarget.style.color = '#fff';
          }}
        >
          {isGenerating ? 'Generating...' : `Generate ${role === 'editor' ? 'Editor' : 'Visitor'} Invite Link`}
        </button>

        {/* Generated Link Display */}
        {generatedLink && (
          <div className="w-full p-4 border-2 rounded-xl space-y-2 text-left shadow-lg mt-4" style={{ backgroundColor: 'var(--theme-bg-darkest)', borderColor: 'var(--theme-accent)' }}>
            <label className="block text-xs font-mono uppercase tracking-widest text-white font-bold">Invite Link</label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value={generatedLink}
                className="flex-grow border-2 px-3 py-2.5 rounded-lg text-sm font-mono select-all focus:outline-none"
                style={{ backgroundColor: 'var(--theme-card-bg)', borderColor: 'var(--theme-card-border)', color: 'var(--theme-text-accent)' }}
              />
              <button
                onClick={handleCopy}
                className="px-4 py-2.5 font-bold rounded-lg flex items-center space-x-1.5 transition-colors text-sm shadow-md"
                style={{ backgroundColor: 'var(--theme-accent)', color: '#fff' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--theme-accent-hover)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--theme-accent)'}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
