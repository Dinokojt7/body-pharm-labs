import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      authLoading: true,
      authError: null,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          authLoading: false,
          authError: null,
        }),

      setAuthLoading: (loading) => set({ authLoading: loading }),

      setAuthError: (error) => set({ authError: error, authLoading: false }),

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          authLoading: false,
          authError: null,
        }),

      // Helper to check if user has required role/permissions
      hasRole: (role) => {
        const user = get().user;
        return user?.roles?.includes(role) || false;
      },

      // Helper to get user's display name
      getDisplayName: () => {
        const user = get().user;
        if (!user) return "";
        return user.displayName || user.email?.split("@")[0] || "User";
      },
    }),
    {
      name: "auth-storage",
      getStorage: () => localStorage,
    },
  ),
);
