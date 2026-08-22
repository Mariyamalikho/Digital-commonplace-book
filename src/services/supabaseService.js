import { createClient } from "@supabase/supabase-js";
import { DEFAULT_INITIAL_BOOK } from "./storageService";
import { DEFAULT_JOURNAL_TITLE } from "../utils/constants";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = () => {
  return Boolean(supabaseUrl && supabaseAnonKey);
};

export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// --- AUTHENTICATION ---
export const supabaseSignup = async (name, email, password) => {
  if (!supabase) throw new Error("Supabase is not configured.");
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
      },
    },
  });

  if (error) throw new Error(error.message);

  if (!data.session) {
    throw new Error("Please check your email to confirm your account before signing in.");
  }

  const user = {
    id: data.user.id,
    name: name || email.split("@")[0],
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

  return user;
};

export const supabaseLogin = async (email, password) => {
  if (!supabase) throw new Error("Supabase is not configured.");

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw new Error(error.message);

  return {
    id: data.user.id,
    name: data.user.user_metadata?.full_name || email.split("@")[0],
    email: data.user.email,
  };
};

export const supabaseLogout = async () => {
  if (!supabase) return;
  await supabase.auth.signOut();
};

export const supabaseForgotPassword = async (email) => {
  if (!supabase) throw new Error("Supabase is not configured.");
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw new Error(error.message);
  return `Password reset link sent to ${email}.`;
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
export const supabaseGetUserBooks = async (user) => {
  if (!supabase || !user || !user.id) return [];

  // RLS handles visibility, so we just select
  const { data, error } = await supabase
    .from("books")
    .select("*")
    .order("createdAt", { ascending: false });

  if (error) {
    // TODO: Handle offline mode where we can't reach the database
    console.error("Error fetching books:", error);
    return [];
  }

  if (data.length === 0) {
    // Create default book since they might have signed up with email confirmation,
    // which prevents book creation during the signup process due to RLS.
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

    // Strip privacy before insert
    const { privacy, ...dbBook } = newBook;

    const { error: insertError } = await supabase
      .from("books")
      .insert([dbBook]);
    if (!insertError) {
      return [newBook];
    } else {
      console.error("Error inserting default book:", insertError);
    }
  }

  return data;
};

export const supabaseSaveBook = async (book) => {
  if (!supabase) return;

  // Format for DB insertion (omit id if it's new, though our app generates UUIDs, so it's fine)
  // Ensure JSON structure is intact
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

  const { error } = await supabase.from("books").upsert(bookData);

  if (error) {
    console.error("Error saving book:", error);
  }
};

export const supabaseDeleteBook = async (bookId) => {
  if (!supabase) return false;
  const { error } = await supabase.from("books").delete().eq("id", bookId);
  if (error) {
    console.error("Error deleting book:", error);
    return false;
  }
  return true;
};

// --- STORAGE (MEDIA) ---
export const supabaseUploadMedia = async (file, path) => {
  if (!supabase) throw new Error("Supabase is not configured.");

  const { data, error } = await supabase.storage
    .from("media")
    .upload(path, file, {
      cacheControl: "3600",
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

  // Call the secure RPC function to safely bypass RLS
  const { data, error } = await supabase.rpc("join_book_via_token", {
    invite_token: token,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

// --- GUEST ACCESS (NO LOGIN) ---
export const supabaseGetBookViaToken = async (token) => {
  if (!supabase) throw new Error("Supabase is not configured.");

  const { data, error } = await supabase.rpc("get_book_via_token", {
    invite_token: token,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const supabaseUpdateBookViaToken = async (token, bookData) => {
  if (!supabase) throw new Error("Supabase is not configured.");

  const { data, error } = await supabase.rpc("update_book_via_token", {
    invite_token: token,
    book_data: bookData,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};
