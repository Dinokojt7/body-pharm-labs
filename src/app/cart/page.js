"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, ShoppingBag, ArrowRight } from "lucide-react";

import { useCartStore } from "@/lib/stores/cart-store";
import { useCurrency } from "@/lib/hooks/useCurrency";
import QuantitySelector from "@/components/shop/QuantitySelector";

export default function CartPage() {
  const router = useRouter();
  const { items, totalItems, subtotal, updateQuantity, removeItem } =
    useCartStore();
  const { formatPrice } = useCurrency();

  const shippingThreshold = 250;
  const remainingForFree = Math.max(0, shippingThreshold - subtotal);
  const progress = Math.min((subtotal / shippingThreshold) * 100, 100);
  const shippingCost = subtotal >= shippingThreshold ? 0 : 15;
  const tax = subtotal * 0.15;
  const total = subtotal + tax + shippingCost;

  return (
    <main className="min-h-screen bg-white pt-32 pb-20">
      <div className="max-w-5xl mx-auto px-4 md:px-8">
        <h1 className="text-2xl font-bold tracking-tight text-black mb-10">
          Your Cart{" "}
          {totalItems > 0 && (
            <span className="text-gray-400 font-normal text-base ml-2">
              ({totalItems} {totalItems === 1 ? "item" : "items"})
            </span>
          )}
        </h1>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-5 text-center">
            <ShoppingBag className="w-14 h-14 text-gray-200" />
            <p className="text-gray-400 text-sm">Your cart is empty</p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-5 py-2 border border-gray-200 rounded-lg text-xs font-medium tracking-widest uppercase text-black hover:bg-gray-50 transition-colors"
            >
              Shop Now
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Items list */}
            <div className="lg:col-span-2 space-y-6">
              {/* Free shipping progress */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
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
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-black rounded-full"
                  />
                </div>
              </div>

              {/* Cart items */}
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={item.cartId}
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="flex gap-5 py-5 border-b border-gray-100"
                  >
                    {/* Image */}
                    <Link
                      href={`/shop/${item.slug || item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                      className="relative w-24 h-24 bg-gray-50 rounded-xl overflow-hidden shrink-0 border border-gray-100"
                    >
                      <Image
                        src={item.image || "/images/placeholder.jpg"}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </Link>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-4">
                        <div className="min-w-0">
                          <Link
                            href={`/shop/${item.slug || item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                          >
                            <h3 className="font-bold text-sm text-black uppercase tracking-wide truncate hover:opacity-60 transition-opacity">
                              {item.name}
                            </h3>
                          </Link>
                          {item.selectedSize && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              {item.selectedSize}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => removeItem(item.cartId)}
                          className="p-1.5 rounded-full hover:bg-gray-100 transition-colors shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-gray-400" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-4">
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
                        <p className="font-bold text-sm">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              <Link
                href="/shop"
                className="inline-flex items-center gap-2 text-xs text-gray-400 hover:text-black transition-colors mt-2"
              >
                ← Continue Shopping
              </Link>
            </div>

            {/* Order summary */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6 sticky top-32">
                <h2 className="text-sm font-bold tracking-[0.12em] uppercase text-black mb-5">
                  Order Summary
                </h2>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Shipping</span>
                    <span className="font-medium">
                      {shippingCost === 0 ? "Free" : formatPrice(shippingCost)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Tax (15% VAT)</span>
                    <span className="font-medium">{formatPrice(tax)}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold pt-3 border-t border-gray-200">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="mt-6 block w-full py-3 text-center bg-black text-white text-sm font-semibold tracking-wider uppercase rounded-xl hover:bg-gray-900 transition-colors"
                >
                  Proceed to Checkout
                </Link>

                <p className="text-xs text-gray-400 text-center mt-3">
                  Taxes & shipping calculated at checkout
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
