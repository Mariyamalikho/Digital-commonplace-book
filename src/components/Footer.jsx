import React from 'react';
import { Github, Linkedin, Shield, Globe } from 'lucide-react';

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
            <Github size={14} />
            GitHub
          </a>

          <a 
            href="https://www.linkedin.com/in/mariyamali-khokhar/" 
            target="_blank" 
            rel="noreferrer"
            className="flex items-center gap-1.5 text-xs transition-colors hover:text-white"
            style={{ color: 'var(--text-secondary)' }}
          >
            <Linkedin size={14} />
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
};
