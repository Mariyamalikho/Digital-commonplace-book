import React from 'react';
import { Shield, Globe } from 'lucide-react';

export const Footer = ({ onOpenPrivacy }) => {
  return (
    <footer 
      className="w-full py-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] mt-auto border-t z-10 relative font-ui" 
      style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}
    >
      <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
        <div>
          <p className="text-xs font-serifHeading" style={{ color: 'var(--text-secondary)' }}>
            Digital Commonplace Book — Private journal, literary anthology &amp; reflections.
          </p>
          <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
            © {new Date().getFullYear()} Mariyam Ali Khokhar. Built with React &amp; Supabase.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center justify-center gap-5">
          <button 
            onClick={onOpenPrivacy}
            className="flex items-center gap-1.5 text-xs transition-colors hover:text-white py-1 px-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500 rounded"
            style={{ color: 'var(--text-secondary)' }}
            aria-label="Read Privacy Policy"
          >
            <Shield size={14} />
            <span>Privacy Policy</span>
          </button>
          
          <a 
            href="https://mariyamalikhokhar.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs transition-colors hover:text-white py-1 px-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500 rounded"
            style={{ color: 'var(--text-secondary)' }}
            aria-label="Visit Mariyam Ali Khokhar's Website"
          >
            <Globe size={14} />
            <span>Website</span>
          </a>

          <a 
            href="https://github.com/Mariyamalikho" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs transition-colors hover:text-white py-1 px-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500 rounded"
            style={{ color: 'var(--text-secondary)' }}
            aria-label="View Mariyam's GitHub Profile"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
            </svg>
            <span>GitHub</span>
          </a>

          <a 
            href="https://www.linkedin.com/in/mariyamali-khokhar/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs transition-colors hover:text-white py-1 px-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500 rounded"
            style={{ color: 'var(--text-secondary)' }}
            aria-label="Connect on LinkedIn"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
              <rect x="2" y="9" width="4" height="12" />
              <circle cx="4" cy="4" r="2" />
            </svg>
            <span>LinkedIn</span>
          </a>
        </div>
      </div>
    </footer>
  );
};
