"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, ShoppingBag } from "lucide-react";

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
  } = useCartStore();

  const { formatPrice } = useCurrency();
  const sidebarRef = useRef(null);

  usePreventScroll(isOpen);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") closeCart();
    };
    if (isOpen) window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, closeCart]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target))
        closeCart();
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
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
            className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm"
          />

          {/* Sidebar */}
          <motion.div
            ref={sidebarRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed right-0 top-0 h-full w-full max-w-sm bg-white z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <h2 className="text-sm font-bold tracking-[0.15em] uppercase">
                  Your Cart
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {totalItems} {totalItems === 1 ? "item" : "items"}
                </p>
              </div>
              <button
                onClick={closeCart}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Free Shipping Progress */}
            <div className="px-6 py-3 bg-gray-50 border-b border-gray-100">
              <p className="text-xs mb-2 text-gray-600">
                {subtotal >= shippingThreshold ? (
                  <span className="font-semibold text-black">
                    You've unlocked FREE shipping!
                  </span>
                ) : (
                  <>
                    <span className="font-semibold text-black">
                      {formatPrice(remainingForFree)}
                    </span>{" "}
                    away from free shipping
                  </>
                )}
              </p>
              <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-black rounded-full"
                />
              </div>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex col items-center justify-center h-full text-center gap-4">
                  <ShoppingBag className="w-12 h-12 text-gray-200" />
                  <p className="text-gray-400 text-sm">Your cart is empty</p>
                  <Link
                    href="/shop"
                    onClick={closeCart}
                    className="text-xs font-semibold tracking-widest uppercase border-b border-black pb-0.5 hover:opacity-60 transition-opacity"
                  >
                    Shop Now
                  </Link>
                </div>
              ) : (
                <div className="space-y-5">
                  {items.map((item) => (
                    <div key={item.cartId} className="flex gap-4">
                      {/* Image */}
                      <div className="relative w-18 h-18 bg-gray-50 rounded-lg overflow-hidden shrink-0 border border-gray-100">
                        <Image
                          src={item.image || "/images/placeholder.jpg"}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <div className="min-w-0">
                            <h3 className="font-semibold text-sm text-black truncate">
                              {item.name}
                            </h3>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {item.selectedSize}
                            </p>
                          </div>
                          <button
                            onClick={() => removeItem(item.cartId)}
                            className="p-1 hover:bg-gray-100 rounded-full transition-colors shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-gray-400" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between mt-3">
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
                          <p className="font-semibold text-sm">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-gray-100 px-6 py-5 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Subtotal</span>
                  <span className="font-bold text-base">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  Shipping and taxes calculated at checkout
                </p>
                <div className="space-y-2.5">
                  <Link
                    href="/cart"
                    onClick={closeCart}
                    className="block w-full py-3 text-center border border-black text-black text-sm font-semibold tracking-wider uppercase rounded-lg hover:bg-black hover:text-white transition-colors"
                  >
                    View Cart
                  </Link>
                  <Link
                    href="/checkout"
                    onClick={closeCart}
                    className="block w-full py-3 text-center bg-black text-white text-sm font-semibold tracking-wider uppercase rounded-lg hover:bg-gray-900 transition-colors"
                  >
                    Checkout
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
