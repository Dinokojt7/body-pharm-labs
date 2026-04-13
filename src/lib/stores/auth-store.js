import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      profileName: "",
      isAuthenticated: false,
      authLoading: true,
      authError: null,
      isNewUser: false,

      setUser: (user, isNewUser = false) =>
        set({
          user,
          isAuthenticated: !!user,
          authLoading: false,
          authError: null,
          isNewUser,
        }),

      clearNewUser: () => set({ isNewUser: false }),

      setAuthLoading: (loading) => set({ authLoading: loading }),

      setAuthError: (error) => set({ authError: error, authLoading: false }),

      setProfileName: (name) => set({ profileName: name }),

      logout: () =>
        set({
          user: null,
          profileName: "",
          isAuthenticated: false,
          authLoading: false,
          authError: null,
          isNewUser: false,
        }),

      // Helper to check if user has required role/permissions
      hasRole: (role) => {
        const user = get().user;
        return user?.roles?.includes(role) || false;
      },

      // Helper to get user's display name
      getDisplayName: () => {
        const { user, profileName } = get();
        if (!user) return "";
        return profileName || user.displayName || user.email?.split("@")[0] || "User";
      },
    }),
    {
      name: "auth-storage",
      getStorage: () => localStorage,
    },
  ),
);
