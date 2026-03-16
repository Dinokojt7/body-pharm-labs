"use client";

import { createContext, useEffect } from "react";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useUIStore } from "@/lib/stores/ui-store";
import { onAuthChange, getGoogleRedirectResult } from "@/lib/firebase/auth";
import { createUserDoc } from "@/lib/firebase/firestore";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { setUser, setAuthLoading, setAuthError } = useAuthStore();
  const { openAuthModal, setIsAuthResolving } = useUIStore();

  useEffect(() => {
    setAuthLoading(true);

    // If the user was redirected to Google, re-open the modal in resolving state
    const redirectPending =
      typeof window !== "undefined" &&
      localStorage.getItem("auth_redirect_pending") === "1";

    if (redirectPending) {
      openAuthModal();
      setIsAuthResolving(true);
    }

    getGoogleRedirectResult().then(async ({ result, error }) => {
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_redirect_pending");
      }

      if (error) {
        setAuthError(error);
        setIsAuthResolving(false);
        return;
      }

      if (result?.user) {
        const { user, additionalUserInfo } = result;
        // Create Firestore user doc on first Google sign-in
        if (additionalUserInfo?.isNewUser) {
          await createUserDoc(user.uid, {
            email: user.email || "",
            displayName: user.displayName || "",
            phoneNumber: user.phoneNumber || "",
            photoURL: user.photoURL || "",
            provider: "google",
          });
        }
        // isAuthResolving stays true — onAuthChange will fire and the modal
        // will transition to "success" once isAuthenticated becomes true.
      } else {
        // No redirect result — clear resolving state so modal doesn't hang
        setIsAuthResolving(false);
      }
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
          metadata: {
            creationTime: user.metadata?.creationTime,
            lastSignInTime: user.metadata?.lastSignInTime,
          },
        };
        setUser(transformedUser);
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setAuthLoading, setAuthError, openAuthModal, setIsAuthResolving]);

  return <AuthContext.Provider value={{}}>{children}</AuthContext.Provider>;
};
