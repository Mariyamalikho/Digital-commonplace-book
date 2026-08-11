import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { COLOR_THEMES } from '../utils/constants';
import { soundEngine } from '../services/audioService';
import { syncBookToFirestore } from '../services/firebaseService';
import { 
  supabaseCreateShareToken, 
  supabaseGetBookViaToken, 
  supabaseGetUserBooks, 
  supabaseJoinBookViaToken, 
  supabaseSaveBook, 
  supabaseUpdateBookViaToken 
} from '../services/supabaseService';
import { versionService } from '../services/versionService';

const JournalContext = createContext();

/**
 * JournalProvider Component
 * 
 * Provides global state management for the entire journal application.
 * This context manages the currently active book, user books, page flipping
 * animations, drawing mode state, and access control (role-based permissions).
 * It also handles syncing book state to both Supabase and Firestore, and
 * manages guest/visitor access via share tokens.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - The child components wrapped by this provider
 */
export const JournalProvider = ({ children }) => {
  const { user } = useAuth();

  // ==========================================
  // DATA STATE
  // ==========================================
  const [userBooks, setUserBooks] = useState([]);
  const [currentBook, setCurrentBook] = useState(null);

  // ==========================================
  // GUEST ACCESS STATE
  // ==========================================
  // guestToken: The token used by an unauthenticated visitor to view/edit a shared book.
  // guestRole: The permissions associated with the token (e.g., 'visitor', 'editor').
  const [guestToken, setGuestToken] = useState(null);
  const [guestRole, setGuestRole] = useState(null);
  const [guestName, setGuestName] = useState('');
  const [hasSeenGuestUpsell, setHasSeenGuestUpsell] = useState(false);

  // ==========================================
  // UI STATE: Navigation & Modes
  // ==========================================
  const [viewMode, setViewMode] = useState('reader'); // 'dashboard' | 'reader'
  const [currentSpreadIndex, setCurrentSpreadIndex] = useState(0);

  // ==========================================
  // UI STATE: Animations
  // ==========================================
  const [isTearing, setIsTearing] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState('next');

  // ==========================================
  // UI STATE: Drawing Tools
  // ==========================================
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [activeDrawingPage, setActiveDrawingPage] = useState('right');
  const [drawingColor, setDrawingColor] = useState('#231f20');
  const [brushSize, setBrushSize] = useState(3);

  // ==========================================
  // UI STATE: Modals
  // ==========================================
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

    let theme = COLOR_THEMES[themeKey] || COLOR_THEMES['midnight'];

    const root = document.documentElement;
    root.style.setProperty('--theme-bg-darkest', theme.bgDarkest);
    root.style.setProperty('--theme-card-bg', theme.cardBg);
    root.style.setProperty('--theme-card-border', theme.cardBorder);
    root.style.setProperty('--theme-accent', theme.accent);
    root.style.setProperty('--theme-accent-hover', theme.accentHover);
    root.style.setProperty('--theme-text-accent', theme.textAccent);
  }, [currentBook]);

  /**
   * Determines the user's role and permission level for a given book.
   * This is derived state calculated dynamically on render.
   */
  const calculateUserRole = (book, userId) => {
    // 1. Guest Access via Token
    if (!userId && guestToken && currentBook?.id === book?.id) return guestRole;
    
    // 2. Unauthenticated / No Book Context
    if (!book) return 'visitor';
    
    // 3. Absolute Ownership
    if (book.ownerId === userId) return 'owner';
    
    // 4. Shared Membership Resolution
    const member = book.members ? book.members.find(m => m.userId === userId) : null;
    return member ? member.role : 'visitor';
  };

  const role = calculateUserRole(currentBook, user ? user.id : null);

  const canWrite = role === 'owner';
  const canDraw = role === 'owner';
  const canAddEditorNotes = role === 'owner' || role === 'editor';
  const canShare = role === 'owner';

  const syncBookState = useCallback((updatedBook, createVersionSnapshot = true) => {
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
    syncBookState(updatedBook);
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
      syncBookState(updatedBook);

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

    syncBookState({ ...currentBook, spreads: updatedSpreads });
  };

  const updateJournalTitle = (title, subtitle) => {
    if (!currentBook || !canWrite) return;
    syncBookState({ ...currentBook, title, subtitle });
  };

  const updateCover = (coverConfig) => {
    if (!currentBook || !canWrite) return;
    syncBookState({
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
    syncBookState({ ...currentBook, spreads });
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
    syncBookState({ ...currentBook, spreads });
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
    syncBookState({ ...currentBook, spreads });
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
    syncBookState({ ...currentBook, spreads });
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
    syncBookState({ ...currentBook, spreads });
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
    syncBookState({ ...currentBook, spreads });
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
      syncBookState,
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
