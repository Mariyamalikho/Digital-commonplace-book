import React, { useState } from 'react';
import { X, Check, Type, Lock, Sparkles } from 'lucide-react';
import { useJournal } from '../../context/JournalContext';

const THEMES = {
  midnight:      { label: 'Midnight',      gradient: 'linear-gradient(135deg, #1a1040 0%, #0a0820 100%)', accent: '#6c63ff', color: '#110d28' },
  sand:          { label: 'Sand',           gradient: 'linear-gradient(135deg, #2a1f0e 0%, #16100a 100%)', accent: '#c9a96e', color: '#1f1508' },
  emerald:       { label: 'Emerald',        gradient: 'linear-gradient(135deg, #0d2820 0%, #071510 100%)', accent: '#34d399', color: '#0a1f18' },
  obsidian:      { label: 'Obsidian',       gradient: 'linear-gradient(135deg, #1c1c1c 0%, #0a0a0a 100%)', accent: '#a0a0a0', color: '#141414' },
  royal:         { label: 'Royal',          gradient: 'linear-gradient(135deg, #1c0e3a 0%, #0e0720 100%)', accent: '#9f7aea', color: '#160a30' },
  'dark-academia':{ label: 'Dark Academia', gradient: 'linear-gradient(135deg, #261d0e 0%, #140e06 100%)', accent: '#c8a96e', color: '#1c1408' },
};

const FONTS = [
  { id: 'DM Serif Display', label: 'DM Serif (Elegant)' },
  { id: 'EB Garamond',      label: 'EB Garamond (Academic)' },
  { id: 'Cormorant Garamond', label: 'Cormorant (Literary)' },
  { id: 'Caveat',           label: 'Caveat (Handwriting)' },
  { id: 'Noto Nastaliq Urdu', label: 'Nastaliq (Urdu)' },
];

const PATTERNS = [
  { id: 'none',       label: 'Solid Color' },
  { id: 'noise',      label: 'Classic Paper' },
  { id: 'dots',       label: 'Polka Dots' },
  { id: 'grid',       label: 'Fine Grid' },
  { id: 'stripes',    label: 'Diagonal Stripes' },
  { id: 'crosshatch', label: 'Crosshatch' },
];

export const CoverCustomizerModal = () => {
  const { currentBook, updateCover, updateJournalTitle, saveCurrentBookState, coverCustomizerOpen, setCoverCustomizerOpen } = useJournal();

  if (!coverCustomizerOpen || !currentBook) return null;

  const cv = currentBook.cover || {};
  const [title, setTitle]           = useState(currentBook.title || '');
  const [subtitle, setSubtitle]     = useState(currentBook.subtitle || '');
  const [theme, setTheme]           = useState(cv.theme || 'midnight');
  const [customColor, setCustomColor] = useState(cv.color || THEMES[cv.theme || 'midnight'].color);
  const [ribbonColor, setRibbonColor] = useState(cv.ribbonColor || THEMES[cv.theme || 'midnight'].accent);
  const [font, setFont]             = useState(cv.font || 'DM Serif Display');
  const [pattern, setPattern]       = useState(cv.pattern || 'noise');
  const [privacy, setPrivacy]       = useState(currentBook.privacy || 'private');

  const selectedTheme = THEMES[theme];
  const previewBg = `linear-gradient(145deg, ${customColor}f0 0%, ${customColor}99 100%)`;

  const applyThemePreset = (key) => {
    const t = THEMES[key];
    setTheme(key);
    setCustomColor(t.color);
    setRibbonColor(t.accent);
  };

  const handleSave = () => {
    updateJournalTitle(title, subtitle);
    updateCover({ theme, color: customColor, ribbonColor, font, pattern });
    saveCurrentBookState({ ...currentBook, title, subtitle, privacy, cover: { ...cv, theme, color: customColor, ribbonColor, font, pattern } }, false);
    setCoverCustomizerOpen(false);
  };

  return (
    <div className="modal-overlay" onClick={() => setCoverCustomizerOpen(false)}>
      <div
        className="modal-panel w-full max-w-2xl p-0 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex h-full min-h-[500px]">
          {/* Live Preview Panel */}
          <div
            className="hidden md:flex w-48 flex-col items-center justify-center p-6 gap-4 shrink-0 relative overflow-hidden"
            style={{ background: previewBg }}
          >
            <div className={`absolute inset-0 pointer-events-none pattern-${pattern}`} style={{ opacity: 0.3 }} />
            <div className="w-full h-1 rounded-full" style={{ background: ribbonColor }} />
            <p className="font-display text-white/90 text-sm text-center leading-snug" style={{ fontFamily: font }}>
              {title || 'Journal'}
            </p>
            <p className="text-xs text-white/40 text-center tracking-widest uppercase">
              {subtitle || 'A Commonplace'}
            </p>
            <div className="w-6 h-px" style={{ background: `${ribbonColor}88` }} />
            {/* Ribbon preview */}
            <div className="absolute top-0 right-4 w-3 h-10"
              style={{ background: ribbonColor, clipPath: 'polygon(0 0, 100% 0, 100% 85%, 50% 100%, 0 85%)', opacity: 0.9 }} />
          </div>

          {/* Controls Panel */}
          <div className="flex-1 p-6 overflow-y-auto" style={{ background: 'var(--surface-1)' }}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display text-xl" style={{ color: 'var(--text-primary)' }}>Customize Cover</h2>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>Style your journal's appearance</p>
              </div>
              <button onClick={() => setCoverCustomizerOpen(false)} className="btn-ghost w-8 h-8 rounded-[8px] flex items-center justify-center">
                <X size={16} style={{ color: 'var(--text-secondary)' }} />
              </button>
            </div>

            <div className="space-y-5">
              {/* Title & Subtitle */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Title</label>
                  <input className="input-field text-sm" value={title} onChange={e => setTitle(e.target.value)} placeholder="My Journal" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Subtitle</label>
                  <input className="input-field text-sm" value={subtitle} onChange={e => setSubtitle(e.target.value)} placeholder="A Commonplace" />
                </div>
              </div>

              {/* Theme Presets */}
              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  <Sparkles size={11} className="inline mr-1" />
                  Theme Preset
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(THEMES).map(([key, conf]) => (
                    <button
                      key={key}
                      onClick={() => applyThemePreset(key)}
                      className="relative p-2.5 rounded-[10px] text-left transition-all border"
                      style={{
                        background: conf.gradient,
                        borderColor: theme === key ? conf.accent : 'rgba(255,255,255,0.06)',
                        boxShadow: theme === key ? `0 0 0 2px ${conf.accent}33` : 'none',
                      }}
                    >
                      <div className="w-4 h-0.5 rounded mb-1.5" style={{ background: conf.accent }} />
                      <span className="text-[11px] text-white/75 font-medium">{conf.label}</span>
                      {theme === key && (
                        <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center"
                          style={{ background: conf.accent }}>
                          <Check size={9} className="text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cover Color + Ribbon */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Cover Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={customColor}
                      onChange={e => setCustomColor(e.target.value)}
                      className="w-8 h-8 rounded-[6px] border cursor-pointer"
                      style={{ borderColor: 'var(--border)' }}
                    />
                    <span className="text-xs font-mono" style={{ color: 'var(--text-tertiary)' }}>{customColor}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Ribbon Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={ribbonColor}
                      onChange={e => setRibbonColor(e.target.value)}
                      className="w-8 h-8 rounded-[6px] border cursor-pointer"
                      style={{ borderColor: 'var(--border)' }}
                    />
                    <span className="text-xs font-mono" style={{ color: 'var(--text-tertiary)' }}>{ribbonColor}</span>
                  </div>
                </div>
              </div>

              {/* Font */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                    <Type size={11} className="inline mr-1" />
                    Typography
                  </label>
                  <select
                    value={font}
                    onChange={e => setFont(e.target.value)}
                    className="input-field text-sm"
                  >
                    {FONTS.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                    <Sparkles size={11} className="inline mr-1" />
                    Cover Pattern
                  </label>
                  <select
                    value={pattern}
                    onChange={e => setPattern(e.target.value)}
                    className="input-field text-sm"
                  >
                    {PATTERNS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Privacy */}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  <Lock size={11} className="inline mr-1" />
                  Privacy
                </label>
                <select
                  value={privacy}
                  onChange={e => setPrivacy(e.target.value)}
                  className="input-field text-sm"
                >
                  <option value="private">Private — Owner only</option>
                  <option value="password">Password Protected</option>
                  <option value="link">Shared by Link</option>
                  <option value="public">Public</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setCoverCustomizerOpen(false)} className="btn btn-secondary flex-1">Cancel</button>
                <button onClick={handleSave} className="btn btn-primary flex-1" style={{ background: 'var(--accent)' }}>
                  <Check size={14} /> Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
