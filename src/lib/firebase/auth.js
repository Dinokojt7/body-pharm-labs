import {
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";
import { auth } from "./config";

const googleProvider = new GoogleAuthProvider();

// Triggers a full-page redirect to Google OAuth.
// The result is retrieved by getGoogleRedirectResult() on the next page load.
export const signInWithGoogle = async () => {
  try {
    await signInWithRedirect(auth, googleProvider);
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

// Call this once on app mount to resolve any pending Google redirect result.
// Returns { user, error } — user is null if no redirect was in progress.
export const getGoogleRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result?.user) return { user: result.user, error: null };
    return { user: null, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

export const setupRecaptcha = (containerId) => {
  try {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: "invisible",
      callback: () => {},
    });
    return window.recaptchaVerifier;
  } catch (error) {
    console.error("Recaptcha setup error:", error);
    return null;
  }
};

export const signInWithPhone = async (phoneNumber, appVerifier) => {
  try {
    const confirmationResult = await signInWithPhoneNumber(
      auth,
      phoneNumber,
      appVerifier,
    );
    return { confirmationResult, error: null };
  } catch (error) {
    return { confirmationResult: null, error: error.message };
  }
};

export const verifyPhoneOTP = async (confirmationResult, otp) => {
  try {
    const result = await confirmationResult.confirm(otp);
    return { user: result.user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};
