import { create } from "zustand";

export const useUIStore = create((set, get) => ({
  isMobileMenuOpen: false,
  isSearchOpen: false,
  isCurrencyDropdownOpen: false,
  isCheckoutLoading: false,
  isAuthModalOpen: false,

  openAuthModal: () => set({ isAuthModalOpen: true }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),

  // Loading states for async operations
  loadingStates: {},

  toggleMobileMenu: () =>
    set((state) => ({
      isMobileMenuOpen: !state.isMobileMenuOpen,
    })),

  closeMobileMenu: () => set({ isMobileMenuOpen: false }),

  toggleSearch: () =>
    set((state) => ({
      isSearchOpen: !state.isSearchOpen,
    })),

  toggleCurrencyDropdown: () =>
    set((state) => ({
      isCurrencyDropdownOpen: !state.isCurrencyDropdownOpen,
    })),

  setCheckoutLoading: (loading) => set({ isCheckoutLoading: loading }),

  // Generic loading state management
  setLoading: (key, isLoading) =>
    set((state) => ({
      loadingStates: { ...state.loadingStates, [key]: isLoading },
    })),

  getLoading: (key) => get().loadingStates[key] || false,
}));
