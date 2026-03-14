"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, Trash2 } from "lucide-react";

import { useCartStore } from "@/lib/stores/cart-store";
import { useCurrency } from "@/lib/hooks/useCurrency";
import { usePreventScroll } from "@/lib/hooks/usePreventScroll";
import QuantitySelector from "../shop/QuantitySelector";

const CartSidebar = () => {
  const {
    items,
    totalItems,
    subtotal,
    isOpen,
    closeCart,
    updateQuantity,
    removeItem,
    updateItemSize,
  } = useCartStore();

  const { formatPrice } = useCurrency();
  const sidebarRef = useRef(null);

  usePreventScroll(isOpen);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") closeCart();
    };

    if (isOpen) {
      window.addEventListener("keydown", handleEscape);
    }

    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, closeCart]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        closeCart();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, closeCart]);

  const shippingThreshold = 250;
  const remainingForFree = Math.max(0, shippingThreshold - subtotal);
  const progress = Math.min((subtotal / shippingThreshold) * 100, 100);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Sidebar */}
          <motion.div
            ref={sidebarRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold">CART ({totalItems})</h2>
              <button
                onClick={closeCart}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Free Shipping Progress */}
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <p className="text-sm mb-2">
                {subtotal >= shippingThreshold ? (
                  <span className="text-green-600 font-medium">
                    You've qualified for FREE shipping! 🎉
                  </span>
                ) : (
                  <>
                    Add{" "}
                    <span className="font-bold">
                      {formatPrice(remainingForFree)}
                    </span>{" "}
                    more for
                    <span className="font-bold"> FREE shipping</span>
                  </>
                )}
              </p>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-black"
                />
              </div>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">Your cart is empty</p>
                  <Link
                    href="/shop"
                    onClick={closeCart}
                    className="inline-block mt-4 px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
                  >
                    Continue Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {items.map((item) => (
                    <div
                      key={item.cartId}
                      className="flex space-x-4 border-b border-gray-100 pb-4"
                    >
                      {/* Product Image */}
                      <div className="relative w-20 h-20 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                        <Image
                          src={item.image || "/images/placeholder.jpg"}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-gray-900 truncate">
                              {item.name}
                            </h3>
                            <p className="text-sm text-gray-500">{item.type}</p>
                            <p className="text-sm text-gray-500">
                              Size: {item.selectedSize}
                            </p>
                          </div>
                          <button
                            onClick={() => removeItem(item.cartId)}
                            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-gray-400" />
                          </button>
                        </div>

                        <div className="flex justify-between items-center mt-2">
                          <QuantitySelector
                            quantity={item.quantity}
                            onIncrement={() =>
                              updateQuantity(item.cartId, item.quantity + 1)
                            }
                            onDecrement={() =>
                              updateQuantity(item.cartId, item.quantity - 1)
                            }
                            size="sm"
                          />
                          <div className="text-right">
                            <p className="font-medium">
                              {formatPrice(item.price * item.quantity)}
                            </p>
                            <p className="text-xs text-gray-500 line-through">
                              {formatPrice(item.originalPrice * item.quantity)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-gray-200 p-6 space-y-4">
                {/* Subtotal */}
                <div className="flex justify-between text-lg">
                  <span className="font-medium">Subtotal:</span>
                  <span className="font-bold">{formatPrice(subtotal)}</span>
                </div>

                {/* Tax & Shipping Note */}
                <p className="text-sm text-gray-500">
                  Shipping and taxes calculated at checkout
                </p>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Link
                    href="/cart"
                    onClick={closeCart}
                    className="block w-full py-3 text-center border-2 border-black text-black font-medium rounded-md hover:bg-black hover:text-white transition-colors"
                  >
                    VIEW CART
                  </Link>
                  <Link
                    href="/checkout"
                    onClick={closeCart}
                    className="block w-full py-3 text-center bg-black text-white font-medium rounded-md hover:bg-gray-800 transition-colors"
                  >
                    CHECKOUT
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartSidebar;
