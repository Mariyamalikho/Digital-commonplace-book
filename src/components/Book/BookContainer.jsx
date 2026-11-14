import React, { useEffect, Suspense, lazy } from 'react';
import { useJournal } from '../../context/JournalContext';
import { useAuth } from '../../context/AuthContext';
import { PageSpread } from './PageSpread';
import { NavigationDots } from '../Controls/NavigationDots';

// Code-split heavy modal interfaces to eliminate initial bundle bloat
const CoverCustomizerModal = lazy(() => import('../Controls/CoverCustomizerModal').then(m => ({ default: m.CoverCustomizerModal })));
const ShareModal = lazy(() => import('../Controls/ShareModal').then(m => ({ default: m.ShareModal })));
const MembersPanelModal = lazy(() => import('../Controls/MembersPanelModal').then(m => ({ default: m.MembersPanelModal })));
const AuthModal = lazy(() => import('../Auth/AuthModal').then(m => ({ default: m.AuthModal })));
const AccountSettingsModal = lazy(() => import('../Auth/AccountSettingsModal').then(m => ({ default: m.AccountSettingsModal })));
const TearAnimationOverlay = lazy(() => import('../Controls/TearAnimationOverlay').then(m => ({ default: m.TearAnimationOverlay })));
const GuestNameModal = lazy(() => import('../Controls/GuestNameModal').then(m => ({ default: m.GuestNameModal })));

/**
 * BookContainer Component
 * Main layout wrapper for the physical journal interface.
 * Coordinates route/token hydration, ambient atmospheric background, and lazy secondary UI.
 */
export const BookContainer = () => {
  const { currentBook, joinBookViaToken, loadGuestBook } = useJournal();
  const { user, loading, setAuthModalOpen, setAuthMode } = useAuth();

  useEffect(() => {
    if (loading) return;

    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('invite') || urlParams.get('shareToken');
    if (token) {
      if (!user) {
        loadGuestBook(token).then(res => {
          if (res.success) {
            window.history.replaceState({}, document.title, window.location.pathname);
          } else {
            console.warn("Guest token error:", res.error);
          }
        });
      } else {
        joinBookViaToken(token).then(success => {
          if (success) {
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        }).catch(err => {
          console.warn("Share token error:", err.message);
        });
      }
    }
  }, [joinBookViaToken, loadGuestBook, user, loading, setAuthModalOpen, setAuthMode]);

  // Ambient background derived from book theme
  const getAmbientBg = () => {
    const theme = currentBook?.cover?.theme || 'midnight';
    const map = {
      midnight:       'radial-gradient(ellipse at 50% 0%, #1a1040 0%, #0a0a0f 65%)',
      sand:           'radial-gradient(ellipse at 50% 0%, #231608 0%, #0f0d0a 65%)',
      emerald:        'radial-gradient(ellipse at 50% 0%, #0d2820 0%, #080f0c 65%)',
      obsidian:       'radial-gradient(ellipse at 50% 0%, #1a1a1a 0%, #080808 65%)',
      royal:          'radial-gradient(ellipse at 50% 0%, #1c0e3a 0%, #0c0a14 65%)',
      'dark-academia':'radial-gradient(ellipse at 50% 0%, #261d0e 0%, #0d0b08 65%)',
    };
    return map[theme] || map.midnight;
  };

  return (
    <main
      className="flex-1 w-full py-6 md:py-12 px-2 flex flex-col items-center justify-center transition-all duration-700"
      style={{ background: getAmbientBg() }}
    >
      <PageSpread />
      <NavigationDots />

      {/* Lazy Suspense boundary for secondary dialogs */}
      <Suspense fallback={null}>
        <TearAnimationOverlay />
        <CoverCustomizerModal />
        <ShareModal />
        <MembersPanelModal />
        <AuthModal />
        <AccountSettingsModal />
        <GuestNameModal />
      </Suspense>
    </main>
  );
};
