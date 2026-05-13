import React, { useState } from 'react';
import { X, AlertCircle, CheckCircle, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AccountSettingsModal = () => {
  const { user, accountModalOpen, setAccountModalOpen, changePassword, deleteAccount } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [deleteConfirmPassword, setDeleteConfirmPassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!accountModalOpen || !user) return null;

  const handleChangePassword = (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    try {
      if (!currentPassword || !newPassword) throw new Error("Please enter both current and new password.");
      changePassword(currentPassword, newPassword);
      setSuccessMsg("Password changed successfully!");
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteAccount = (e) => {
    e.preventDefault();
    setError('');
    try {
      if (!deleteConfirmPassword) throw new Error("Password confirmation is required to delete account.");
      deleteAccount(deleteConfirmPassword);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => setAccountModalOpen(false)}>
      <div className="modal-panel w-full max-w-md p-8" onClick={e => e.stopPropagation()}>
        <button
          onClick={() => setAccountModalOpen(false)}
          className="absolute top-5 right-5 w-7 h-7 rounded-[8px] flex items-center justify-center transition-colors"
          style={{ color: 'var(--text-tertiary)' }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-3)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <X size={15} />
        </button>

        <div className="text-center mb-6">
          <div className="w-10 h-10 rounded-[12px] flex items-center justify-center font-display text-white font-bold text-lg mx-auto mb-5"
            style={{ background: 'var(--accent)' }}>
            <span className="text-sm">✦</span>
          </div>
          <h2 className="font-display text-2xl font-normal mb-1" style={{ color: 'var(--text-primary)' }}>
            Account Settings
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Manage your private journal credentials
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 p-3 rounded-[10px] mb-4 text-xs"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}>
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        {successMsg && (
          <div className="flex items-start gap-2.5 p-3 rounded-[10px] mb-4 text-xs"
            style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', color: '#34d399' }}>
            <CheckCircle size={14} className="shrink-0 mt-0.5" />
            {successMsg}
          </div>
        )}

        <div className="w-full p-4 rounded-[12px] text-left mb-6" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{user.name}</p>
          <p className="text-[11px] mt-0.5 font-mono" style={{ color: 'var(--text-tertiary)' }}>{user.email}</p>
        </div>

        <form onSubmit={handleChangePassword} className="w-full space-y-4 text-left mb-6 pb-6 border-b" style={{ borderColor: 'var(--border)' }}>
          <span className="block font-medium text-xs uppercase tracking-widest mb-4" style={{ color: 'var(--text-tertiary)' }}>Change Password</span>
          <div>
            <label className="block text-xs mb-1.5" style={{ color: 'var(--text-secondary)' }}>Current Password</label>
            <input
              type="password"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="input-field text-sm"
            />
          </div>
          <div>
            <label className="block text-xs mb-1.5" style={{ color: 'var(--text-secondary)' }}>New Password</label>
            <input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input-field text-sm"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full py-2.5 text-sm mt-2 font-medium transition-transform active:scale-[0.98]"
            style={{ background: 'var(--accent)' }}
          >
            Update Password
          </button>
        </form>

        <div className="w-full">
          {!isDeleting ? (
            <button
              onClick={() => setIsDeleting(true)}
              className="w-full py-2.5 rounded-[10px] text-xs font-medium flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
              style={{ 
                background: 'rgba(239,68,68,0.1)', 
                color: '#ef4444',
                border: '1px solid rgba(239,68,68,0.2)'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.15)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
            >
              <Trash2 size={13} />
              <span>Delete Account Permanently</span>
            </button>
          ) : (
            <form onSubmit={handleDeleteAccount} className="p-4 rounded-[12px] space-y-3 text-left animate-scale-in"
              style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.3)' }}>
              <p className="font-semibold text-sm" style={{ color: '#ef4444' }}>⚠️ Permanent Account Deletion</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>This permanently deletes all your journals. Type your password to confirm:</p>
              <input
                type="password"
                placeholder="Confirm password"
                value={deleteConfirmPassword}
                onChange={(e) => setDeleteConfirmPassword(e.target.value)}
                className="input-field text-sm"
              />
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDeleting(false)}
                  className="flex-1 py-2 rounded-[8px] text-xs font-medium transition-colors"
                  style={{ background: 'var(--surface-3)', color: 'var(--text-primary)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-[8px] text-xs font-medium text-white transition-colors"
                  style={{ background: '#ef4444' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#dc2626'}
                  onMouseLeave={e => e.currentTarget.style.background = '#ef4444'}
                >
                  Confirm Delete
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
