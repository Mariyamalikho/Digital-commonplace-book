import React, { useRef, useEffect, useState } from 'react';
import { Eraser, RotateCcw, Trash2, Check, Pen, Pencil, X } from 'lucide-react';

export const PageCanvas = ({ initialDrawing, onSaveDrawing, onClose, drawingColor, brushSize, accent = '#6c63ff' }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState([]);
  
  // Tools: 'pen' | 'pencil' | 'eraser'
  const [tool, setTool] = useState('pen');
  const [selectedColor, setSelectedColor] = useState(drawingColor || '#1c1917'); 
  const [strokeWidth, setStrokeWidth] = useState(brushSize || 3);

  const accentLight = `${accent}15`;
  const accentMid   = `${accent}30`;
  const accentBorder = `${accent}60`;

  const colors = [
    { id: '#1c1917', name: 'Charcoal Ink' },
    { id: '#5c4d37', name: 'Sepia Brown' },
    { id: '#7c1d1d', name: 'Crimson Ink' },
    { id: '#1d2b3a', name: 'Midnight Blue' },
    { id: '#166534', name: 'Forest Green' },
    { id: '#d4af37', name: 'Gold Leaf' },
  ];

  const widths = [2, 4, 8, 14];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    if (initialDrawing) {
      const img = new Image();
      img.src = initialDrawing;
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        saveState();
      };
    } else {
      saveState();
    }
  }, []);

  const saveState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setHistory(prev => [...prev.slice(-10), canvas.toDataURL()]);
  };

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);

    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = strokeWidth * 5;
      ctx.globalAlpha = 1.0;
    } else if (tool === 'pencil') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 0.5;
      ctx.strokeStyle = selectedColor;
      ctx.lineWidth = Math.max(1, strokeWidth - 1);
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 0.95;
      ctx.strokeStyle = selectedColor;
      ctx.lineWidth = strokeWidth;
    }

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveState();
    }
  };

  const handleUndo = () => {
    if (history.length <= 1) return;
    const newHistory = history.slice(0, -1);
    setHistory(newHistory);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const prevDataUrl = newHistory[newHistory.length - 1];
    if (prevDataUrl) {
      const img = new Image();
      img.src = prevDataUrl;
      img.onload = () => {
        ctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    saveState();
  };

  const handleDone = () => {
    if (!canvasRef.current) return;
    onSaveDrawing(canvasRef.current.toDataURL());
    onClose();
  };

  return (
    <div className="absolute inset-0 z-30 flex flex-col rounded-[16px] overflow-hidden shadow-2xl"
         style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(2px)', border: `2px solid ${accent}` }}>
      
      {/* ── Toolbar ── */}
      <div 
        className="px-3 py-2 flex flex-wrap items-center justify-between text-xs gap-2"
        style={{ background: 'var(--surface-1)', borderBottom: `1px solid ${accentMid}` }}
      >
        {/* Tool selector */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setTool('pen')}
            className="px-3 py-1.5 rounded-[8px] flex items-center gap-1.5 transition-all font-medium"
            style={tool === 'pen' 
              ? { background: accent, color: '#fff' } 
              : { background: 'var(--surface-2)', color: 'var(--text-secondary)' }}
          >
            <Pen size={12} />
            <span>Pen</span>
          </button>
          
          <button
            onClick={() => setTool('pencil')}
            className="px-3 py-1.5 rounded-[8px] flex items-center gap-1.5 transition-all font-medium"
            style={tool === 'pencil' 
              ? { background: accent, color: '#fff' } 
              : { background: 'var(--surface-2)', color: 'var(--text-secondary)' }}
          >
            <Pencil size={12} />
            <span>Pencil</span>
          </button>

          <button
            onClick={() => setTool('eraser')}
            className="px-3 py-1.5 rounded-[8px] flex items-center gap-1.5 transition-all font-medium"
            style={tool === 'eraser' 
              ? { background: '#ef4444', color: '#fff' } 
              : { background: 'var(--surface-2)', color: 'var(--text-secondary)' }}
          >
            <Eraser size={12} />
            <span>Eraser</span>
          </button>
        </div>

        {/* Colors Palette */}
        {tool !== 'eraser' && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] tracking-widest uppercase" style={{ color: 'var(--text-tertiary)' }}>Color:</span>
            <div className="flex items-center gap-1.5">
              {colors.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedColor(c.id)}
                  className="w-[22px] h-[22px] rounded-full transition-transform"
                  style={{ 
                    backgroundColor: c.id, 
                    border: selectedColor === c.id ? `2px solid var(--text-primary)` : `2px solid transparent`,
                    transform: selectedColor === c.id ? 'scale(1.15)' : 'scale(1)',
                    boxShadow: selectedColor === c.id ? `0 2px 8px rgba(0,0,0,0.4)` : 'none'
                  }}
                  title={c.name}
                />
              ))}
            </div>
          </div>
        )}

        {/* Stroke Size Selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] tracking-widest uppercase" style={{ color: 'var(--text-tertiary)' }}>Size:</span>
          <div className="flex items-center gap-1">
            {widths.map(w => (
              <button
                key={w}
                onClick={() => setStrokeWidth(w)}
                className="w-6 h-6 rounded-full text-[10px] flex items-center justify-center font-bold transition-all"
                style={strokeWidth === w 
                  ? { background: accent, color: '#fff' } 
                  : { background: 'var(--surface-2)', color: 'var(--text-secondary)' }}
              >
                {w}
              </button>
            ))}
          </div>
        </div>

        {/* Actions (Undo/Clear/Save) */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleUndo}
            disabled={history.length <= 1}
            className="w-7 h-7 rounded-[8px] flex items-center justify-center transition-all disabled:opacity-30"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            title="Undo"
          >
            <RotateCcw size={13} />
          </button>
          
          <button
            onClick={handleClear}
            className="w-7 h-7 rounded-[8px] flex items-center justify-center transition-all"
            style={{ color: '#ef4444' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            title="Clear Canvas"
          >
            <Trash2 size={13} />
          </button>

          <button
            onClick={handleDone}
            className="ml-1 px-3 py-1.5 rounded-[8px] flex items-center gap-1.5 font-semibold text-white transition-all hover:scale-105 active:scale-95"
            style={{ background: accent, boxShadow: `0 2px 10px ${accentLight}` }}
          >
            <Check size={13} />
            <span>Save</span>
          </button>

          <div className="w-px h-5 mx-1" style={{ background: 'var(--border)' }} />

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-[8px] flex items-center justify-center transition-all"
            style={{ color: 'var(--text-tertiary)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-tertiary)'; }}
            title="Close Canvas"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* ── Canvas Area ── */}
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        className="w-full h-full cursor-crosshair touch-none"
      />
    </div>
  );
};
