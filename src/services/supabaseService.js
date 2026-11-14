import { createClient } from "@supabase/supabase-js";
import { DEFAULT_INITIAL_BOOK } from "./storageService";
import { DEFAULT_JOURNAL_TITLE } from "../utils/constants";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = () => {
  return Boolean(supabaseUrl && supabaseAnonKey);
};

export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

// --- FAST TIMEOUT HELPER (Prevents hanging when remote Supabase instance is paused) ---
const withTimeout = (promise, ms = 2500) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timed out")), ms)
    ),
  ]);
};

const isNetworkOrTimeoutError = (err) => {
  const msg = String(err?.message || err || "").toLowerCase();
  return (
    msg.includes("fetch") ||
    msg.includes("network") ||
    msg.includes("timed out") ||
    msg.includes("load failed") ||
    msg.includes("failed to fetch")
  );
};

// --- QUERY & LOCAL STORAGE CACHE ---
const queryCache = new Map();
const CACHE_TTL_MS = 20000;
const LOCAL_BOOK_CACHE_PREFIX = "grimoire_books_cache_";
const ACTIVE_USER_STORAGE_KEY = "grimoire_active_user";
const LOCAL_USERS_STORAGE_KEY = "grimoire_local_users";

export const buildDefaultBookForUser = (user) => ({
  ...DEFAULT_INITIAL_BOOK,
  id: `book-default-${user.id}`,
  ownerId: user.id,
  ownerName: user.name,
  title: `${user.name}'s ${DEFAULT_JOURNAL_TITLE}`,
  members: [
    { userId: user.id, name: user.name, role: "owner", email: user.email },
  ],
});

export const getCachedUserBooks = (userId) => {
  if (!userId) return null;
  const mem = queryCache.get(`books_${userId}`);
  if (mem?.data && mem.data.length > 0) return mem.data;
  try {
    const raw = localStorage.getItem(`${LOCAL_BOOK_CACHE_PREFIX}${userId}`);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
  } catch {
    return null;
  }
};

export const setCachedUserBooks = (userId, books) => {
  if (!userId || !Array.isArray(books)) return;
  queryCache.set(`books_${userId}`, { data: books, timestamp: Date.now() });
  try {
    localStorage.setItem(`${LOCAL_BOOK_CACHE_PREFIX}${userId}`, JSON.stringify(books));
  } catch {
    // Ignore storage quota errors
  }
};

export const getOrInitCachedUserBooks = (user) => {
  if (!user?.id) return [];
  const existing = getCachedUserBooks(user.id);
  if (existing && existing.length > 0) return existing;
  const fallback = [buildDefaultBookForUser(user)];
  setCachedUserBooks(user.id, fallback);
  return fallback;
};

export const invalidateBookCache = (userId) => {
  if (userId) {
    queryCache.delete(`books_${userId}`);
  } else {
    queryCache.clear();
  }
};

// --- SYNCHRONOUS ZERO-LATENCY SESSION READER ---
export const getInitialSessionUser = () => {
  try {
    const savedUserRaw = localStorage.getItem(ACTIVE_USER_STORAGE_KEY);
    if (savedUserRaw) {
      const parsedUser = JSON.parse(savedUserRaw);
      if (parsedUser?.id && parsedUser?.email) {
        return parsedUser;
      }
    }

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("sb-") && key.endsWith("-auth-token")) {
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        const parsed = JSON.parse(raw);
        const sessionUser = parsed?.user || parsed?.currentSession?.user;
        if (sessionUser?.id && sessionUser?.email) {
          const formatted = {
            id: sessionUser.id,
            name:
              sessionUser.user_metadata?.full_name ||
              sessionUser.email.split("@")[0],
            email: sessionUser.email,
          };
          localStorage.setItem(ACTIVE_USER_STORAGE_KEY, JSON.stringify(formatted));
          return formatted;
        }
      }
    }
  } catch {
    // Ignore localStorage parse errors
  }
  return null;
};

const saveActiveUserLocally = (user) => {
  try {
    if (user) {
      localStorage.setItem(ACTIVE_USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(ACTIVE_USER_STORAGE_KEY);
    }
  } catch {
    // Ignore storage errors
  }
};

// --- AUTHENTICATION ---
export const supabaseSignup = async (name, email, password) => {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = (name || "").trim() || cleanEmail.split("@")[0];

  if (supabase) {
    try {
      const { data, error } = await withTimeout(
        supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              full_name: cleanName,
            },
          },
        }),
        3000
      );

      if (error) {
        if (!isNetworkOrTimeoutError(error)) {
          throw new Error(error.message);
        }
      } else if (data?.user) {
        const user = {
          id: data.user.id,
          name: cleanName,
          email: data.user.email || cleanEmail,
        };
        saveActiveUserLocally(user);
        const newBook = {
          ...buildDefaultBookForUser(user),
          id: crypto.randomUUID(),
        };
        setCachedUserBooks(user.id, [newBook]);
        withTimeout(supabase.from("books").insert([newBook]), 2500).catch(() => {});
        return user;
      }
    } catch (err) {
      if (!isNetworkOrTimeoutError(err)) {
        throw err;
      }
    }
  }

  // Offline / Paused Supabase Fallback
  const localUsers = JSON.parse(localStorage.getItem(LOCAL_USERS_STORAGE_KEY) || "[]");
  if (localUsers.some((u) => u.email === cleanEmail)) {
    throw new Error("An account with this email already exists.");
  }
  const fallbackUser = {
    id: crypto.randomUUID(),
    name: cleanName,
    email: cleanEmail,
  };
  localUsers.push({ ...fallbackUser, password });
  localStorage.setItem(LOCAL_USERS_STORAGE_KEY, JSON.stringify(localUsers));
  saveActiveUserLocally(fallbackUser);
  getOrInitCachedUserBooks(fallbackUser);
  return fallbackUser;
};

export const supabaseLogin = async (email, password) => {
  const cleanEmail = email.trim().toLowerCase();

  if (supabase) {
    try {
      const { data, error } = await withTimeout(
        supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        }),
        3000
      );

      if (error) {
        if (!isNetworkOrTimeoutError(error)) {
          throw new Error(error.message);
        }
      } else if (data?.user) {
        const loggedUser = {
          id: data.user.id,
          name: data.user.user_metadata?.full_name || cleanEmail.split("@")[0],
          email: data.user.email,
        };
        saveActiveUserLocally(loggedUser);
        return loggedUser;
      }
    } catch (err) {
      if (!isNetworkOrTimeoutError(err)) {
        throw err;
      }
    }
  }

  // Offline / Paused Supabase Fallback
  const localUsers = JSON.parse(localStorage.getItem(LOCAL_USERS_STORAGE_KEY) || "[]");
  const existing = localUsers.find((u) => u.email === cleanEmail);
  if (existing) {
    if (existing.password !== password) {
      throw new Error("Invalid login credentials.");
    }
    const user = { id: existing.id, name: existing.name, email: existing.email };
    saveActiveUserLocally(user);
    getOrInitCachedUserBooks(user);
    return user;
  }

  // Allow seamless local session if user previously existed on paused remote project
  const deterministicId = `local-${btoa(cleanEmail).replace(/[^a-zA-Z0-9]/g, "").slice(0, 16)}`;
  const fallbackUser = {
    id: deterministicId,
    name: cleanEmail.split("@")[0],
    email: cleanEmail,
  };
  localUsers.push({ ...fallbackUser, password });
  localStorage.setItem(LOCAL_USERS_STORAGE_KEY, JSON.stringify(localUsers));
  saveActiveUserLocally(fallbackUser);
  getOrInitCachedUserBooks(fallbackUser);
  return fallbackUser;
};

export const supabaseLogout = async () => {
  invalidateBookCache();
  saveActiveUserLocally(null);
  try {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("sb-") && key.endsWith("-auth-token")) {
        localStorage.removeItem(key);
      }
    });
  } catch {
    // Ignore storage errors
  }
  if (supabase) {
    await withTimeout(supabase.auth.signOut(), 1500).catch(() => {});
  }
};

export const supabaseForgotPassword = async (email) => {
  const cleanEmail = email.trim().toLowerCase();
  if (supabase) {
    try {
      const { error } = await withTimeout(
        supabase.auth.resetPasswordForEmail(cleanEmail),
        2500
      );
      if (error && !isNetworkOrTimeoutError(error)) {
        throw new Error(error.message);
      }
    } catch (err) {
      if (!isNetworkOrTimeoutError(err)) throw err;
    }
  }
  return `Password reset link sent to ${cleanEmail}.`;
};

export const supabaseChangePassword = async (newPassword) => {
  if (supabase) {
    try {
      const { error } = await withTimeout(
        supabase.auth.updateUser({ password: newPassword }),
        2500
      );
      if (error && !isNetworkOrTimeoutError(error)) {
        throw new Error(error.message);
      }
    } catch (err) {
      if (!isNetworkOrTimeoutError(err)) throw err;
    }
  }
  return true;
};

export const supabaseGetCachedSessionUser = async () => {
  return getInitialSessionUser();
};

export const supabaseGetCurrentUser = async () => {
  const localUser = getInitialSessionUser();
  if (!supabase) return localUser;
  try {
    const {
      data: { user },
      error,
    } = await withTimeout(supabase.auth.getUser(), 2500);
    if (error || !user) return localUser;
    const formatted = {
      id: user.id,
      name: user.user_metadata?.full_name || user.email.split("@")[0],
      email: user.email,
    };
    saveActiveUserLocally(formatted);
    return formatted;
  } catch {
    return localUser;
  }
};

// --- DATABASE (BOOKS) ---
export const supabaseGetUserBooks = async (user, forceRefresh = false) => {
  if (!user || !user.id) return [];

  const cacheKey = `books_${user.id}`;
  const cached = queryCache.get(cacheKey);
  const now = Date.now();

  if (!forceRefresh && cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const localBooks = getOrInitCachedUserBooks(user);
  if (!supabase) return localBooks;

  try {
    const { data, error } = await withTimeout(
      supabase
        .from("books")
        .select(
          "id, ownerId, ownerName, title, subtitle, dedication, createdAt, updatedAt, cover, spreads, members"
        )
        .order("createdAt", { ascending: false }),
      2500
    );

    if (error) {
      return localBooks;
    }

    if (!data || data.length === 0) {
      const defaultBook = localBooks[0] || buildDefaultBookForUser(user);
      withTimeout(supabase.from("books").insert([defaultBook]), 2500).catch(
        () => {}
      );
      setCachedUserBooks(user.id, [defaultBook]);
      return [defaultBook];
    }

    setCachedUserBooks(user.id, data);
    return data;
  } catch {
    return localBooks;
  }
};

export const supabaseCreateNewBook = async (user, title = "New Journal") => {
  if (!user) throw new Error("Not authenticated");

  const cleanTitle = title.trim() || "New Journal";
  const newBook = {
    ...DEFAULT_INITIAL_BOOK,
    id: crypto.randomUUID(),
    ownerId: user.id,
    ownerName: user.name,
    title: cleanTitle,
    members: [
      { userId: user.id, name: user.name, role: "owner", email: user.email },
    ],
  };

  const existing = getOrInitCachedUserBooks(user);
  setCachedUserBooks(user.id, [newBook, ...existing]);

  if (supabase) {
    withTimeout(supabase.from("books").insert([newBook]), 2500).catch(() => {});
  }

  return newBook;
};

export const supabaseSaveBook = async (book) => {
  if (!book?.id) return;

  const bookData = {
    id: book.id,
    ownerId: book.ownerId,
    ownerName: book.ownerName,
    title: book.title,
    subtitle: book.subtitle,
    dedication: book.dedication,
    createdAt: book.createdAt,
    updatedAt: new Date().toISOString(),
    cover: book.cover,
    spreads: book.spreads,
    members: book.members,
  };

  // Optimistically persist to local cache first
  if (book.ownerId) {
    const cachedOwnerBooks = getCachedUserBooks(book.ownerId) || [];
    const updated = cachedOwnerBooks.some((b) => b.id === book.id)
      ? cachedOwnerBooks.map((b) => (b.id === book.id ? bookData : b))
      : [bookData, ...cachedOwnerBooks];
    setCachedUserBooks(book.ownerId, updated);
  }

  if (supabase) {
    withTimeout(
      supabase.from("books").update(bookData).eq("id", bookData.id),
      2500
    ).catch(() => {});
  }
};

export const supabaseDeleteBook = async (bookId) => {
  invalidateBookCache();
  try {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(LOCAL_BOOK_CACHE_PREFIX)) {
        const list = JSON.parse(localStorage.getItem(key) || "[]");
        if (Array.isArray(list)) {
          localStorage.setItem(
            key,
            JSON.stringify(list.filter((b) => b.id !== bookId))
          );
        }
      }
    });
  } catch {
    // Ignore storage errors
  }

  if (supabase) {
    await withTimeout(
      supabase.from("books").delete().eq("id", bookId),
      2500
    ).catch(() => {});
  }
  return true;
};

// --- MEDIA COMPRESSION & STORAGE ---
export const compressImage = async (file, maxWidth = 1600, quality = 0.82) => {
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml") {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result;
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(file);

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob && blob.size < file.size) {
              const compressedFile = new File(
                [blob],
                file.name.replace(/\.[^.]+$/, ".webp"),
                { type: "image/webp" }
              );
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          "image/webp",
          quality
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
};

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export const supabaseUploadMedia = async (file, path) => {
  const optimizedFile = await compressImage(file);

  if (supabase) {
    try {
      const { data, error } = await withTimeout(
        supabase.storage.from("media").upload(path, optimizedFile, {
          cacheControl: "31536000, immutable",
          upsert: true,
        }),
        4000
      );

      if (!error && data?.path) {
        const {
          data: { publicUrl },
        } = supabase.storage.from("media").getPublicUrl(data.path);
        return publicUrl;
      }
    } catch {
      // Fallback to inline data URL when storage is offline
    }
  }

  return await fileToDataUrl(optimizedFile);
};

// --- SHARING (TOKENS) ---
export const supabaseCreateShareToken = async (
  bookId,
  role = "visitor",
  expiresInDays = 30
) => {
  const user = await supabaseGetCurrentUser();
  if (!user) throw new Error("Must be logged in to create share link.");

  const token =
    "tok_" +
    Math.random().toString(36).substring(2, 10) +
    Date.now().toString(36);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);

  if (supabase) {
    try {
      await withTimeout(
        supabase.from("share_tokens").insert([
          {
            token,
            book_id: bookId,
            role,
            expires_at: expiresAt.toISOString(),
            created_by: user.id,
          },
        ]),
        2500
      );
    } catch {
      // Fallback to local token generation when offline
    }
  }

  return token;
};

export const supabaseJoinBookViaToken = async (token) => {
  if (!supabase) throw new Error("Supabase is not configured.");

  const { data, error } = await withTimeout(
    supabase.rpc("join_book_via_token", {
      invite_token: token.trim(),
    }),
    2500
  );

  if (error) throw new Error(error.message);
  invalidateBookCache();
  return data;
};

// --- GUEST ACCESS (NO LOGIN) ---
export const supabaseGetBookViaToken = async (token) => {
  if (!supabase) throw new Error("Supabase is not configured.");

  const { data, error } = await withTimeout(
    supabase.rpc("get_book_via_token", {
      invite_token: token.trim(),
    }),
    2500
  );

  if (error) throw new Error(error.message);
  return data;
};

export const supabaseUpdateBookViaToken = async (token, bookData) => {
  if (!supabase) throw new Error("Supabase is not configured.");

  const { data, error } = await withTimeout(
    supabase.rpc("update_book_via_token", {
      invite_token: token.trim(),
      book_data: bookData,
    }),
    2500
  );

  if (error) throw new Error(error.message);
  return data;
};
