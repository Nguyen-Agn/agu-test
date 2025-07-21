import admin from 'firebase-admin';

// Firebase configuration from your provided file
const firebaseConfig = {
  apiKey: "AIzaSyACNkF3676oHXDOcBAePP3hMcFuHsqehy4",
  authDomain: "agu-event-cpx.firebaseapp.com",
  projectId: "agu-event-cpx",
  storageBucket: "agu-event-cpx.firebasestorage.app",
  messagingSenderId: "137090996592",
  appId: "1:137090996592:web:d0dafcd0e22a72d90197b5",
  measurementId: "G-G1C6Y5H2CC"
};

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: firebaseConfig.projectId,
    // For production, you should use service account credentials
    // credential: admin.credential.cert(serviceAccount),
  });
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