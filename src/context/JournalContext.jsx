import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabaseGetUserBooks, supabaseSaveBook, supabaseCreateShareToken, supabaseJoinBookViaToken, supabaseGetBookViaToken, supabaseUpdateBookViaToken } from '../services/supabaseService';
import { soundEngine } from '../services/audioService';
import { syncBookToFirestore } from '../services/firebaseService';
import { versionService } from '../services/versionService';
import { useAuth } from './AuthContext';

const JournalContext = createContext();

export const JournalProvider = ({ children }) => {
  const { user } = useAuth();

  const [userBooks, setUserBooks] = useState([]);
  const [currentBook, setCurrentBook] = useState(null);
  const [currentSpreadIndex, setCurrentSpreadIndex] = useState(0);
  const [viewMode, setViewMode] = useState('reader'); // 'dashboard' | 'reader'
  const [guestToken, setGuestToken] = useState(null);
  const [guestRole, setGuestRole] = useState(null);
  const [guestName, setGuestName] = useState('');
  const [hasSeenGuestUpsell, setHasSeenGuestUpsell] = useState(false);
  const [isTearing, setIsTearing] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState('next');

  // Drawing state
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [activeDrawingPage, setActiveDrawingPage] = useState('right');
  const [drawingColor, setDrawingColor] = useState('#231f20');
  const [brushSize, setBrushSize] = useState(3);

  // UI Modals
  const [coverCustomizerOpen, setCoverCustomizerOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [membersModalOpen, setMembersModalOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      setUserBooks([]);
      setCurrentBook(null);
      return;
    }
    supabaseGetUserBooks(user).then(books => {
      setUserBooks(books);
      if (books.length > 0) {
        setCurrentBook(prev => {
          if (!prev || !books.some(b => b.id === prev.id)) {
            setCurrentSpreadIndex(0);
            return books[0];
          }
          return prev;
        });
      }
    });
  }, [user]);

  // Dynamically update root CSS Theme Variables based on current book cover color/pattern
  useEffect(() => {
    if (!currentBook) return;
    const cover = currentBook.cover || {};
    const themeKey = cover.theme || 'midnight';

    let theme = {
      bgDarkest: '#07040d',
      cardBg: '#140b29',
      cardBorder: '#2b1b4d',
      accent: '#6c63ff',
      accentHover: '#5a52d5',
      textAccent: '#e8e6ff'
    };

    if (themeKey === 'emerald') {
      theme = {
        bgDarkest: '#040d08',
        cardBg: '#0a1f18',
        cardBorder: '#173d27',
        accent: '#34d399',
        accentHover: '#25a876',
        textAccent: '#d1fae5'
      };
    } else if (themeKey === 'sand' || themeKey === 'dark-academia') {
      theme = {
        bgDarkest: '#0d0603',
        cardBg: '#1f1508',
        cardBorder: '#3b2010',
        accent: '#c9a96e',
        accentHover: '#b89660',
        textAccent: '#faefd8'
      };
    } else if (themeKey === 'royal') {
      theme = {
        bgDarkest: '#090207',
        cardBg: '#160a30',
        cardBorder: '#361654',
        accent: '#9f7aea',
        accentHover: '#7c5ec0',
        textAccent: '#ede9fe'
      };
    } else if (themeKey === 'obsidian') {
      theme = {
        bgDarkest: '#090909',
        cardBg: '#141414',
        cardBorder: '#333333',
        accent: '#b0b0b0',
        accentHover: '#808080',
        textAccent: '#f4f4f4'
      };
    }

    const root = document.documentElement;
    root.style.setProperty('--theme-bg-darkest', theme.bgDarkest);
    root.style.setProperty('--theme-card-bg', theme.cardBg);
    root.style.setProperty('--theme-card-border', theme.cardBorder);
    root.style.setProperty('--theme-accent', theme.accent);
    root.style.setProperty('--theme-accent-hover', theme.accentHover);
    root.style.setProperty('--theme-text-accent', theme.textAccent);
  }, [currentBook]);

  const getRole = (book, userId) => {
    if (!userId && guestToken && currentBook?.id === book?.id) return guestRole;
    if (!book) return 'visitor';
    if (book.ownerId === userId) return 'owner';
    const member = book.members ? book.members.find(m => m.userId === userId) : null;
    return member ? member.role : 'visitor';
  };

  const role = getRole(currentBook, user ? user.id : null);

  const canWrite = role === 'owner';
  const canDraw = role === 'owner';
  const canAddEditorNotes = role === 'owner' || role === 'editor';
  const canShare = role === 'owner';

  const saveCurrentBookState = useCallback((updatedBook, createVersionSnapshot = true) => {
    setCurrentBook(updatedBook);
    
    // Fire and forget to Supabase
    if (guestToken && guestRole === 'editor') {
      supabaseUpdateBookViaToken(guestToken, updatedBook);
    } else {
      supabaseSaveBook(updatedBook);
      syncBookToFirestore(updatedBook);
    }

    if (createVersionSnapshot) {
      versionService.createSnapshot(updatedBook, 'Autosave Snapshot');
    }

    if (user) {
      supabaseGetUserBooks(user).then(books => setUserBooks(books));
    }
  }, [user, guestToken, guestRole]);

  // Navigation
  const goToNextSpread = () => {
    if (!currentBook || isFlipping) return;
    if (currentSpreadIndex < currentBook.spreads.length) {
      soundEngine.playPageFlip();
      setIsFlipping(true);
      setFlipDirection('next');

      setTimeout(() => {
        setCurrentSpreadIndex(prev => prev + 1);
        setIsFlipping(false);
      }, 420);
    }
  };

  const goToPrevSpread = () => {
    if (currentSpreadIndex > 0 && !isFlipping) {
      soundEngine.playPageFlip();
      setIsFlipping(true);
      setFlipDirection('prev');

      setTimeout(() => {
        setCurrentSpreadIndex(prev => prev - 1);
        setIsFlipping(false);
      }, 420);
    }
  };

  const goToSpread = (index) => {
    if (index >= 0 && currentBook && index <= currentBook.spreads.length && !isFlipping) {
      if (index === currentSpreadIndex) return;
      soundEngine.playPageFlip();
      setIsFlipping(true);
      setFlipDirection(index > currentSpreadIndex ? 'next' : 'prev');

      setTimeout(() => {
        setCurrentSpreadIndex(index);
        setIsFlipping(false);
      }, 420);
    }
  };

  const addSpread = () => {
    if (!currentBook || !canWrite) return;
    const nextSpreadNum = currentBook.spreads.length + 1;
    const leftPageNum = (nextSpreadNum - 1) * 2 + 1;
    const rightPageNum = leftPageNum + 1;

    const newSpread = {
      id: 'spread-' + Date.now(),
      leftPage: {
        id: 'page-' + leftPageNum,
        pageNumber: leftPageNum,
        date: new Date().toISOString().split('T')[0],
        title: '',
        content: '',
        drawing: null,
        media: [],
        voiceNotes: [],
        notes: []
      },
      rightPage: {
        id: 'page-' + rightPageNum,
        pageNumber: rightPageNum,
        date: new Date().toISOString().split('T')[0],
        title: '',
        content: '',
        drawing: null,
        media: [],
        voiceNotes: [],
        notes: []
      }
    };

    const updatedSpreads = [...currentBook.spreads, newSpread];
    const updatedBook = { ...currentBook, spreads: updatedSpreads };
    saveCurrentBookState(updatedBook);
    goToNextSpread();
  };

  const tearCurrentSpread = () => {
    if (!currentBook || !canWrite || currentSpreadIndex === 0) return;
    soundEngine.playPaperTear();
    setIsTearing(true);

    setTimeout(() => {
      const updatedSpreads = currentBook.spreads.filter((_, idx) => idx !== currentSpreadIndex - 1);
      
      updatedSpreads.forEach((sp, idx) => {
        const leftNum = idx * 2 + 1;
        const rightNum = leftNum + 1;
        sp.leftPage.pageNumber = leftNum;
        sp.rightPage.pageNumber = rightNum;
      });

      const updatedBook = { ...currentBook, spreads: updatedSpreads };
      saveCurrentBookState(updatedBook);

      setIsTearing(false);
      if (currentSpreadIndex > updatedSpreads.length) {
        setCurrentSpreadIndex(Math.max(0, updatedSpreads.length));
      }
    }, 650);
  };

  const updatePage = (pageId, updates) => {
    if (!currentBook || !canWrite) return;
    const updatedSpreads = currentBook.spreads.map(spread => {
      const newSpread = { ...spread };
      if (newSpread.leftPage.id === pageId) {
        newSpread.leftPage = { ...newSpread.leftPage, ...updates };
      } else if (newSpread.rightPage.id === pageId) {
        newSpread.rightPage = { ...newSpread.rightPage, ...updates };
      }
      return newSpread;
    });

    saveCurrentBookState({ ...currentBook, spreads: updatedSpreads });
  };

  const updateJournalTitle = (title, subtitle) => {
    if (!currentBook || !canWrite) return;
    saveCurrentBookState({ ...currentBook, title, subtitle });
  };

  const updateCover = (coverConfig) => {
    if (!currentBook || !canWrite) return;
    saveCurrentBookState({
      ...currentBook,
      cover: { ...currentBook.cover, ...coverConfig }
    });
  };

  const addMediaToPage = (pageId, mediaItem) => {
    if (!currentBook || !canWrite) return;
    const spreads = currentBook.spreads.map(spread => {
      const sp = { ...spread };
      ['leftPage', 'rightPage'].forEach(side => {
        if (sp[side].id === pageId) {
          sp[side] = { ...sp[side], media: [...(sp[side].media || []), mediaItem] };
        }
      });
      return sp;
    });
    saveCurrentBookState({ ...currentBook, spreads });
  };

  const deleteMediaFromPage = (pageId, mediaId) => {
    if (!currentBook || !canWrite) return;
    const spreads = currentBook.spreads.map(spread => {
      const sp = { ...spread };
      ['leftPage', 'rightPage'].forEach(side => {
        if (sp[side].id === pageId) {
          sp[side] = { ...sp[side], media: (sp[side].media || []).filter(m => m.id !== mediaId) };
        }
      });
      return sp;
    });
    saveCurrentBookState({ ...currentBook, spreads });
  };

  const addVoiceNoteToPage = (pageId, voiceNote) => {
    if (!currentBook || !canWrite) return;
    const spreads = currentBook.spreads.map(spread => {
      const sp = { ...spread };
      ['leftPage', 'rightPage'].forEach(side => {
        if (sp[side].id === pageId) {
          sp[side] = { ...sp[side], voiceNotes: [...(sp[side].voiceNotes || []), voiceNote] };
        }
      });
      return sp;
    });
    saveCurrentBookState({ ...currentBook, spreads });
  };

  const deleteVoiceNoteFromPage = (pageId, noteId) => {
    if (!currentBook || !canWrite) return;
    const spreads = currentBook.spreads.map(spread => {
      const sp = { ...spread };
      ['leftPage', 'rightPage'].forEach(side => {
        if (sp[side].id === pageId) {
          sp[side] = { ...sp[side], voiceNotes: (sp[side].voiceNotes || []).filter(v => v.id !== noteId) };
        }
      });
      return sp;
    });
    saveCurrentBookState({ ...currentBook, spreads });
  };

  const addEditorNoteToPage = (pageId, text) => {
    if (!currentBook || !canAddEditorNotes) return;
    const newNote = {
      id: 'note-' + Date.now(),
      authorId: user ? user.id : 'guest',
      authorName: user ? user.name : (guestName || 'Guest Editor'),
      text,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    const spreads = currentBook.spreads.map(spread => {
      const sp = { ...spread };
      ['leftPage', 'rightPage'].forEach(side => {
        if (sp[side].id === pageId) {
          sp[side] = { ...sp[side], notes: [...(sp[side].notes || []), newNote] };
        }
      });
      return sp;
    });
    saveCurrentBookState({ ...currentBook, spreads });
  };

  const deleteEditorNoteFromPage = (pageId, noteId) => {
    if (!currentBook || !canAddEditorNotes) return;
    const spreads = currentBook.spreads.map(spread => {
      const sp = { ...spread };
      ['leftPage', 'rightPage'].forEach(side => {
        if (sp[side].id === pageId) {
          sp[side] = { ...sp[side], notes: (sp[side].notes || []).filter(n => n.id !== noteId) };
        }
      });
      return sp;
    });
    saveCurrentBookState({ ...currentBook, spreads });
  };

  const switchBook = (bookId) => {
    const book = userBooks.find(b => b.id === bookId);
    if (book) {
      setCurrentBook(book);
      setCurrentSpreadIndex(0);
    }
  };

  const createShareToken = async (role = 'visitor', expiresInDays = 30) => {
    if (!currentBook || !canWrite) return null;
    try {
      return await supabaseCreateShareToken(currentBook.id, role, expiresInDays);
    } catch (err) {
      console.error(err);
      alert("Failed to create share link: " + err.message);
      return null;
    }
  };

  const joinBookViaToken = async (token) => {
    if (!user) {
      alert("You must be logged in to join a book.");
      return false;
    }
    try {
      const data = await supabaseJoinBookViaToken(token);
      if (data && data.success) {
        // Refresh books
        const updatedUserBooks = await supabaseGetUserBooks(user);
        setUserBooks(updatedUserBooks);
        const newBook = updatedUserBooks.find(b => b.id === data.book_id);
        if (newBook) {
          setCurrentBook(newBook);
          setCurrentSpreadIndex(0);
        }
        return true;
      }
    } catch (err) {
      console.error(err);
      alert("Failed to join book: " + err.message);
    }
    return false;
  };

  const loadGuestBook = async (token) => {
    try {
      const data = await supabaseGetBookViaToken(token);
      if (data && data.success) {
        setGuestToken(token);
        setGuestRole(data.role);
        setCurrentBook(data.book);
        setCurrentSpreadIndex(0);
        return { success: true, role: data.role };
      }
    } catch (err) {
      console.error(err);
      return { success: false, error: err.message };
    }
    return { success: false, error: "Unknown error" };
  };

  const leaveBook = async (bookId) => {
    if (!currentBook || !user) return;
    const targetBook = userBooks.find(b => b.id === bookId);
    if (targetBook) {
      targetBook.members = targetBook.members.filter(m => m.userId !== user.id);
      await supabaseSaveBook(targetBook);
    }
    const updatedUserBooks = await supabaseGetUserBooks(user);
    setUserBooks(updatedUserBooks);
    if (updatedUserBooks.length > 0) {
      setCurrentBook(updatedUserBooks[0]);
    } else {
      setCurrentBook(null);
    }
    setCurrentSpreadIndex(0);
  };

  return (
    <JournalContext.Provider value={{
      userBooks,
      currentBook,
      currentSpreadIndex,
      viewMode,
      setViewMode,
      isTearing,
      isFlipping,
      flipDirection,
      role,
      canWrite,
      canDraw,
      canAddEditorNotes,
      canShare,
      isDrawingMode,
      setIsDrawingMode,
      activeDrawingPage,
      setActiveDrawingPage,
      drawingColor,
      setDrawingColor,
      brushSize,
      setBrushSize,
      coverCustomizerOpen,
      setCoverCustomizerOpen,
      shareModalOpen,
      setShareModalOpen,
      membersModalOpen,
      setMembersModalOpen,
      goToNextSpread,
      goToPrevSpread,
      goToSpread,
      addSpread,
      tearCurrentSpread,
      updatePage,
      updateJournalTitle,
      updateCover,
      saveCurrentBookState,
      addMediaToPage,
      deleteMediaFromPage,
      addVoiceNoteToPage,
      deleteVoiceNoteFromPage,
      addEditorNoteToPage,
      deleteEditorNoteFromPage,
      switchBook,
      createShareToken,
      joinBookViaToken,
      loadGuestBook,
      guestToken,
      guestRole,
      guestName,
      setGuestName,
      hasSeenGuestUpsell,
      setHasSeenGuestUpsell,
      leaveBook
    }}>
      {children}
    </JournalContext.Provider>
  );
};

export const useJournal = () => useContext(JournalContext);
