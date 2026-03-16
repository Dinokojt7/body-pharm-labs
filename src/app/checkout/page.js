"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Lock, User } from "lucide-react";

import { useCartStore } from "@/lib/stores/cart-store";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useUIStore } from "@/lib/stores/ui-store";
import { useCurrency } from "@/lib/hooks/useCurrency";
import CheckoutForm from "@/components/forms/CheckoutForm";
import Breadcrumb from "@/components/ui/Breadcrumb";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal } = useCartStore();
  const { isAuthenticated, authLoading } = useAuthStore();
  const { openAuthModal } = useUIStore();
  const { formatPrice } = useCurrency();

  const [shippingCost, setShippingCost] = useState(0);
  const [loading, setLoading] = useState(false);

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      router.push("/cart");
    }
  }, [items, router]);

  const tax = subtotal * 0.15; // 15% VAT
  const total = subtotal + tax + shippingCost;

  if (items.length === 0) return null;

  // Auth guard — require sign-in before placing an order
  if (!authLoading && !isAuthenticated) {
    return (
      <main className="min-h-screen bg-white flex flex-col">
        <Breadcrumb />
        <div className="flex-1 flex items-center justify-center px-4 py-20">
          <div className="text-center max-w-sm">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
              <User className="w-6 h-6 text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-black mb-2">Sign in to continue</h2>
            <p className="text-sm text-gray-400 mb-8">
              You need to be signed in to place an order so we can link it to your account and send updates.
            </p>
            <button
              onClick={openAuthModal}
              className="h-12 px-8 rounded bg-black text-white text-xs font-bold tracking-widest uppercase hover:bg-gray-800 transition-colors"
            >
              Sign In
            </button>
            <div className="mt-4">
              <Link href="/shop" className="text-xs text-gray-400 hover:text-black transition-colors">
                ← Back to shop
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="">
      <Breadcrumb />

      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-12">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <CheckoutForm
              subtotal={subtotal}
              tax={tax}
              shippingCost={shippingCost}
              total={total}
              onShippingChange={setShippingCost}
              loading={loading}
              setLoading={setLoading}
            />
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded p-6 sticky top-24 lg:top-32">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>

              {/* Items */}
              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.cartId} className="flex space-x-3">
                    <div className="relative w-16 h-16 bg-white rounded-md overflow-hidden shrink-0">
                      <Image
                        src={item.image || "/images/placeholder.jpg"}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate">
                        {item.name}
                      </h3>
                      <p className="text-xs text-gray-500">
                        Qty: {item.quantity}
                      </p>
                      <p className="text-sm font-medium mt-1">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-3 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span>
                    {shippingCost === 0 ? "Free" : formatPrice(shippingCost)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax (15% VAT)</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-3 border-t border-gray-200">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              {/* Secure Checkout Notice */}
              <div className="mt-6 flex items-center justify-center space-x-2 text-sm text-gray-500">
                <Lock className="w-4 h-4" />
                <span>Secure checkout powered by Paystack</span>
              </div>

              {/* Continue Shopping */}
              <Link
                href="/shop"
                className="mt-6 inline-flex items-center text-sm text-gray-600 hover:text-black transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
