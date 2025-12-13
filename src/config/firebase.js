/**
 * Firebase Configuration
 * Initialize Firebase app and services
 */

import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

// Validate Firebase configuration
const isFirebaseConfigured = () => {
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.storageBucket
  );
};

// Initialize Firebase
let app = null;
let storage = null;

if (isFirebaseConfigured()) {
  try {
    app = initializeApp(firebaseConfig);
    storage = getStorage(app);
    console.log('Firebase initialized successfully');
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
} else {
  console.warn(
    'Firebase is not configured. Please set the following environment variables:\n' +
    'VITE_FIREBASE_API_KEY\n' +
    'VITE_FIREBASE_AUTH_DOMAIN\n' +
    'VITE_FIREBASE_PROJECT_ID\n' +
    'VITE_FIREBASE_STORAGE_BUCKET\n' +
    'VITE_FIREBASE_MESSAGING_SENDER_ID\n' +
    'VITE_FIREBASE_APP_ID'
  );
}

export { app, storage, isFirebaseConfigured };
export default app;





