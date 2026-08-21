import React, { useState, useRef } from 'react';
import { X, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useJournal } from '../../context/JournalContext';
import { firebaseSignInWithGoogle, isFirebaseConfigured } from '../../services/firebaseService';
import { AUTH_MODES } from '../../utils/constants';
import { useFocusTrap } from '../../hooks/useFocusTrap';

export const AuthModal = () => {
  const { authModalOpen, setAuthModalOpen, authMode, setAuthMode, login, signup, forgotPassword } = useAuth();
  const { setHasSeenGuestUpsell, goToNextSpread, guestRole, guestToken } = useJournal();

  const [name, setName]             = useState('');
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError]           = useState('');
  const [infoMsg, setInfoMsg]       = useState('');
  const [loading, setLoading]       = useState(false);
  const modalRef = useRef(null);
  
  useFocusTrap(modalRef, authModalOpen);

  if (!authModalOpen) return null;

  const handleClose = () => {
    if (authMode === AUTH_MODES.GUEST_WELCOME) {
      setHasSeenGuestUpsell(true);
      goToNextSpread();
    }
    setAuthModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setInfoMsg(''); setLoading(true);
    try {
      if (authMode === AUTH_MODES.SIGNUP || authMode === AUTH_MODES.GUEST_WELCOME) {
        if (!email || !password) throw new Error('Email and password are required.');
        await signup(name, email, password, rememberMe);
      } else if (authMode === AUTH_MODES.LOGIN) {
        if (!email || !password) throw new Error('Email and password are required.');
        await login(email, password, rememberMe);
      } else {
        if (!email) throw new Error('Please enter your email address.');
        const res = await forgotPassword(email);
        setInfoMsg(res);
      }
    } catch (err) {
      setError(err.message ? err.message.charAt(0).toUpperCase() + err.message.slice(1) : 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError(''); setLoading(true);
    try {
      await firebaseSignInWithGoogle(rememberMe);
      setAuthModalOpen(false);
    } catch (err) {
      setError(err.message ? err.message.charAt(0).toUpperCase() + err.message.slice(1) : 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const modeLabels = {
    [AUTH_MODES.LOGIN]:  { title: 'Welcome back', sub: 'Sign in to your library', btn: 'Sign In' },
    [AUTH_MODES.SIGNUP]: { title: 'Create account', sub: 'Start your private journal workspace', btn: 'Create Account' },
    [AUTH_MODES.FORGOT]: { title: 'Reset password', sub: 'We\'ll send you a reset link', btn: 'Send Reset Link' },
    [AUTH_MODES.GUEST_WELCOME]: { title: 'Welcome to the Journal', sub: `You are joining in ${guestRole || 'visitor'} mode. Join to create your own!`, btn: 'Create Account' },
  };
  const { title, sub, btn } = modeLabels[authMode];

  return (
    <div className="modal-overlay" role="button" tabIndex={0} onClick={handleClose}>
      <div ref={modalRef} className="modal-panel w-full max-w-sm md:max-w-md p-8 md:p-10" onClick={e => e.stopPropagation()}>
        {/* Close */}
        <button aria-label="Close modal"
          onClick={handleClose}
          className="absolute top-5 right-5 w-7 h-7 rounded-[8px] flex items-center justify-center transition-colors"
          style={{ color: 'var(--text-tertiary)' }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-3)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <X size={15} />
        </button>


        <h2 className="font-display text-2xl font-normal mb-1" style={{ color: 'var(--text-primary)' }}>{title}</h2>
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>{sub}</p>

        {/* Google Button */}
        {isFirebaseConfigured() && authMode !== AUTH_MODES.FORGOT && (
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full py-2.5 mb-5 rounded-[10px] text-sm font-medium flex items-center justify-center gap-2.5 transition-all border"
            style={{ background: '#fff', color: '#1a1a1a', borderColor: '#e5e5e5' }}
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0">
              <title>Google Logo</title>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            Continue with Google
          </button>
        )}

        {/* Divider */}
        {isFirebaseConfigured() && authMode !== AUTH_MODES.FORGOT && (
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
            <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>or</span>
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
          </div>
        )}

        {/* Alerts */}
        {error && (
          <div className="flex items-start gap-2.5 p-3 rounded-[10px] mb-4 text-xs"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }} aria-live="assertive" role="alert">
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            {error.endsWith('.') ? error : error + '.'}
          </div>
        )}
        {infoMsg && (
          <div className="flex items-start gap-2.5 p-3 rounded-[10px] mb-4 text-xs"
            style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', color: '#34d399' }}>
            <CheckCircle size={14} className="shrink-0 mt-0.5" />
            {infoMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {(authMode === AUTH_MODES.SIGNUP || authMode === AUTH_MODES.GUEST_WELCOME) && (
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your name"
              className="input-field text-sm"
            />
          )}
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email address"
            className="input-field text-sm"
            autoFocus
          />
          {authMode !== AUTH_MODES.FORGOT && (
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              className="input-field text-sm"
            />
          )}

          {authMode !== AUTH_MODES.FORGOT && (
            <label className="flex items-center gap-2 cursor-pointer py-1">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="rounded"
                style={{ accentColor: 'var(--accent)' }}
              />
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Remember me</span>
            </label>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full py-2.5 text-sm mt-1"
            style={{ background: 'var(--accent)' }}
          >
            {loading ? 'Please wait…' : btn}
            {!loading && <ArrowRight size={14} />}
          </button>
        </form>

        {/* Mode Switch */}
        <div className="mt-5 text-center text-xs space-y-2" style={{ color: 'var(--text-tertiary)' }}>
          {authMode === AUTH_MODES.LOGIN && (
            <>
              <p>
                <button onClick={() => { setAuthMode(AUTH_MODES.FORGOT); setError(''); }} className="underline hover:text-white transition-colors">
                  Forgot password?
                </button>
              </p>
              <p>
                Don't have an account?{' '}
                <button onClick={() => setAuthMode(AUTH_MODES.SIGNUP)} className="underline font-medium hover:text-white transition-colors" style={{ color: 'var(--accent)' }}>
                  Sign up
                </button>
              </p>
            </>
          )}
          {authMode === AUTH_MODES.SIGNUP && (
            <p>
              Already have an account?{' '}
              <button onClick={() => setAuthMode(AUTH_MODES.LOGIN)} className="underline font-medium hover:text-white transition-colors" style={{ color: 'var(--accent)' }}>
                Sign in
              </button>
            </p>
          )}
          {authMode === AUTH_MODES.GUEST_WELCOME && (
            <p>
              Already have an account?{' '}
              <button onClick={() => setAuthMode(AUTH_MODES.LOGIN)} className="underline font-medium hover:text-white transition-colors" style={{ color: 'var(--accent)' }}>
                Sign in
              </button>
            </p>
          )}
          {authMode === AUTH_MODES.FORGOT && (
            <p>
              <button onClick={() => setAuthMode(AUTH_MODES.LOGIN)} className="underline hover:text-white transition-all duration-[250ms] inline-block hover:scale-105">
                Back to sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
