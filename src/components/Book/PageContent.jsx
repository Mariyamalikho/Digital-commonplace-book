import React, { useState } from 'react';
import { PenTool, Globe } from 'lucide-react';
import { useJournal } from '../../context/JournalContext';
import { PageCanvas } from './PageCanvas';
import { EditorNotes } from './EditorNotes';
import { MediaUploader, ResizableMediaItem } from './MediaUploader';
import { VoiceRecorderWidget, VoiceNotePlayer } from './VoiceRecorder';

import { THEME_ACCENTS } from '../../utils/constants';

export const PageContent = ({ page, side = 'left' }) => {
  const {
    updatePage,
    canWrite,
    canDraw,
    isDrawingMode,
    setIsDrawingMode,
    activeDrawingPage,
    setActiveDrawingPage,
    drawingColor,
    brushSize,
    currentBook,
  } = useJournal();

  const [isUrduMode, setIsUrduMode] = useState(page?.isUrduMode || false);

  if (!page) return null;

  // Derive accent from cover theme
  const themeKey = currentBook?.cover?.theme || 'midnight';
  const accent = THEME_ACCENTS[themeKey] || '#6c63ff';
  const accentLight = `${accent}18`;
  const accentBorder = `${accent}30`;

  const handleTextChange = (e) => {
    if (!canWrite) return;
    updatePage(page.id, { content: e.target.value });
  };

  const handleTitleChange = (e) => {
    if (!canWrite) return;
    updatePage(page.id, { title: e.target.value });
  };

  const handleDateChange = (e) => {
    if (!canWrite) return;
    updatePage(page.id, { date: e.target.value });
  };

  const toggleUrduMode = () => {
    const next = !isUrduMode;
    setIsUrduMode(next);
    if (canWrite) updatePage(page.id, { isUrduMode: next });
  };

  const handleStartDrawing = () => {
    setIsDrawingMode(true);
    setActiveDrawingPage(side);
  };

  const handleCloseDrawing = () => {
    setIsDrawingMode(false);
    setActiveDrawingPage(null);
  };

  const handleSaveDrawing = (dataUrl) => {
    updatePage(page.id, { drawing: dataUrl });
  };

  const isCurrentDrawingPage = isDrawingMode && activeDrawingPage === side;

  const placeholder = isUrduMode
    ? 'اپنے خیالات، اقتباسات یا یادداشتیں یہاں لکھیں۔۔۔'
    : (side === 'left' ? 'A thought, a fragment, a dream...' : 'What caught your eye today?');

  return (
    <div
      className="relative h-[580px] md:h-[640px] max-h-[640px] p-5 pb-[22px] md:p-8 md:pb-[34px] lined-paper flex flex-col justify-between overflow-hidden"
      style={{ color: 'var(--ink-mid)', boxShadow: 'inset 0 0 40px rgba(0,0,0,0.03)' }}
    >
      {/* Saved drawing layer */}
      {page.drawing && (
        <img
          src={page.drawing}
          alt="Page drawing"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none z-10 opacity-95"
        />
      )}

      {/* Active drawing canvas */}
      {isCurrentDrawingPage && (
        <PageCanvas
          initialDrawing={page.drawing}
          onSaveDrawing={handleSaveDrawing}
          drawingColor={drawingColor}
          brushSize={brushSize}
          onClose={handleCloseDrawing}
          accent={accent}
        />
      )}

      {/* ── TOP HEADER ── */}
      <div className="relative z-20 flex justify-between items-center mb-2 shrink-0">
        {/* Date */}
        <div className="border-b pb-1 w-40" style={{ borderColor: 'var(--parchment-line)' }}>
          {canWrite ? (
            <input
              type="text"
              value={page.date || ''}
              onChange={handleDateChange}
              className="bg-transparent text-[11px] uppercase tracking-widest focus:outline-none w-full"
              style={{ color: 'var(--ink-light)', fontFamily: 'Inter, system-ui, sans-serif', letterSpacing: '0.12em' }}
            />
          ) : (
            <span className="text-[11px] uppercase tracking-widest" style={{ color: 'var(--ink-light)' }}>
              {page.date}
            </span>
          )}
        </div>

        {/* Right controls: Draw + ENG/Urdu toggle */}
        <div className="flex items-center gap-1.5">
          {canDraw && (
            <button
              onClick={handleStartDrawing}
              className="flex items-center gap-1 px-2.5 py-1 rounded-[8px] text-[11px] font-medium transition-all active:scale-95 z-30"
              style={{ background: accentLight, color: accent, border: `1px solid ${accentBorder}` }}
              title="Draw on page"
            >
              <PenTool size={11} strokeWidth={1.5} />
              <span>Draw</span>
            </button>
          )}

          {/* Urdu / ENG toggle — no toolbar, just switches dir */}
          <button
            onClick={toggleUrduMode}
            className="flex items-center gap-1 px-2.5 py-1 rounded-[8px] text-[11px] font-medium transition-all"
            style={isUrduMode
              ? { background: accentLight, color: accent, border: `1px solid ${accentBorder}` }
              : { background: 'rgba(0,0,0,0.06)', color: 'var(--ink-light)', border: '1px solid var(--parchment-line)' }
            }
            title="Toggle Urdu / English"
          >
            <Globe size={11} />
            <span>{isUrduMode ? 'اردو' : 'ENG'}</span>
          </button>
        </div>
      </div>

      {/* ── SCROLLABLE CONTENT ── */}
      <div className="relative z-20 flex-grow flex flex-col my-1 overflow-y-auto pr-1 space-y-2 max-h-[440px]">
        {/* Title */}
        <div className="border-b pb-2 shrink-0" style={{ borderColor: 'var(--parchment-line)' }}>
          {canWrite ? (
            <input
              type="text"
              dir={isUrduMode ? 'rtl' : 'auto'}
              value={page.title || ''}
              onChange={handleTitleChange}
              placeholder={isUrduMode ? 'عنوان...' : 'Untitled Entry'}
              className={`w-full bg-transparent text-xl md:text-2xl font-bold focus:outline-none placeholder:text-[#b0a090] ${
                isUrduMode ? 'font-urdu text-right leading-loose' : 'font-serifTitle'
              }`}
              style={{ color: 'var(--ink-dark)' }}
            />
          ) : (
            <h2
              dir={isUrduMode ? 'rtl' : 'auto'}
              className={`text-xl md:text-2xl font-bold ${isUrduMode ? 'font-urdu text-right leading-loose' : 'font-serifTitle'}`}
              style={{ color: 'var(--ink-dark)' }}
            >
              {page.title || (isUrduMode ? 'عنوان' : 'Untitled Entry')}
            </h2>
          )}
        </div>

        {/* Body textarea — NO Urdu letter toolbar */}
        <div className="flex-grow flex flex-col min-h-[140px]">
          {canWrite ? (
            <textarea
              dir={isUrduMode ? 'rtl' : 'auto'}
              value={page.content || ''}
              onChange={handleTextChange}
              placeholder={placeholder}
              className={`w-full flex-grow bg-transparent text-base md:text-lg leading-[2.2rem] resize-none focus:outline-none placeholder:italic ${
                isUrduMode ? 'font-urdu text-right font-medium' : 'font-serifHeading italic'
              }`}
              style={{ color: 'var(--ink-dark)', placeholderColor: 'var(--ink-light)' }}
            />
          ) : (
            <div
              dir={isUrduMode ? 'rtl' : 'auto'}
              className={`w-full flex-grow text-base md:text-lg leading-[2.2rem] whitespace-pre-wrap ${
                isUrduMode ? 'font-urdu text-right font-medium' : 'font-serifHeading italic'
              }`}
              style={{ color: 'var(--ink-dark)' }}
            >
              {page.content || <span style={{ color: 'var(--ink-light)', fontStyle: 'italic' }}>{placeholder}</span>}
            </div>
          )}
        </div>

        {/* Attached media */}
        {page.media && page.media.length > 0 && (
          <div className="my-2 flex flex-wrap gap-3 shrink-0">
            {page.media.map(m => (
              <ResizableMediaItem key={m.id} media={m} pageId={page.id} canWrite={canWrite} accent={accent} />
            ))}
          </div>
        )}

        {/* Voice notes */}
        {page.voiceNotes && page.voiceNotes.length > 0 && (
          <div className="my-2 space-y-2 shrink-0">
            {page.voiceNotes.map(n => (
              <VoiceNotePlayer key={n.id} note={n} pageId={page.id} canWrite={canWrite} accent={accent} />
            ))}
          </div>
        )}
      </div>

      {/* ── BOTTOM TOOLBAR ── */}
      <div className="relative z-20 space-y-2 mt-2 shrink-0">
        <div className="flex items-center gap-2">
          <MediaUploader pageId={page.id} accent={accent} />
          <VoiceRecorderWidget pageId={page.id} accent={accent} />
        </div>
        <div className="w-full mt-1">
          <EditorNotes pageId={page.id} notes={page.notes || []} accent={accent} />
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div className="relative z-20 flex items-center justify-between pt-2 shrink-0" style={{ color: 'var(--ink-light)' }}>
        <span className="text-[11px]" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
        </span>
        {canDraw && (
          <button
            onClick={handleStartDrawing}
            className="w-7 h-7 rounded-[8px] flex items-center justify-center transition-all hover:scale-105 active:scale-95 z-30"
            style={{ background: accentLight, color: accent, border: `1px solid ${accentBorder}` }}
            title="Draw on page"
          >
            <PenTool size={12} strokeWidth={1.5} />
          </button>
        )}
      </div>
    </div>
  );
};
