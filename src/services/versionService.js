import { STORAGE_KEYS } from '../utils/constants';

class VersionService {
  constructor() {
    this.initStorage();
  }

  initStorage() {
    if (!localStorage.getItem(STORAGE_KEYS.VERSION_HISTORY)) {
      localStorage.setItem(STORAGE_KEYS.VERSION_HISTORY, JSON.stringify({}));
    }
  }

  getSnapshots(bookId) {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEYS.VERSION_HISTORY)) || {};
      return data[bookId] || [];
    } catch {
      return [];
    }
  }

  createSnapshot(book, note = 'Automatic Autosave Snapshot') {
    if (!book) return;
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEYS.VERSION_HISTORY)) || {};
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
      localStorage.setItem(STORAGE_KEYS.VERSION_HISTORY, JSON.stringify(data));
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
      const data = JSON.parse(localStorage.getItem(STORAGE_KEYS.VERSION_HISTORY)) || {};
      delete data[bookId];
      localStorage.setItem(STORAGE_KEYS.VERSION_HISTORY, JSON.stringify(data));
    } catch (err) {
      console.warn("Clear version history error:", err.message);
    }
  }
}

export const versionService = new VersionService();
