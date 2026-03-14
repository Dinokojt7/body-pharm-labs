import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      subtotal: 0,
      isOpen: false,

      addItem: (product, quantity = 1, selectedSize = null) => {
        const items = get().items;
        const size = selectedSize || product.size || "";

        // Check if item already exists with same ID and size
        const existingItemIndex = items.findIndex(
          (item) => item.id === product.id && item.selectedSize === size,
        );

        let updatedItems;
        if (existingItemIndex > -1) {
          // Update quantity
          updatedItems = [...items];
          updatedItems[existingItemIndex].quantity += quantity;
        } else {
          // Add new item
          const newItem = {
            id: product.id,
            name: product.name,
            type: product.type,
            price: product.price,
            originalPrice: product.compareAtPrice || product.price,
            size: product.size,
            selectedSize: size,
            availableSizes: product.sizes || [product.size],
            image: product.imageString,
            purity: product.purity,
            points: product.points,
            quantity,
            cartId: `${product.id}-${size}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          };
          updatedItems = [...items, newItem];
        }

        // Recalculate totals
        const totalItems = updatedItems.reduce(
          (sum, item) => sum + item.quantity,
          0,
        );
        const subtotal = updatedItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0,
        );

        set({
          items: updatedItems,
          totalItems,
          subtotal,
          isOpen: true, // Open sidebar when adding items
        });
      },

      removeItem: (cartId) => {
        const items = get().items;
        const updatedItems = items.filter((item) => item.cartId !== cartId);

        const totalItems = updatedItems.reduce(
          (sum, item) => sum + item.quantity,
          0,
        );
        const subtotal = updatedItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0,
        );

        set({
          items: updatedItems,
          totalItems,
          subtotal,
        });
      },

      updateQuantity: (cartId, newQuantity) => {
        if (newQuantity < 1) {
          get().removeItem(cartId);
          return;
        }

        const items = get().items;
        const updatedItems = items.map((item) =>
          item.cartId === cartId ? { ...item, quantity: newQuantity } : item,
        );

        const totalItems = updatedItems.reduce(
          (sum, item) => sum + item.quantity,
          0,
        );
        const subtotal = updatedItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0,
        );

        set({
          items: updatedItems,
          totalItems,
          subtotal,
        });
      },

      updateItemSize: (cartId, newSize) => {
        const items = get().items;
        const updatedItems = items.map((item) =>
          item.cartId === cartId ? { ...item, selectedSize: newSize } : item,
        );

        set({ items: updatedItems });
      },

      clearCart: () => {
        set({ items: [], totalItems: 0, subtotal: 0 });
      },

      toggleCart: () => {
        set((state) => ({ isOpen: !state.isOpen }));
      },

      closeCart: () => {
        set({ isOpen: false });
      },

      openCart: () => {
        set({ isOpen: true });
      },

      getItemQuantity: (productId, selectedSize = "") => {
        const item = get().items.find(
          (item) => item.id === productId && item.selectedSize === selectedSize,
        );
        return item ? item.quantity : 0;
      },

      isInCart: (productId, selectedSize = "") => {
        return get().items.some(
          (item) => item.id === productId && item.selectedSize === selectedSize,
        );
      },
    }),
    {
      name: "body-pharm-cart",
      getStorage: () => localStorage,
    },
  ),
);
