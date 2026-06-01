import React, { useState } from 'react';
import { X, Download, Printer, FileText, Code, ChevronRight } from 'lucide-react';
import { useJournal } from '../../context/JournalContext';
import { exportService } from '../../services/exportService';

export const ExportModal = () => {
  const { currentBook } = useJournal();
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] text-xs transition-colors"
        style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
      >
        <Download size={11} />
        <span className="hidden md:block">Export</span>
      </button>
    );
  }

  const options = [
    {
      icon: <Printer size={18} />,
      label: 'Printable PDF',
      desc: 'High-resolution print-ready layout',
      iconBg: 'rgba(239,68,68,0.12)',
      iconColor: '#ef4444',
      action: () => { exportService.exportAsPDF(currentBook); setIsOpen(false); }
    },
    {
      icon: <FileText size={18} />,
      label: 'Markdown (.md)',
      desc: 'Formatted plaintext with headings and quotes',
      iconBg: 'rgba(99,102,241,0.12)',
      iconColor: '#6366f1',
      action: () => { exportService.exportAsMarkdown(currentBook); setIsOpen(false); }
    },
    {
      icon: <Code size={18} />,
      label: 'JSON Backup',
      desc: 'Complete data archive for import & restore',
      iconBg: 'rgba(52,211,153,0.12)',
      iconColor: '#34d399',
      action: () => { exportService.exportAsJSON(currentBook); setIsOpen(false); }
    },
  ];

  return (
    <div className="modal-overlay" onClick={() => setIsOpen(false)}>
      <div className="modal-panel w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-display text-xl" style={{ color: 'var(--text-primary)' }}>Export Journal</h2>
          <button onClick={() => setIsOpen(false)} className="w-7 h-7 rounded-[8px] flex items-center justify-center transition-colors"
            style={{ color: 'var(--text-tertiary)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-3)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <X size={15} />
          </button>
        </div>
        <p className="text-xs mb-5" style={{ color: 'var(--text-tertiary)' }}>"{currentBook?.title}"</p>

        <div className="space-y-2">
          {options.map((opt, i) => (
            <button
              key={i}
              onClick={opt.action}
              className="w-full flex items-center gap-4 p-4 rounded-[12px] text-left transition-all group"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-hover)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <div className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0"
                style={{ background: opt.iconBg, color: opt.iconColor }}>
                {opt.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{opt.label}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{opt.desc}</p>
              </div>
              <ChevronRight size={14} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--text-tertiary)' }} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
