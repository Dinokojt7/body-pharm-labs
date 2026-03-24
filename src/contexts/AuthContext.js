"use client";

import { createContext, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useUIStore } from "@/lib/stores/ui-store";
import { onAuthChange, getGoogleRedirectResult } from "@/lib/firebase/auth";
import { createUserDoc, getUserProfile } from "@/lib/firebase/firestore";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { setUser, setAuthLoading, setAuthError } = useAuthStore();
  const { openAuthModal, setIsAuthResolving } = useUIStore();
  const router = useRouter();
  const pathname = usePathname();
  const profileChecked = useRef(false);

  useEffect(() => {
    setAuthLoading(true);

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
        if (additionalUserInfo?.isNewUser) {
          await createUserDoc(user.uid, {
            email: user.email || "",
            displayName: user.displayName || "",
            phoneNumber: user.phoneNumber || "",
            photoURL: user.photoURL || "",
            provider: "google",
          });
          profileChecked.current = true;
        }
      } else {
        setIsAuthResolving(false);
      }
    });

    const unsubscribe = onAuthChange(async (user) => {
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

        // Once per session: check if Firestore user doc exists.
        // If missing (doc creation failed or user signed in before we added this),
        // send them to account to complete their profile.
        if (!profileChecked.current) {
          profileChecked.current = true;
          const { profile } = await getUserProfile(user.uid);
          if (!profile && pathname !== "/account" && !pathname.startsWith("/admin")) {
            router.push("/account?welcome=1");
          }
        }
      } else {
        setUser(null);
        profileChecked.current = false;
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setAuthLoading, setAuthError, openAuthModal, setIsAuthResolving, router, pathname]);

  return <AuthContext.Provider value={{}}>{children}</AuthContext.Provider>;
};
