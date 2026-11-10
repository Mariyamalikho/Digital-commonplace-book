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

// --- QUERY CACHE (In-memory TTL to prevent redundant database queries) ---
const queryCache = new Map();
const CACHE_TTL_MS = 20000;

export const invalidateBookCache = (userId) => {
  if (userId) {
    queryCache.delete(`books_${userId}`);
  } else {
    queryCache.clear();
  }
};

// --- AUTHENTICATION ---
export const supabaseSignup = async (name, email, password) => {
  if (!supabase) throw new Error("Supabase is not configured.");
  
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = (name || "").trim();

  const { data, error } = await supabase.auth.signUp({
    email: cleanEmail,
    password,
    options: {
      data: {
        full_name: cleanName,
      },
    },
  });

  if (error) throw new Error(error.message);

  if (!data.session) {
    throw new Error("Please check your email to confirm your account before signing in.");
  }

  const user = {
    id: data.user.id,
    name: cleanName || cleanEmail.split("@")[0],
    email: data.user.email,
  };

  // Create default book in Supabase
  const newBook = {
    ...DEFAULT_INITIAL_BOOK,
    id: crypto.randomUUID(),
    ownerId: user.id,
    ownerName: user.name,
    title: `${user.name}'s ${DEFAULT_JOURNAL_TITLE}`,
    members: [
      { userId: user.id, name: user.name, role: "owner", email: user.email },
    ],
  };

  await supabase.from("books").insert([newBook]);
  invalidateBookCache(user.id);

  return user;
};

export const supabaseLogin = async (email, password) => {
  if (!supabase) throw new Error("Supabase is not configured.");

  const cleanEmail = email.trim().toLowerCase();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: cleanEmail,
    password,
  });

  if (error) throw new Error(error.message);

  return {
    id: data.user.id,
    name: data.user.user_metadata?.full_name || cleanEmail.split("@")[0],
    email: data.user.email,
  };
};

export const supabaseLogout = async () => {
  if (!supabase) return;
  invalidateBookCache();
  await supabase.auth.signOut();
};

export const supabaseForgotPassword = async (email) => {
  if (!supabase) throw new Error("Supabase is not configured.");
  const cleanEmail = email.trim().toLowerCase();
  const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail);
  if (error) throw new Error(error.message);
  return `Password reset link sent to ${cleanEmail}.`;
};

export const supabaseChangePassword = async (newPassword) => {
  if (!supabase) throw new Error("Supabase is not configured.");
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw new Error(error.message);
  return true;
};

export const supabaseGetCurrentUser = async () => {
  if (!supabase) return null;
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;
  return {
    id: user.id,
    name: user.user_metadata?.full_name || user.email.split("@")[0],
    email: user.email,
  };
};

// --- DATABASE (BOOKS) ---
export const supabaseGetUserBooks = async (user, forceRefresh = false) => {
  if (!supabase || !user || !user.id) return [];

  const cacheKey = `books_${user.id}`;
  const cached = queryCache.get(cacheKey);
  const now = Date.now();

  if (!forceRefresh && cached && (now - cached.timestamp < CACHE_TTL_MS)) {
    return cached.data;
  }

  // RLS handles visibility at the database engine level
  const { data, error } = await supabase
    .from("books")
    .select("id, ownerId, ownerName, title, subtitle, dedication, createdAt, updatedAt, cover, spreads, members")
    .order("createdAt", { ascending: false });

  if (error) {
    console.error("Error fetching books:", error);
    return cached ? cached.data : [];
  }

  if (data.length === 0) {
    const newBook = {
      ...DEFAULT_INITIAL_BOOK,
      id: crypto.randomUUID(),
      ownerId: user.id,
      ownerName: user.name,
      title: `${user.name}'s ${DEFAULT_JOURNAL_TITLE}`,
      members: [
        { userId: user.id, name: user.name, role: "owner", email: user.email },
      ],
    };

    const { error: insertError } = await supabase
      .from("books")
      .insert([newBook]);
    if (!insertError) {
      queryCache.set(cacheKey, { data: [newBook], timestamp: now });
      return [newBook];
    } else {
      console.error("Error inserting default book:", insertError);
    }
  }

  queryCache.set(cacheKey, { data, timestamp: now });
  return data;
};

export const supabaseCreateNewBook = async (user, title = "New Journal") => {
  if (!supabase || !user) throw new Error("Not authenticated");
  
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

  const { error } = await supabase.from("books").insert([newBook]);
  if (error) throw error;
  
  invalidateBookCache(user.id);
  return newBook;
};

export const supabaseSaveBook = async (book) => {
  if (!supabase || !book?.id) return;

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

  const { error } = await supabase
    .from("books")
    .update(bookData)
    .eq("id", bookData.id);

  if (error) {
    console.error("Error saving book:", error);
  } else {
    invalidateBookCache(book.ownerId);
  }
};

export const supabaseDeleteBook = async (bookId) => {
  if (!supabase) return false;
  const { error } = await supabase.from("books").delete().eq("id", bookId);
  if (error) {
    console.error("Error deleting book:", error);
    return false;
  }
  invalidateBookCache();
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

export const supabaseUploadMedia = async (file, path) => {
  if (!supabase) throw new Error("Supabase is not configured.");

  const optimizedFile = await compressImage(file);

  const { data, error } = await supabase.storage
    .from("media")
    .upload(path, optimizedFile, {
      cacheControl: "31536000, immutable",
      upsert: true,
    });

  if (error) throw new Error(error.message);

  const {
    data: { publicUrl },
  } = supabase.storage.from("media").getPublicUrl(data.path);

  return publicUrl;
};

// --- SHARING (TOKENS) ---
export const supabaseCreateShareToken = async (
  bookId,
  role = "visitor",
  expiresInDays = 30,
) => {
  if (!supabase) throw new Error("Supabase is not configured.");

  const user = await supabaseGetCurrentUser();
  if (!user) throw new Error("Must be logged in to create share link.");

  const token =
    "tok_" +
    Math.random().toString(36).substring(2, 10) +
    Date.now().toString(36);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);

  const { error } = await supabase.from("share_tokens").insert([
    {
      token,
      book_id: bookId,
      role,
      expires_at: expiresAt.toISOString(),
      created_by: user.id,
    },
  ]);

  if (error) throw new Error(error.message);
  return token;
};

export const supabaseJoinBookViaToken = async (token) => {
  if (!supabase) throw new Error("Supabase is not configured.");

  const { data, error } = await supabase.rpc("join_book_via_token", {
    invite_token: token.trim(),
  });

  if (error) throw new Error(error.message);
  invalidateBookCache();
  return data;
};

// --- GUEST ACCESS (NO LOGIN) ---
export const supabaseGetBookViaToken = async (token) => {
  if (!supabase) throw new Error("Supabase is not configured.");

  const { data, error } = await supabase.rpc("get_book_via_token", {
    invite_token: token.trim(),
  });

  if (error) throw new Error(error.message);
  return data;
};

export const supabaseUpdateBookViaToken = async (token, bookData) => {
  if (!supabase) throw new Error("Supabase is not configured.");

  const { data, error } = await supabase.rpc("update_book_via_token", {
    invite_token: token.trim(),
    book_data: bookData,
  });

  if (error) throw new Error(error.message);
  return data;
};
