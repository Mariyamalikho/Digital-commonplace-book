import React from 'react';
import { X, Shield } from 'lucide-react';

export const PrivacyModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-[24px] p-8 shadow-2xl relative animate-scale-in" style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}>
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full transition-colors hover:text-white"
          style={{ background: 'var(--surface-2)', color: 'var(--text-secondary)' }}
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl" style={{ background: 'rgba(108, 99, 255, 0.1)', color: '#6c63ff' }}>
            <Shield size={24} />
          </div>
          <h2 className="text-2xl font-serifTitle" style={{ color: 'var(--text-primary)' }}>Privacy Policy</h2>
        </div>
        
        <div className="space-y-6 text-sm" style={{ color: 'var(--text-secondary)', lineHeight: '1.7' }}>
          <p>Last updated: August 2026</p>
          
          <div>
            <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>1. Data Collection</h3>
            <p>We only collect the information necessary to provide you with your digital commonplace book. This includes your email address (for authentication) and the text, drawings, and media you explicitly save in your journals.</p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>2. Data Storage & Security</h3>
            <p>All journal entries are stored securely using Supabase. We implement strict Row Level Security (RLS) policies ensuring that only you (and people you explicitly share edit access with) can access your private journal entries. No other users can read or write to your book.</p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>3. Cookies & Tracking</h3>
            <p>We use local storage strictly for maintaining your session state (keeping you logged in) and remembering your UI preferences (like dark mode). We do not use third-party tracking cookies or advertising pixels.</p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>4. Account Deletion</h3>
            <p>You can request account deletion at any time. Upon deletion, all associated journals, pages, and media files will be permanently removed from our databases and storage buckets.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
