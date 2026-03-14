"use client";

import { createContext, useEffect } from "react";
import { useAuthStore } from "@/lib/stores/auth-store";
import { onAuthChange } from "@/lib/firebase/auth";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { setUser, setAuthLoading } = useAuthStore();

  useEffect(() => {
    setAuthLoading(true);

    const unsubscribe = onAuthChange((user) => {
      if (user) {
        // Transform Firebase user to our user model
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
  }, [setUser, setAuthLoading]);

  return <AuthContext.Provider value={{}}>{children}</AuthContext.Provider>;
};
