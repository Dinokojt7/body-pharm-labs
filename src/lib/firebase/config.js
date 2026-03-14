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

// Firebase Auth uses browser-only APIs (localStorage, window, etc.).
// Never initialize on the server — all auth/firestore calls in this app
// are behind "use client" components so null is safe during SSR/prerendering.
const isClient = typeof window !== "undefined";

const app = isClient
  ? getApps().length === 0
    ? initializeApp(firebaseConfig)
    : getApps()[0]
  : null;

const db = app ? getFirestore(app) : null;
const auth = app ? getAuth(app) : null;

export { app, db, auth };
