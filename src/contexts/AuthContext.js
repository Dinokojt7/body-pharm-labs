"use client";

import { createContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/auth-store";
import { onAuthChange, getGoogleRedirectResult } from "@/lib/firebase/auth";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { setUser, setAuthLoading, setAuthError } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    setAuthLoading(true);

    getGoogleRedirectResult().then(({ result, error }) => {
      if (error) {
        setAuthError(error);
      } else if (result?.additionalUserInfo?.isNewUser) {
        router.push("/account?welcome=1");
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
  }, [setUser, setAuthLoading, setAuthError, router]);

  return <AuthContext.Provider value={{}}>{children}</AuthContext.Provider>;
};
