// Firebase Service Adapter for optional secondary sync and Google sign-in
// Uses dynamic loading to keep primary bundle lean when unconfigured.

const getFirebaseConfig = () => ({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
});

export const isFirebaseConfigured = () => {
  const config = getFirebaseConfig();
  return Boolean(config.apiKey && config.projectId);
};

let firebaseInstances = null;

export const initFirebase = async () => {
  if (!isFirebaseConfigured()) return null;
  if (firebaseInstances) return firebaseInstances;

  try {
    const { initializeApp } = await import("firebase/app");
    const { getAuth, GoogleAuthProvider } = await import("firebase/auth");
    const { getFirestore } = await import("firebase/firestore");
    const { getStorage } = await import("firebase/storage");

    const app = initializeApp(getFirebaseConfig());
    const auth = getAuth(app);
    const db = getFirestore(app);
    const storage = getStorage(app);
    const googleProvider = new GoogleAuthProvider();

    firebaseInstances = { app, auth, db, storage, googleProvider };
    return firebaseInstances;
  } catch (err) {
    console.warn("Firebase initialization warning:", err.message);
    return null;
  }
};

export const firebaseSignInWithGoogle = async (rememberMe = true) => {
  if (!isFirebaseConfigured()) {
    throw new Error("Google Sign-In is not configured in this environment.");
  }
  const instances = await initFirebase();
  if (!instances) throw new Error("Could not initialize authentication provider.");

  const { signInWithPopup, setPersistence, browserLocalPersistence, browserSessionPersistence } = await import("firebase/auth");
  await setPersistence(instances.auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
  const result = await signInWithPopup(instances.auth, instances.googleProvider);
  return {
    id: result.user.uid,
    name: result.user.displayName || result.user.email.split('@')[0],
    email: result.user.email,
    photoURL: result.user.photoURL
  };
};

export const syncBookToFirestore = async (book) => {
  if (!isFirebaseConfigured() || !book) return;
  const instances = await initFirebase();
  if (!instances || !instances.db) return;

  try {
    const { doc, setDoc } = await import("firebase/firestore");
    const bookRef = doc(instances.db, "books", book.id);
    await setDoc(bookRef, {
      ...book,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.warn("Firestore sync warning:", err.message);
  }
};

export const deleteBookFromFirestore = async (bookId) => {
  if (!isFirebaseConfigured() || !bookId) return;
  const instances = await initFirebase();
  if (!instances || !instances.db) return;

  try {
    const { doc, deleteDoc } = await import("firebase/firestore");
    await deleteDoc(doc(instances.db, "books", bookId));
  } catch (err) {
    console.warn("Firestore delete warning:", err.message);
  }
};
