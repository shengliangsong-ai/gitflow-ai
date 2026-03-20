import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID
};

// Check if the environment variables are actually loaded
const isConfigMissing = !firebaseConfig.apiKey || !firebaseConfig.authDomain;

if (isConfigMissing) {
  console.error(`
    🔴 FIREBASE CONFIGURATION MISSING 🔴
    You requested to move the Firebase config to environment secrets, but the secrets are currently empty!
    
    Please open the AI Studio Settings (⚙️ gear icon, top-right) -> Secrets, and add the following:
    - VITE_FIREBASE_PROJECT_ID
    - VITE_FIREBASE_APP_ID
    - VITE_FIREBASE_API_KEY
    - VITE_FIREBASE_AUTH_DOMAIN
    - VITE_FIREBASE_DATABASE_ID
    - VITE_FIREBASE_STORAGE_BUCKET
    - VITE_FIREBASE_MESSAGING_SENDER_ID
  `);
}

const app = initializeApp(isConfigMissing ? { apiKey: 'dummy', authDomain: 'dummy.firebaseapp.com', projectId: 'dummy' } : firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');

