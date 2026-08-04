import React, { useState } from 'react';
import { Paperclip, Upload, X, Trash2 } from 'lucide-react';
import { useJournal } from '../../context/JournalContext';
import { supabaseUploadMedia } from '../../services/supabaseService';

export const MediaUploader = ({ pageId, accent = '#6c63ff' }) => {
  const { addMediaToPage, canWrite } = useJournal();
  const [isOpen, setIsOpen] = useState(false);
  const [mediaType, setMediaType] = useState('image');
  const [mediaUrl, setMediaUrl] = useState('');
  const [caption, setCaption] = useState('');

  const accentLight = `${accent}15`;
  const accentMid   = `${accent}30`;
  const accentHover = `${accent}28`;

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const type = file.type.startsWith('video/') ? 'video' : 'image';
      const path = `${Date.now()}_${file.name}`;
      const url = await supabaseUploadMedia(file, path);

      addMediaToPage(pageId, {
        id: 'media-' + Date.now(),
        type,
        url,
        caption: file.name,
        width: 260,
      });
      setIsOpen(false);
      setMediaUrl('');
      setCaption('');
    } catch (err) {
      alert("Failed to upload: " + err.message);
    }
  };

  const handleUrlSubmit = (e) => {
    e.preventDefault();
    if (!mediaUrl.trim()) return;
    addMediaToPage(pageId, {
      id: 'media-' + Date.now(),
      type: mediaType,
      url: mediaUrl.trim(),
      caption: caption.trim() || (mediaType === 'image' ? 'Embedded Image' : 'Embedded Clip'),
      width: 260,
    });
    setIsOpen(false);
    setMediaUrl('');
    setCaption('');
  };

  if (!canWrite) return null;

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[11px] font-medium transition-all"
        style={{
          background: 'rgba(0,0,0,0.06)',
          border: '1px solid var(--parchment-line)',
          color: 'var(--ink-mid)',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = accentLight; e.currentTarget.style.color = accent; e.currentTarget.style.borderColor = accentMid; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.06)'; e.currentTarget.style.color = 'var(--ink-mid)'; e.currentTarget.style.borderColor = 'var(--parchment-line)'; }}
        title="Add Image or Video"
      >
        <Paperclip size={11} />
        <span>Add Image / Video</span>
      </button>

      {isOpen && (
        <div
          className="absolute left-0 bottom-full mb-2 w-68 rounded-[14px] shadow-2xl z-50 p-4 text-xs"
          style={{
            width: '272px',
            background: 'var(--surface-1)',
            border: `1px solid ${accentMid}`,
            boxShadow: `0 16px 48px rgba(0,0,0,0.5), 0 0 0 1px ${accentLight}`,
            color: 'var(--text-primary)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3 pb-2.5" style={{ borderBottom: `1px solid ${accentLight}` }}>
            <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>Embed Media</span>
            <button aria-label="Close modal" onClick={() => setIsOpen(false)} style={{ color: 'var(--text-tertiary)' }} className="hover:text-white transition-colors">
              <X size={14} />
            </button>
          </div>

          {/* File Upload */}
          <label
            className="block w-full cursor-pointer rounded-[10px] p-3 text-center mb-3 transition-all"
            style={{ background: accentLight, border: `1.5px dashed ${accentMid}` }}
            onMouseEnter={e => e.currentTarget.style.background = accentHover}
            onMouseLeave={e => e.currentTarget.style.background = accentLight}
          >
            <Upload size={18} className="mx-auto mb-1" style={{ color: accent }} />
            <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>Upload photo or video clip</span>
            <input type="file" accept="image/*,video/*" onChange={handleFileUpload} className="hidden" />
          </label>

          <div className="text-center text-[10px] tracking-widest uppercase mb-3" style={{ color: 'var(--text-disabled)' }}>
            — or via link —
          </div>

          {/* URL form */}
          <form onSubmit={handleUrlSubmit} className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              {['image', 'video'].map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setMediaType(t)}
                  className="py-1.5 rounded-[8px] text-[11px] font-medium capitalize transition-all"
                  style={{
                    background: mediaType === t ? accent : 'var(--surface-3)',
                    color: mediaType === t ? '#fff' : 'var(--text-secondary)',
                    border: `1px solid ${mediaType === t ? accent : 'var(--border)'}`,
                  }}
                >
                  {t}
                </button>
              ))}
            </div>

            <input
              type="url"
              placeholder="Paste media URL…"
              value={mediaUrl}
              onChange={e => setMediaUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-[8px] text-xs focus:outline-none"
              style={{
                background: 'var(--surface-2)',
                border: `1px solid var(--border)`,
                color: 'var(--text-primary)',
              }}
              onFocus={e => e.currentTarget.style.borderColor = accent}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
            />
            <input
              type="text"
              placeholder="Optional caption…"
              value={caption}
              onChange={e => setCaption(e.target.value)}
              className="w-full px-3 py-2 rounded-[8px] text-xs focus:outline-none"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              onFocus={e => e.currentTarget.style.borderColor = accent}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
            />

            <button
              type="submit"
              className="w-full py-2 rounded-[8px] text-xs font-semibold text-white transition-all"
              style={{ background: accent }}
            >
              Attach Media
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

// Resizable Media Display Item
export const ResizableMediaItem = ({ media, pageId, canWrite, accent = '#6c63ff' }) => {
  const { deleteMediaFromPage } = useJournal();
  const [width, setWidth] = useState(media.width || 260);

  const handleMouseDown = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = width;
    const onMove = (ev) => setWidth(Math.max(120, Math.min(460, startWidth + (ev.clientX - startX))));
    const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  return (
    <div
      className="relative group my-2 inline-block rounded-[10px] overflow-hidden shadow-sm"
      style={{ width: `${width}px`, border: '1px solid var(--parchment-line)', background: 'var(--parchment-dark)' }}
    >
      {media.type === 'video'
        ? <video src={media.url} controls className="w-full h-auto rounded-[8px]" />
        : <img src={media.url} alt={media.caption} className="w-full h-auto rounded-[8px] object-cover" />
      }
      {media.caption && (
        <p className="text-[10px] italic text-center px-1 py-0.5" style={{ color: 'var(--ink-light)' }}>
          {media.caption}
        </p>
      )}
      {canWrite && (
        <button
          onClick={() => deleteMediaFromPage(pageId, media.id)}
          className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: 'rgba(239,68,68,0.85)', color: '#fff' }}
        >
          <Trash2 size={10} />
        </button>
      )}
      {canWrite && (
        <div
          onMouseDown={handleMouseDown}
          className="absolute bottom-1 right-1 w-4 h-4 rounded-br-[6px] cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[8px]"
          style={{ background: `${accent}cc`, color: '#fff' }}
        >
          ⤞
        </div>
      )}
    </div>
  );
};
