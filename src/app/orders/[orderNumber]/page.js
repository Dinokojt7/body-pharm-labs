"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check, Truck, Info, AlertTriangle, Package,
  ArrowLeft, MapPin, Mail, Loader2, AlertCircle,
} from "lucide-react";

import Breadcrumb from "@/components/ui/Breadcrumb";
import { useAuthStore } from "@/lib/stores/auth-store";
import { subscribeToUserOrders } from "@/lib/firebase/firestore";
import productsData from "@/lib/data/products.json";

const productImageMap = Object.fromEntries(productsData.map((p) => [p.id, p.imageString || null]));

const STATUS_CONFIG = {
  pending_payment: { label: "Pending Payment", iconEl: <Info className="w-3.5 h-3.5 text-black" />,           container: "bg-amber-500/10 ring-1 ring-amber-400/50",   text: "text-amber-700"  },
  payment_failed:  { label: "Payment Failed",  iconEl: <AlertTriangle className="w-3.5 h-3.5 text-black" />,  container: "bg-yellow-500/20 ring-1 ring-yellow-400/60", text: "text-red-600"    },
  paid:            { label: "Paid",            iconEl: <Check className="w-3 h-3 text-black" />,              container: "bg-green-500/20 ring-1 ring-green-500/40",   text: "text-green-700" },
  confirmed:       { label: "Confirmed",       iconEl: <Check className="w-3.5 h-3.5 text-black/80" />,       container: "bg-blue-500/10 ring-1 ring-blue-400/50",     text: "text-blue-700"  },
  shipped:         { label: "Shipped",         iconEl: <Truck className="w-3.5 h-3.5 text-black/80" />,       container: "bg-indigo-500/10 ring-1 ring-indigo-400/50", text: "text-indigo-700"},
  delivered:       { label: "Delivered",       iconEl: <Check className="w-3 h-3 text-black" />,              container: "bg-green-500/20 ring-1 ring-green-500/40",   text: "text-green-700" },
  cancelled:       { label: "Cancelled",       iconEl: <AlertTriangle className="w-3.5 h-3.5 text-black" />,  container: "bg-yellow-500/20 ring-1 ring-yellow-400/60", text: "text-red-600"    },
};

const STEP_INDEX = {
  paid: 1, confirmed: 2, shipped: 3, delivered: 4,
};

const STEPS = ["Order Placed", "Payment Confirmed", "Preparing", "Shipped", "Delivered"];

const formatDate = (ts) => {
  if (!ts) return "—";
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
};

const fmt = (n, currency = "ZAR") =>
  new Intl.NumberFormat("en-ZA", { style: "currency", currency }).format(n ?? 0);

export default function OrderDetailPage() {
  const { orderNumber } = useParams();
  const router = useRouter();
  const { user, isAuthenticated, authLoading } = useAuthStore();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push("/");
  }, [isAuthenticated, authLoading, router]);

  // Realtime subscription — order detail live-updates when store owner changes anything
  useEffect(() => {
    if (!user?.uid || !orderNumber) return;
    const unsubscribe = subscribeToUserOrders(user.uid, ({ orders, error: err }) => {
      if (err) {
        setFetchError("Could not load order. Please refresh.");
        setLoading(false);
        return;
      }
      const found = orders.find((o) => o.orderNumber === orderNumber) || null;
      if (found) {
        // Enrich items with images from Firestore first, fallback to local catalogue
        found.items = (found.items || []).map((item) => ({
          ...item,
          image: item.image || productImageMap[item.productId] || null,
        }));
      }
      setOrder(found);
      setFetchError("");
      setLoading(false);
    });
    return unsubscribe;
  }, [user?.uid, orderNumber]);

  if (authLoading || !isAuthenticated) return null;

  const status = order ? (STATUS_CONFIG[order.status] || STATUS_CONFIG.paid) : null;
  const stepIndex = order ? (STEP_INDEX[order.status] ?? -1) : -1;
  const showProgress = order && !["payment_failed", "pending_payment", "cancelled"].includes(order.status);

  return (
    <main className="min-h-screen bg-white">
      <Breadcrumb />

      <div className="max-w-3xl mx-auto px-4 md:px-8 pt-12 pb-24">
        <Link
          href="/account"
          className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-black transition-colors mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to account
        </Link>

        {/* Fetch error */}
        {fetchError && (
          <div className="mb-6 flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            {fetchError}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="w-5 h-5 animate-spin text-gray-300" />
          </div>
        ) : !order ? (
          <div className="text-center py-24">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Package className="w-5 h-5 text-gray-300" />
            </div>
            <p className="text-sm font-semibold text-black mb-1">Order not found</p>
            <p className="text-xs text-gray-400">We couldn&apos;t find order {orderNumber} on your account.</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-1">Order Reference</p>
                <h1 className="text-2xl md:text-3xl font-bold text-black font-mono">{order.orderNumber}</h1>
                <p className="text-xs text-gray-400 mt-1">Placed {formatDate(order.createdAt)}</p>
              </div>
              {status && (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={order.status}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex items-center gap-2"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${status.container}`}>
                      {status.iconEl}
                    </div>
                    <span className={`text-sm font-semibold ${status.text}`}>{status.label}</span>
                  </motion.div>
                </AnimatePresence>
              )}
            </div>

            {/* Progress */}
            {showProgress && (
              <div className="border border-gray-100 rounded-lg p-6">
                <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-6">Shipment Progress</p>
                <div className="space-y-4">
                  {STEPS.map((step, i) => {
                    const done = i <= stepIndex;
                    const active = i === stepIndex;
                    return (
                      <div key={step} className="flex items-center gap-3">
                        <motion.div
                          animate={{ backgroundColor: done ? "#000" : "#f3f4f6" }}
                          transition={{ duration: 0.4 }}
                          className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                        >
                          {done && <Check className="w-3.5 h-3.5 text-white" />}
                        </motion.div>
                        <p className={`text-sm ${done ? active ? "text-black font-semibold" : "text-black font-medium" : "text-gray-400"}`}>
                          {step}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Items */}
            <div className="border border-gray-100 rounded-lg overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <p className="text-xs font-bold tracking-widest uppercase text-gray-400">Items Ordered</p>
              </div>
              <div className="divide-y divide-gray-50">
                {order.items?.map((item, i) => (
                  <div key={i} className="px-5 py-4 flex items-center gap-4">
                    {/* Product image */}
                    {item.image ? (
                      <div className="relative w-14 h-14 shrink-0 bg-gray-50 rounded-lg overflow-hidden">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-contain p-1"
                          sizes="56px"
                        />
                      </div>
                    ) : (
                      <div className="w-14 h-14 shrink-0 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-gray-300" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-black">{item.name}</p>
                      {item.size && <p className="text-xs text-gray-400 mt-0.5">{item.size}</p>}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-gray-400">× {item.quantity}</p>
                      <p className="text-sm font-semibold text-black">
                        {fmt(item.price * item.quantity, order.currency)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="px-5 py-4 border-t border-gray-100 space-y-2 bg-gray-50/50">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Subtotal</span><span>{fmt(order.subtotal, order.currency)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Tax (15% VAT)</span><span>{fmt(order.tax, order.currency)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Shipping</span>
                  <span>{order.shipping === 0 ? "Free" : fmt(order.shipping, order.currency)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-black pt-2 border-t border-gray-100">
                  <span>Total</span><span>{fmt(order.total, order.currency)}</span>
                </div>
              </div>
            </div>

            {/* Shipping + Contact */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="border border-gray-100 rounded-lg p-5">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  <p className="text-xs font-bold tracking-widest uppercase text-gray-400">Ship To</p>
                </div>
                <p className="text-sm font-medium text-black">
                  {order.customer?.firstName} {order.customer?.lastName}
                </p>
                <p className="text-xs text-gray-500 mt-1">{order.shippingAddress?.address}</p>
                <p className="text-xs text-gray-500">
                  {order.shippingAddress?.city}{order.shippingAddress?.postalCode ? `, ${order.shippingAddress.postalCode}` : ""}
                </p>
                <p className="text-xs text-gray-500">{order.shippingAddress?.country}</p>
              </div>

              <div className="border border-gray-100 rounded-lg p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  <p className="text-xs font-bold tracking-widest uppercase text-gray-400">Contact</p>
                </div>
                <p className="text-sm text-black break-all">{order.customer?.email}</p>
                {order.customer?.phone && (
                  <p className="text-xs text-gray-500 mt-1">{order.customer.phone}</p>
                )}
                {order.paystackReference && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-[10px] text-gray-400 mb-0.5">Payment Reference</p>
                    <p className="text-xs font-mono text-gray-600 break-all">{order.paystackReference}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            {order.notes && (
              <div className="border border-gray-100 rounded-lg p-5">
                <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-2">Order Notes</p>
                <p className="text-sm text-gray-600">{order.notes}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Link
                href={`/track-order?ref=${order.orderNumber}`}
                className="flex-1 h-11 rounded border border-gray-200 text-xs font-semibold tracking-widest uppercase text-black hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <Package className="w-3.5 h-3.5" />
                Track Shipment
              </Link>
              <Link
                href="/shop"
                className="flex-1 h-11 rounded bg-black text-white text-xs font-semibold tracking-widest uppercase hover:bg-gray-800 transition-colors flex items-center justify-center"
              >
                Shop Again
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}
