import React from 'react';
import { Users, UserX, X, Crown, Edit3, Eye } from 'lucide-react';
import { useJournal } from '../../context/JournalContext';
import { useAuth } from '../../context/AuthContext';

export const MembersPanelModal = () => {
  const { user } = useAuth();
  const { currentBook, membersModalOpen, setMembersModalOpen, role, syncBookState } = useJournal();

  if (!membersModalOpen || !currentBook) return null;

  const isOwner = role === 'owner';
  const members = currentBook.members || [];

  const handleRemoveMember = (userId) => {
    if (!isOwner) return;
    const updatedMembers = currentBook.members.filter(m => m.userId !== userId);
    const updatedBook = { ...currentBook, members: updatedMembers };
    syncBookState(updatedBook);
  };

  const getRoleIcon = (memberRole) => {
    switch (memberRole) {
      case 'owner':
        return <Crown size={14} />;
      case 'editor':
        return <Edit3 size={14} />;
      case 'visitor':
      default:
        return <Eye size={14} className="opacity-70" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
      <div
        className="rounded-2xl max-w-md w-full p-8 md:p-10 shadow-[0_25px_60px_rgba(0,0,0,0.9)] relative flex flex-col items-center text-center border"
        style={{
          backgroundColor: 'var(--theme-card-bg)',
          borderColor: 'var(--theme-card-border)',
          color: 'var(--theme-text-accent)'
        }}
      >
        <button aria-label="Close modal"
          onClick={() => setMembersModalOpen(false)}
          className="absolute top-4 right-4 opacity-60 hover:opacity-100 transition-opacity"
        >
          <X size={18} />
        </button>

        <div className="text-sm mb-2" style={{ color: 'var(--theme-accent)' }}>✦</div>

        <h2 className="font-serifTitle text-2xl font-normal tracking-wide mb-1">
          Members & Access
        </h2>
        <p className="font-serifHeading italic text-xs opacity-70 mb-5">
          Journal members & permission levels
        </p>

        <div className="w-full space-y-2.5 max-h-64 overflow-y-auto mb-4 text-left font-serifHeading">
          {members.map((m) => (
            <div key={m.userId} className="p-3 rounded-xl border flex items-center justify-between" style={{ backgroundColor: 'var(--theme-bg-darkest)', borderColor: 'var(--theme-card-border)' }}>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full border flex items-center justify-center" style={{ backgroundColor: 'var(--theme-card-bg)', borderColor: 'var(--theme-accent)', color: 'var(--theme-text-accent)' }} title={`Role: ${m.role}`}>
                  {getRoleIcon(m.role)}
                </div>
                <div>
                  <p className="font-bold text-xs">{m.name} {m.userId === (user?.id) ? '(You)' : ''}</p>
                  <p className="text-[10px] opacity-70 font-mono">{m.email || 'scholar@commonplace.app'}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border font-semibold opacity-90" style={{ backgroundColor: 'var(--theme-card-bg)', borderColor: 'var(--theme-accent)', color: 'var(--theme-text-accent)' }} title={`Current role is ${m.role}`}>
                  {m.role}
                </span>

                {isOwner && m.role !== 'owner' && (
                  <button
                    onClick={() => handleRemoveMember(m.userId)}
                    className="p-1 text-red-400 hover:text-red-200 hover:bg-red-950/40 rounded transition-colors"
                    title="Remove Member"
                  >
                    <UserX size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="w-full border-t pt-3 text-[11.5px] leading-relaxed opacity-80 font-serifHeading text-left space-y-1.5" style={{ borderColor: 'var(--theme-card-border)' }}>
          <p><strong className="opacity-100 text-white">Owner</strong> &mdash; full control; the only person who can write, draw, and share</p>
          <p><strong className="opacity-100 text-white">Editor</strong> &mdash; can read all pages and add/remove notes; cannot edit content</p>
          <p><strong className="opacity-100 text-white">Visitor</strong> &mdash; read-only access; can browse but cannot touch anything</p>
          <p><strong className="opacity-100 text-white">Invite links</strong> &mdash; generate a Visitor or Editor link from the Share ↗ button on the cover; valid 30 days</p>
        </div>

      </div>
    </div>
  );
};
