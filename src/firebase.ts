import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Try to load the local config file if it exists (it's in .gitignore)
let localConfig: any = {};
try {
  // Use dynamic import to avoid build errors if the file doesn't exist
  const globResult = import.meta.glob('../firebase-applet-config.json', { eager: true });
  const firstMatch: any = Object.values(globResult)[0];
  localConfig = firstMatch?.default || firstMatch || {};
} catch (e) {
  // Ignore
}

const firebaseConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || localConfig.projectId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || localConfig.appId,
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || localConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || localConfig.authDomain,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || localConfig.firestoreDatabaseId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || localConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || localConfig.messagingSenderId,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || localConfig.measurementId || ""
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
  try {
    await signInWithPopup(auth, googleProvider);
  } catch (error) {
    console.error("Error signing in with Google", error);
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out", error);
  }
};
