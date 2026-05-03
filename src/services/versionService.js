// Version History Snapshot Service
const VERSION_KEY = 'grimoire_version_history';

class VersionService {
  constructor() {
    this.initStorage();
  }

  initStorage() {
    if (!localStorage.getItem(VERSION_KEY)) {
      localStorage.setItem(VERSION_KEY, JSON.stringify({}));
    }
  }

  getSnapshots(bookId) {
    try {
      const data = JSON.parse(localStorage.getItem(VERSION_KEY)) || {};
      return data[bookId] || [];
    } catch {
      return [];
    }
  }

  createSnapshot(book, note = 'Automatic Autosave Snapshot') {
    if (!book) return;
    try {
      const data = JSON.parse(localStorage.getItem(VERSION_KEY)) || {};
      const snapshots = data[book.id] || [];

      const newSnapshot = {
        id: 'ver-' + Date.now(),
        timestamp: new Date().toISOString(),
        note,
        spreadCount: book.spreads.length,
        bookData: JSON.parse(JSON.stringify(book))
      };

      // Keep latest 25 version snapshots per book
      const updatedSnapshots = [newSnapshot, ...snapshots.slice(0, 24)];
      data[book.id] = updatedSnapshots;
      localStorage.setItem(VERSION_KEY, JSON.stringify(data));
      return newSnapshot;
    } catch (err) {
      console.warn("Version snapshot error:", err.message);
    }
  }

  restoreSnapshot(snapshot) {
    if (!snapshot || !snapshot.bookData) {
      throw new Error("Invalid snapshot data");
    }
    return JSON.parse(JSON.stringify(snapshot.bookData));
  }

  clearHistory(bookId) {
    try {
      const data = JSON.parse(localStorage.getItem(VERSION_KEY)) || {};
      delete data[bookId];
      localStorage.setItem(VERSION_KEY, JSON.stringify(data));
    } catch (err) {
      console.warn("Clear version history error:", err.message);
    }
  }
}

export const versionService = new VersionService();
