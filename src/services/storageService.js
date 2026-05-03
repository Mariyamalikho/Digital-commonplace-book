// Storage & Data Persistence Service for Digital Commonplace Journal
// Supports zero-config LocalStorage persistence + Firebase/Supabase synchronization adapters

const STORAGE_KEYS = {
  USERS: 'grimoire_users_db',
  CURRENT_USER: 'grimoire_current_user',
  BOOKS: 'grimoire_books_db',
  SHARE_LINKS: 'grimoire_share_links',
};

// Initial Default Journal Data
export const DEFAULT_INITIAL_BOOK = {
  id: 'book-default-001',
  ownerId: 'user-guest-001',
  ownerName: 'Scholar',
  title: 'Grimoire of Thoughts',
  subtitle: 'A Digital Commonplace Journal & Anthology',
  dedication: 'Dedicated to the curious minds, the late-night readers, and the seekers of ancient wisdom.',
  createdAt: new Date().toISOString(),
  cover: {
    texture: 'leather', // 'leather' | 'wood' | 'velvet' | 'canvas' | 'marbled'
    color: '#010a37',
    pattern: 'gold-filigree', // 'gold-filigree' | 'celestial' | 'damask' | 'minimal' | 'botanical'
    titleColor: '#d4af37',
    foilAccent: '#c59b27',
  },
  spreads: [
    // Spread 0: Cover & Dedication (Spread 0 is special)
    // Spread 1: Pages 1 & 2
    {
      id: 'spread-1',
      leftPage: {
        id: 'page-1',
        pageNumber: 1,
        date: '2026-07-21',
        title: 'On the Art of Commonplacing',
        content: `Commonplacing is an ancient habit of keeping a notebook into which one enters extracts, observations, quotes, and reflections.\n\n"We should hunt out the helpful pieces of teaching, and the spirited and noble sayings which are capable of immediate practical application." — Seneca\n\nWrite down your favorite quotes, record voice notes, upload vintage sketches, or draw freehand thoughts on these parchment pages.`,
        drawing: null, // Canvas dataURL
        media: [
          {
            id: 'm-1',
            type: 'image',
            url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
            caption: 'Antique Study & Library',
            width: 260,
            x: 20,
            y: 260
          }
        ],
        voiceNotes: [
          {
            id: 'v-1',
            date: '2026-07-21 21:00',
            duration: 12,
            url: '' // Audio data url or sample
          }
        ],
        notes: [
          {
            id: 'note-1',
            authorId: 'editor-001',
            authorName: 'Master Editor',
            text: 'Seneca\'s Letters to Lucilius are an extraordinary source of stoic wisdom.',
            createdAt: '2026-07-21 21:05'
          }
        ]
      },
      rightPage: {
        id: 'page-2',
        pageNumber: 2,
        date: '2026-07-21',
        title: 'Reflections & Sketches',
        content: `Ideas recorded in isolation gain depth when woven together side-by-side.\n\nUse the freehand pen (✒) on the top toolbar to sketch margin diagrams, or record spoken audio thoughts directly onto the parchment.\n\nYou can tear out unwanted spreads (✂), customize your leather cover design, and invite fellow scholars to review your journal!`,
        drawing: null,
        media: [],
        voiceNotes: [],
        notes: []
      }
    },
    // Spread 2: Pages 3 & 4
    {
      id: 'spread-2',
      leftPage: {
        id: 'page-3',
        pageNumber: 3,
        date: '2026-07-22',
        title: 'Aphorisms & Quotes',
        content: `1. "The mind is not a vessel to be filled, but a fire to be kindled." — Plutarch\n\n2. "What is written without effort is in general read without pleasure." — Samuel Johnson\n\n3. "Books serve to show a man that those original thoughts of his aren't very new after all." — Abraham Lincoln`,
        drawing: null,
        media: [],
        voiceNotes: [],
        notes: []
      },
      rightPage: {
        id: 'page-4',
        pageNumber: 4,
        date: '2026-07-22',
        title: 'Notes & Margins',
        content: `Add your own personal observations here. Click anywhere to begin typing on the vintage lined parchment.`,
        drawing: null,
        media: [],
        voiceNotes: [],
        notes: []
      }
    }
  ],
  members: [
    { userId: 'user-guest-001', name: 'Scholar (You)', role: 'owner', email: 'scholar@commonplace.app' }
  ]
};

class StorageService {
  constructor() {
    this.initStorage();
  }

  initStorage() {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      const defaultUser = {
        id: 'user-guest-001',
        name: 'Scholar',
        email: 'scholar@commonplace.app',
        password: 'password123', // Demo fallback password
      };
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([defaultUser]));
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(defaultUser));
    }

    if (!localStorage.getItem(STORAGE_KEYS.BOOKS)) {
      localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify([DEFAULT_INITIAL_BOOK]));
    }

    if (!localStorage.getItem(STORAGE_KEYS.SHARE_LINKS)) {
      localStorage.setItem(STORAGE_KEYS.SHARE_LINKS, JSON.stringify([]));
    }
  }

  // --- USER AUTH MANAGEMENT ---
  getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER));
    } catch {
      return null;
    }
  }

  setCurrentUser(user) {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }

  getUsers() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || [];
    } catch {
      return [];
    }
  }

  saveUsers(users) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  signup(name, email, password) {
    const users = this.getUsers();
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error("An account with this email already exists.");
    }
    const newUser = {
      id: 'user-' + Date.now(),
      name: name || email.split('@')[0],
      email: email.toLowerCase(),
      password: password,
    };
    users.push(newUser);
    this.saveUsers(users);
    this.setCurrentUser(newUser);

    // Create a new default journal for this user
    const userBook = {
      ...DEFAULT_INITIAL_BOOK,
      id: 'book-' + Date.now(),
      ownerId: newUser.id,
      ownerName: newUser.name,
      title: `${newUser.name}'s Commonplace Book`,
      members: [{ userId: newUser.id, name: newUser.name, role: 'owner', email: newUser.email }]
    };
    const books = this.getBooks();
    books.push(userBook);
    this.saveBooks(books);

    return newUser;
  }

  login(email, password) {
    const users = this.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      throw new Error("No account found with this email.");
    }
    if (user.password !== password) {
      throw new Error("Incorrect password. Please try again.");
    }
    this.setCurrentUser(user);
    return user;
  }

  logout() {
    this.setCurrentUser(null);
  }

  forgotPassword(email) {
    const users = this.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      throw new Error("No account found with this email.");
    }
    // Return simulated reset confirmation message
    return `Password reset link sent to ${email}. (Dev Password: "${user.password}")`;
  }

  changePassword(currentPassword, newPassword) {
    const currentUser = this.getCurrentUser();
    if (!currentUser) throw new Error("Not logged in.");

    const users = this.getUsers();
    const user = users.find(u => u.id === currentUser.id);
    if (!user || user.password !== currentPassword) {
      throw new Error("Current password incorrect.");
    }

    user.password = newPassword;
    this.saveUsers(users);
    currentUser.password = newPassword;
    this.setCurrentUser(currentUser);
    return true;
  }

  deleteAccount(passwordConfirm) {
    const currentUser = this.getCurrentUser();
    if (!currentUser) throw new Error("Not logged in.");
    
    const users = this.getUsers();
    const user = users.find(u => u.id === currentUser.id);
    if (!user || user.password !== passwordConfirm) {
      throw new Error("Password confirmation failed.");
    }

    // Remove user books and membership
    let books = this.getBooks();
    books = books.filter(b => b.ownerId !== currentUser.id);
    books.forEach(b => {
      b.members = b.members.filter(m => m.userId !== currentUser.id);
    });
    this.saveBooks(books);

    // Remove user
    const updatedUsers = users.filter(u => u.id !== currentUser.id);
    this.saveUsers(updatedUsers);
    this.logout();
    return true;
  }

  // --- BOOK & JOURNAL PERSISTENCE ---
  getBooks() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKS)) || [DEFAULT_INITIAL_BOOK];
    } catch {
      return [DEFAULT_INITIAL_BOOK];
    }
  }

  saveBooks(books) {
    localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(books));
  }

  getUserBooks(userId) {
    const books = this.getBooks();
    return books.filter(b => b.ownerId === userId || b.members.some(m => m.userId === userId));
  }

  getBookById(bookId) {
    const books = this.getBooks();
    return books.find(b => b.id === bookId) || null;
  }

  saveBook(updatedBook) {
    const books = this.getBooks();
    const index = books.findIndex(b => b.id === updatedBook.id);
    if (index !== -1) {
      books[index] = updatedBook;
    } else {
      books.push(updatedBook);
    }
    this.saveBooks(books);
  }

  // --- SHARING & RBAC PERMISSIONS ---
  getRole(book, userId) {
    if (!book) return 'visitor';
    if (book.ownerId === userId) return 'owner';
    const member = book.members ? book.members.find(m => m.userId === userId) : null;
    return member ? member.role : 'visitor';
  }

  createShareToken(bookId, role = 'visitor', expiresInDays = 30) {
    const links = JSON.parse(localStorage.getItem(STORAGE_KEYS.SHARE_LINKS)) || [];
    const token = 'token-' + Math.random().toString(36).substring(2, 10);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    const shareInfo = {
      token,
      bookId,
      role,
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
      active: true
    };
    links.push(shareInfo);
    localStorage.setItem(STORAGE_KEYS.SHARE_LINKS, JSON.stringify(links));
    return shareInfo;
  }

  getShareToken(token) {
    const links = JSON.parse(localStorage.getItem(STORAGE_KEYS.SHARE_LINKS)) || [];
    const share = links.find(l => l.token === token && l.active);
    if (!share) return null;
    if (new Date(share.expiresAt) < new Date()) {
      share.active = false;
      localStorage.setItem(STORAGE_KEYS.SHARE_LINKS, JSON.stringify(links));
      return null;
    }
    return share;
  }

  revokeShareToken(token) {
    const links = JSON.parse(localStorage.getItem(STORAGE_KEYS.SHARE_LINKS)) || [];
    const share = links.find(l => l.token === token);
    if (share) {
      share.active = false;
      localStorage.setItem(STORAGE_KEYS.SHARE_LINKS, JSON.stringify(links));
    }
  }

  joinBookViaToken(token, user) {
    const shareInfo = this.getShareToken(token);
    if (!shareInfo) throw new Error("Share link is invalid or has expired.");

    const book = this.getBookById(shareInfo.bookId);
    if (!book) throw new Error("Book no longer exists.");

    if (!book.members.some(m => m.userId === user.id)) {
      book.members.push({
        userId: user.id,
        name: user.name,
        email: user.email,
        role: shareInfo.role
      });
      this.saveBook(book);
    }
    return book;
  }
}

export const storageService = new StorageService();
