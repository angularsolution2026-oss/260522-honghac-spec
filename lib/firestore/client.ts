'use client';

import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

/**
 * Firebase App + Firestore initialization
 * Uses env vars from `.env.local`:
 *   - NEXT_PUBLIC_FIREBASE_API_KEY
 *   - NEXT_PUBLIC_FIREBASE_PROJECT_ID
 *   - etc.
 *
 * In Dev, can connect to local emulator if env var set.
 * If config is incomplete, will skip initialization and log warning.
 */

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};

// Check if config is complete
const isConfigComplete = Object.values(firebaseConfig).every(v => v);

if (!isConfigComplete) {
  console.warn('[v0] Firebase config incomplete — skipping Firestore initialization');
}

// Initialize Firebase App only if config is complete
export const firebaseApp = isConfigComplete ? initializeApp(firebaseConfig) : null;

// Get Firestore instance only if app initialized
export const firestoreDb = firebaseApp ? getFirestore(firebaseApp) : null;

// Connect to emulator in development (if enabled and app initialized)
if (firebaseApp && process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST && typeof window !== 'undefined') {
  const [host, port] = process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST.split(':');
  try {
    connectFirestoreEmulator(firestoreDb!, host, parseInt(port, 10));
    console.log('[v0] Firestore connected to emulator:', process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST);
  } catch (err: unknown) {
    // Already connected, or error — silently continue
    if (err instanceof Error && !err.message.includes('already called')) {
      console.warn('[v0] Firestore emulator connection warning:', err.message);
    }
  }
}
