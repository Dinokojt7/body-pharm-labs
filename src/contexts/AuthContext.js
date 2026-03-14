"use client";

import { createContext, useEffect } from "react";
import { useAuthStore } from "@/lib/stores/auth-store";
import { onAuthChange, getGoogleRedirectResult } from "@/lib/firebase/auth";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { setUser, setAuthLoading, setAuthError } = useAuthStore();

  useEffect(() => {
    setAuthLoading(true);

    // Resolve any pending Google redirect sign-in from a previous page load.
    // onAuthStateChanged will also fire after this, so we only handle errors here.
    getGoogleRedirectResult().then(({ error }) => {
      if (error) setAuthError(error);
    });

    const unsubscribe = onAuthChange((user) => {
      if (user) {
        const transformedUser = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          phoneNumber: user.phoneNumber,
          emailVerified: user.emailVerified,
          roles: user.customClaims?.roles || ["customer"],
        };
        setUser(transformedUser);
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setAuthLoading, setAuthError]);

  return <AuthContext.Provider value={{}}>{children}</AuthContext.Provider>;
};
