import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { join } from 'path';

// Firebase configuration from your provided file
const firebaseConfig = {
  apiKey: process.env.GOOGLE_API_KEY || "AIzaSyACNkF3676oHXDOcBAePP3hMcFuHsqehy4",
  authDomain: "agu-event-cpx.firebaseapp.com",
  projectId: "agu-event-cpx",
  storageBucket: "agu-event-cpx.firebasestorage.app",
  messagingSenderId: "137090996592",
  appId: "1:137090996592:web:238f24b8279a6c6f0197b5",
  measurementId: "G-5HRXVT4E8C"
};

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    // Try to read from environment variable first
    let serviceAccount;
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    } else {
      // Try to read from firebase-key.json file
      const keyPath = join(process.cwd(), 'firebase-key.json');
      const serviceAccountKey = readFileSync(keyPath, 'utf8');
      serviceAccount = JSON.parse(serviceAccountKey);
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: firebaseConfig.projectId,
    });
    
    console.log('Firebase initialized successfully!');
  } catch (error) {
    console.error('Firebase initialization error:', error instanceof Error ? error.message : 'Unknown error');
    console.log('Please ensure you have either:');
    console.log('1. FIREBASE_SERVICE_ACCOUNT_KEY environment variable, or');
    console.log('2. firebase-key.json file in the root directory');
    
    // Fallback initialization for development
    admin.initializeApp({
      projectId: firebaseConfig.projectId,
    });
  }
}

export const db = admin.firestore();
export const auth = admin.auth();

// Collection names
export const COLLECTIONS = {
  STUDENTS: 'students',
  TRANSACTIONS: 'transactions',
  MARKET_SESSIONS: 'market_sessions',
  ADMINS: 'admins'
} as const;