// Firebase Service Adapter for Auth, Firestore, and Storage
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail, 
  signOut,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  deleteDoc 
} from "firebase/firestore";
import { 
  getStorage, 
  ref, 
  uploadString, 
  getDownloadURL 
} from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
};

let app = null;
let auth = null;
let db = null;
let storage = null;
let googleProvider = null;

export const isFirebaseConfigured = () => {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);
};

export const initFirebase = () => {
  if (isFirebaseConfigured() && !app) {
    try {
      app = initializeApp(firebaseConfig);
      auth = getAuth(app);
      db = getFirestore(app);
      storage = getStorage(app);
      googleProvider = new GoogleAuthProvider();
    } catch (err) {
      console.warn("Firebase initialization warning:", err.message);
    }
  }
  return { app, auth, db, storage, googleProvider };
};

// Initialize if env vars are configured
if (isFirebaseConfigured()) {
  initFirebase();
}

// Authentication Helpers
export const firebaseSignInWithGoogle = async (rememberMe = true) => {
  if (!isFirebaseConfigured() || !auth) {
    throw new Error("Firebase Auth is not configured. Please supply VITE_FIREBASE_API_KEY in your environment.");
  }
  await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
  const result = await signInWithPopup(auth, googleProvider || new GoogleAuthProvider());
  return {
    id: result.user.uid,
    name: result.user.displayName || result.user.email.split('@')[0],
    email: result.user.email,
    photoURL: result.user.photoURL
  };
};

export const firebaseSignUpEmail = async (email, password, rememberMe = true) => {
  if (!isFirebaseConfigured() || !auth) return null;
  await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
  const result = await createUserWithEmailAndPassword(auth, email, password);
  return {
    id: result.user.uid,
    name: email.split('@')[0],
    email: result.user.email
  };
};

export const firebaseLoginEmail = async (email, password, rememberMe = true) => {
  if (!isFirebaseConfigured() || !auth) return null;
  await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
  const result = await signInWithEmailAndPassword(auth, email, password);
  return {
    id: result.user.uid,
    name: result.user.displayName || result.user.email.split('@')[0],
    email: result.user.email
  };
};

export const firebaseSendPasswordReset = async (email) => {
  if (!isFirebaseConfigured() || !auth) return `Password reset link simulated for ${email}.`;
  await sendPasswordResetEmail(auth, email);
  return `Password reset link sent to ${email}.`;
};

export const firebaseLogout = async () => {
  if (auth) {
    await signOut(auth);
  }
};

// Firestore Sync Helpers
export const syncBookToFirestore = async (book) => {
  if (!db || !book) return;
  try {
    const bookRef = doc(db, "books", book.id);
    await setDoc(bookRef, {
      ...book,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.warn("Firestore sync warning:", err.message);
  }
};

export const deleteBookFromFirestore = async (bookId) => {
  if (!db || !bookId) return;
  try {
    await deleteDoc(doc(db, "books", bookId));
  } catch (err) {
    console.warn("Firestore delete warning:", err.message);
  }
};

export const uploadMediaToFirebaseStorage = async (dataUrl, path) => {
  if (!storage || !dataUrl) return dataUrl;
  try {
    const storageRef = ref(storage, path);
    await uploadString(storageRef, dataUrl, 'data_url');
    const url = await getDownloadURL(storageRef);
    return url;
  } catch (err) {
    console.warn("Firebase storage upload warning:", err.message);
    return dataUrl;
  }
};

export { auth, db, storage };
