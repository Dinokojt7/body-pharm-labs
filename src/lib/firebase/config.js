import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// authDomain uses the current app domain so the /__/auth/* proxy rewrite works
// for signInWithRedirect on both localhost and production (Vercel).
const getAuthDomain = () => {
  if (typeof window !== "undefined") return window.location.host;
  return process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
};

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: getAuthDomain(),
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Guard: do not initialize Firebase during SSR/prerendering when env vars are
// unavailable. All Firebase Auth and Firestore calls are client-only anyway.
const canInit = typeof window !== "undefined" || !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

const app = canInit
  ? getApps().length === 0
    ? initializeApp(firebaseConfig)
    : getApps()[0]
  : null;

const db = app ? getFirestore(app) : null;
const auth = app ? getAuth(app) : null;

export { app, db, auth };
