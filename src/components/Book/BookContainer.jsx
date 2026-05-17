import React, { useEffect } from 'react';
import { useJournal } from '../../context/JournalContext';
import { useAuth } from '../../context/AuthContext';
import { PageSpread } from './PageSpread';
import { NavigationDots } from '../Controls/NavigationDots';
import { CoverCustomizerModal } from '../Controls/CoverCustomizerModal';
import { ShareModal } from '../Controls/ShareModal';
import { MembersPanelModal } from '../Controls/MembersPanelModal';
import { AuthModal } from '../Auth/AuthModal';
import { AccountSettingsModal } from '../Auth/AccountSettingsModal';
import { TearAnimationOverlay } from '../Controls/TearAnimationOverlay';
import { GuestNameModal } from '../Controls/GuestNameModal';

export const BookContainer = () => {
  const { currentBook, joinBookViaToken, loadGuestBook } = useJournal();
  const { user, loading, setAuthModalOpen, setAuthMode } = useAuth();

  useEffect(() => {
    if (loading) return; // Wait until we know auth state

    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('invite') || urlParams.get('shareToken');
    if (token) {
      if (!user) {
        // Not logged in: bypass AuthModal and use the secure token tunnel!
        loadGuestBook(token).then(res => {
          if (res.success) {
            window.history.replaceState({}, document.title, window.location.pathname);
          } else {
            console.warn("Guest token error:", res.error);
            // Optionally fallback to AuthModal if the token was completely invalid?
            // setAuthMode('login'); setAuthModalOpen(true);
          }
        });
      } else {
        // Attempt to join the book normally
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
      className="min-h-screen pt-14 pb-24 px-2 flex flex-col items-center transition-all duration-700"
      style={{ background: getAmbientBg() }}
    >
      <PageSpread />
      <TearAnimationOverlay />
      <NavigationDots />
      <CoverCustomizerModal />
      <ShareModal />
      <MembersPanelModal />
      <AuthModal />
      <AccountSettingsModal />
      <GuestNameModal />
    </main>
  );
};
