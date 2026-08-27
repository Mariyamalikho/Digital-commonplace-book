import React from 'react';
import { Shield, Globe } from 'lucide-react';

export const Footer = ({ onOpenPrivacy }) => {
  return (
    <footer className="w-full py-6 mt-auto border-t z-10 relative" style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}>
      <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
          © {new Date().getFullYear()} Mariyam. Built with React & Supabase.
        </div>
        
        <div className="flex items-center gap-6">
          <button 
            onClick={onOpenPrivacy}
            className="flex items-center gap-1.5 text-xs transition-colors hover:text-white"
            style={{ color: 'var(--text-secondary)' }}
          >
            <Shield size={14} />
            Privacy Policy
          </button>
          
          <a 
            href="https://mariyamalikhokhar.com/" 
            target="_blank" 
            rel="noreferrer"
            className="flex items-center gap-1.5 text-xs transition-colors hover:text-white"
            style={{ color: 'var(--text-secondary)' }}
          >
            <Globe size={14} />
            Website
          </a>

          <a 
            href="https://github.com/Mariyamalikho" 
            target="_blank" 
            rel="noreferrer"
            className="flex items-center gap-1.5 text-xs transition-colors hover:text-white"
            style={{ color: 'var(--text-secondary)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
            </svg>
            GitHub
          </a>

          <a 
            href="https://www.linkedin.com/in/mariyamali-khokhar/" 
            target="_blank" 
            rel="noreferrer"
            className="flex items-center gap-1.5 text-xs transition-colors hover:text-white"
            style={{ color: 'var(--text-secondary)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
              <rect x="2" y="9" width="4" height="12" />
              <circle cx="4" cy="4" r="2" />
            </svg>
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
};
