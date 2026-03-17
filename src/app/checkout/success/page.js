"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle, Package, ArrowRight, Loader2 } from "lucide-react";

import { useAuthStore } from "@/lib/stores/auth-store";
import { getUserOrders } from "@/lib/firebase/firestore";

const formatPrice = (n, currency = "ZAR") =>
  new Intl.NumberFormat("en-ZA", { style: "currency", currency }).format(n ?? 0);

const formatDate = (ts) => {
  if (!ts) return "";
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
};

export default function SuccessPage() {
  return (
    <Suspense>
      <SuccessPageInner />
    </Suspense>
  );
}

function SuccessPageInner() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order");
  const { user } = useAuthStore();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderNumber || !user?.uid) {
      setLoading(false);
      return;
    }
    // Find the order from user's orders list by orderNumber
    getUserOrders(user.uid).then(({ orders }) => {
      const found = orders?.find((o) => o.orderNumber === orderNumber);
      setOrder(found || null);
      setLoading(false);
    });
  }, [orderNumber, user?.uid]);

  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        {/* Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mb-10">
          <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-3">
            Order Confirmed
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-black mb-3">
            Thank you!
          </h1>
          {orderNumber && (
            <p className="text-gray-500 text-sm">
              Your order reference is{" "}
              <span className="font-bold text-black font-mono">{orderNumber}</span>
            </p>
          )}
          <p className="text-xs text-gray-400 mt-2">
            A confirmation has been sent to your email address.
          </p>
        </div>

        {/* Order details */}
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-gray-300" />
          </div>
        ) : order ? (
          <div className="border border-gray-100 rounded-lg overflow-hidden mb-8">
            {order.status === "pending_payment" && (
              <div className="px-6 py-4 bg-amber-50 border-b border-amber-100">
                <p className="text-xs text-amber-700 font-medium">Payment is being confirmed — this will update automatically.</p>
              </div>
            )}
            {/* Items */}
            <div className="px-6 py-5 border-b border-gray-100">
              <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-4">
                Items Ordered
              </p>
              <div className="space-y-3">
                {order.items?.map((item, i) => (
                  <div key={i} className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-black truncate">{item.name}</p>
                      {item.size && (
                        <p className="text-xs text-gray-400">{item.size}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-gray-400">× {item.quantity}</p>
                      <p className="text-sm font-medium text-black">
                        {formatPrice(item.price * item.quantity, order.currency)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="px-6 py-5 border-b border-gray-100 space-y-2">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal, order.currency)}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Tax (15% VAT)</span>
                <span>{formatPrice(order.tax, order.currency)}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Shipping</span>
                <span>{order.shipping === 0 ? "Free" : formatPrice(order.shipping, order.currency)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-black pt-2 border-t border-gray-100">
                <span>Total</span>
                <span>{formatPrice(order.total, order.currency)}</span>
              </div>
            </div>

            {/* Shipping address */}
            <div className="px-6 py-5 grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-gray-400 mb-1">Ship to</p>
                <p className="text-black font-medium">
                  {order.customer?.firstName} {order.customer?.lastName}
                </p>
                <p className="text-gray-500">{order.shippingAddress?.address}</p>
                <p className="text-gray-500">
                  {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}
                </p>
                <p className="text-gray-500">{order.shippingAddress?.country}</p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">Order placed</p>
                <p className="text-black font-medium">{formatDate(order.createdAt)}</p>
              </div>
            </div>
          </div>
        ) : null}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          {orderNumber && (
            <Link
              href={`/track-order?ref=${orderNumber}`}
              className="flex-1 flex items-center justify-center gap-2 h-12 rounded border border-gray-200 text-sm font-medium text-black hover:bg-gray-50 transition-colors"
            >
              <Package className="w-4 h-4" />
              Track Order
            </Link>
          )}
          <Link
            href="/shop"
            className="flex-1 flex items-center justify-center gap-2 h-12 rounded bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Continue Shopping
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
