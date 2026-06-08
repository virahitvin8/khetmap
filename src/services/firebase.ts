/**
 * Firebase Configuration & Initialization
 * 
 * Provides Firestore (cloud database) for syncing user fields across devices.
 * Uses Firebase Admin SDK-equivalent client SDK for web/mobile.
 */

import { initializeApp, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, Firestore,
  collection, doc, setDoc, getDoc, getDocs, 
  query, where, orderBy, onSnapshot, 
  deleteDoc, updateDoc, Timestamp 
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

export function initFirebase(): boolean {
  const required = ['VITE_FIREBASE_API_KEY', 'VITE_FIREBASE_PROJECT_ID'];
  const missing = required.filter(k => !import.meta.env[k]);
  
  if (missing.length > 0) {
    console.warn(`Firebase not initialized. Missing env vars: ${missing.join(', ')}`);
    return false;
  }

  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log('✅ Firebase Firestore initialized');
    return true;
  } catch (e) {
    console.error('Failed to initialize Firebase:', e);
    return false;
  }
}

export function getDb(): Firestore {
  if (!db) throw new Error('Firebase not initialized. Call initFirebase() first.');
  return db;
}

export function isFirebaseReady(): boolean {
  return !!db;
}

// Re-export Firestore utilities
export {
  collection, doc, setDoc, getDoc, getDocs,
  query, where, orderBy, onSnapshot,
  deleteDoc, updateDoc, Timestamp
};
