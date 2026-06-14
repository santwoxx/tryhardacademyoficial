import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getFirestore, enableIndexedDbPersistence, CACHE_SIZE_UNLIMITED } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
export const firestore = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Enable Firestore offline persistence for PWA offline support
enableIndexedDbPersistence(firestore).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('[Firestore] Persistence failed: multiple tabs open');
  } else if (err.code === 'unimplemented') {
    console.warn('[Firestore] Persistence not supported by this browser');
  }
});
