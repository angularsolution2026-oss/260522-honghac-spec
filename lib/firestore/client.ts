'use client';

import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

/**
 * Firebase App + Firestore initialization
 * Uses env vars from `.env.local`:
 *   - NEXT_PUBLIC_FIREBASE_API_KEY
 *   - NEXT_PUBLIC_FIREBASE_PROJECT_ID
 *   - NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
 * etc.
 *
 * In Dev, can connect to local emulator if env var set.
 */

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase App
export const firebaseApp = initializeApp(firebaseConfig);

// Get Firestore instance
export const firestoreDb = getFirestore(firebaseApp);

// Connect to emulator in development (if env var set)
if (process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST && typeof window !== 'undefined') {
  const [host, port] = process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST.split(':');
  try {
    connectFirestoreEmulator(firestoreDb, host, parseInt(port, 10));
    console.log('[v0] Firestore connected to emulator:', process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST);
  } catch (err: unknown) {
    // Already connected, or error — silently continue
    if (err instanceof Error && !err.message.includes('already called')) {
      console.warn('[v0] Firestore emulator connection warning:', err.message);
    }
  }
}
