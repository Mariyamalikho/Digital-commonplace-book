import React, { useState, useEffect } from 'react';
import { PenTool, Globe } from 'lucide-react';
import { useJournal } from '../../context/JournalContext';
import { PageCanvas } from './PageCanvas';
import { EditorNotes } from './EditorNotes';
import { MediaUploader, ResizableMediaItem } from './MediaUploader';
import { VoiceRecorderWidget, VoiceNotePlayer } from './VoiceRecorder';
import { useDebouncedCallback } from '../../hooks/useDebounce';
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
  const [localTitle, setLocalTitle] = useState(page?.title || '');
  const [localContent, setLocalContent] = useState(page?.content || '');
  const [localDate, setLocalDate] = useState(page?.date || '');

  useEffect(() => {
    setIsUrduMode(page?.isUrduMode || false);
    setLocalTitle(page?.title || '');
    setLocalContent(page?.content || '');
    setLocalDate(page?.date || '');
  }, [page?.id, page?.isUrduMode, page?.title, page?.content, page?.date]);

  // Debounced database updates (350ms) to ensure smooth 60fps typing without spamming network/state
  const debouncedUpdate = useDebouncedCallback((updates) => {
    if (!canWrite || !page?.id) return;
    updatePage(page.id, updates);
  }, 350);

  if (!page) return null;

  // Derive accent from cover theme
  const themeKey = currentBook?.cover?.theme || 'dark-academia';
  const accent = THEME_ACCENTS[themeKey] || '#c49b45';
  const accentLight = `${accent}16`;
  const accentBorder = `${accent}35`;

  const handleTextChange = (e) => {
    const val = e.target.value;
    setLocalContent(val);
    debouncedUpdate({ content: val });
  };

  const handleTitleChange = (e) => {
    const val = e.target.value;
    setLocalTitle(val);
    debouncedUpdate({ title: val });
  };

  const handleDateChange = (e) => {
    const val = e.target.value;
    setLocalDate(val);
    debouncedUpdate({ date: val });
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
    : (side === 'left' ? 'A thought, an observation, an excerpt...' : 'Notes, citations, or reflections...');

  return (
    <div
      className="relative aspect-[3/4] p-5 pb-[22px] md:p-8 md:pb-[34px] lined-paper flex flex-col justify-between overflow-hidden"
      style={{ 
        color: 'var(--ink-mid)', 
        boxShadow: side === 'left' 
          ? 'inset -24px 0 40px -15px rgba(0,0,0,0.15), inset 0 0 40px rgba(0,0,0,0.03)'
          : 'inset 24px 0 40px -15px rgba(0,0,0,0.15), inset 0 0 40px rgba(0,0,0,0.03)'
      }}
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
              value={localDate}
              onChange={handleDateChange}
              className="bg-transparent text-[12px] uppercase tracking-wider focus:outline-none w-full font-serifHeading"
              style={{ color: 'var(--ink-light)' }}
            />
          ) : (
            <span className="text-[12px] uppercase tracking-wider font-serifHeading" style={{ color: 'var(--ink-light)' }}>
              {localDate}
            </span>
          )}
        </div>

        {/* Right controls: Draw + ENG/Urdu toggle */}
        <div className="flex items-center gap-1.5 font-ui">
          {canDraw && (
            <button
              onClick={handleStartDrawing}
              className="flex items-center gap-1 px-2.5 py-1 rounded-[6px] text-[11px] font-medium transition-all active:scale-95 z-30"
              style={{ background: accentLight, color: accent, border: `1px solid ${accentBorder}` }}
              title="Draw on page"
            >
              <PenTool size={11} strokeWidth={1.5} />
              <span>Draw</span>
            </button>
          )}

          {/* Urdu / ENG toggle */}
          <button
            onClick={toggleUrduMode}
            className="flex items-center gap-1 px-2.5 py-1 rounded-[6px] text-[11px] font-medium transition-all"
            style={isUrduMode
              ? { background: accentLight, color: accent, border: `1px solid ${accentBorder}` }
              : { background: 'rgba(0,0,0,0.06)', color: 'var(--ink-light)', border: '1px solid var(--parchment-line)' }
            }
            title="Toggle Urdu / English script"
          >
            <Globe size={11} />
            <span>{isUrduMode ? 'اردو' : 'ENG'}</span>
          </button>
        </div>
      </div>

      {/* ── SCROLLABLE CONTENT ── */}
      <div className="relative z-20 flex-grow flex flex-col my-1 overflow-y-auto pr-1 space-y-2">
        {/* Title */}
        <div className="border-b pb-2 shrink-0" style={{ borderColor: 'var(--parchment-line)' }}>
          {canWrite ? (
            <input
              type="text"
              dir={isUrduMode ? 'rtl' : 'auto'}
              value={localTitle}
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
              {localTitle || (isUrduMode ? 'عنوان' : 'Untitled Entry')}
            </h2>
          )}
        </div>

        {/* Body textarea */}
        <div className="flex-grow flex flex-col min-h-[140px]">
          {canWrite ? (
            <textarea
              dir={isUrduMode ? 'rtl' : 'auto'}
              value={localContent}
              onChange={handleTextChange}
              placeholder={placeholder}
              className={`w-full flex-grow bg-transparent text-base md:text-lg leading-[2.1rem] resize-none focus:outline-none placeholder:italic ${
                isUrduMode ? 'font-urdu text-right font-medium' : 'font-serifHeading italic'
              }`}
              style={{ color: 'var(--ink-dark)' }}
            />
          ) : (
            <div
              dir={isUrduMode ? 'rtl' : 'auto'}
              className={`w-full flex-grow text-base md:text-lg leading-[2.1rem] whitespace-pre-wrap ${
                isUrduMode ? 'font-urdu text-right font-medium' : 'font-serifHeading italic'
              }`}
              style={{ color: 'var(--ink-dark)' }}
            >
              {localContent || <span style={{ color: 'var(--ink-light)', fontStyle: 'italic' }}>{placeholder}</span>}
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
      <div className="relative z-20 space-y-2 mt-2 shrink-0 font-ui">
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
        <span className="text-[12px] font-serifHeading">
          Page {page.pageNumber}
        </span>
        {canDraw && (
          <button
            onClick={handleStartDrawing}
            className="w-7 h-7 rounded-[6px] flex items-center justify-center transition-all hover:scale-105 active:scale-95 z-30"
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
