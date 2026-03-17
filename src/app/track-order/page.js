"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, CheckCircle, Truck, AlertTriangle, Info,
  AlertCircle, Check, Loader2,
} from "lucide-react";

import Breadcrumb from "@/components/ui/Breadcrumb";
import { subscribeToOrderByNumber } from "@/lib/firebase/firestore";

// ── Status configuration ────────────────────────────────────────────────────
// icon: element rendered inside the container
// container: Tailwind classes for the rounded container
// text: Tailwind text-color class for the status label
const STATUS_CONFIG = {
  pending_payment: {
    label: "Pending Payment",
    container: "bg-white ring-1 ring-amber-400/60 shadow-[0_0_0_2px_rgba(217,119,6,0.12)]",
    icon: <Info className="w-3.5 h-3.5 text-black" />,
    text: "text-amber-700",
  },
  payment_failed: {
    label: "Payment Failed",
    container: "bg-white ring-1 ring-red-400",
    icon: <AlertTriangle className="w-3.5 h-3.5 text-yellow-500 fill-yellow-300" />,
    text: "text-red-600",
  },
  paid: {
    label: "Paid",
    container: "bg-green-500 border border-black/20",
    icon: <Check className="w-3 h-3 text-white" />,
    text: "text-green-700",
  },
  confirmed: {
    label: "Confirmed",
    container: "bg-white ring-1 ring-blue-400/60",
    icon: <Check className="w-3.5 h-3.5 text-black/80" />,
    text: "text-blue-700",
  },
  shipped: {
    label: "Shipped",
    container: "bg-white ring-1 ring-indigo-400/60",
    icon: <Truck className="w-3.5 h-3.5 text-black/80" />,
    text: "text-indigo-700",
  },
  delivered: {
    label: "Delivered",
    container: "bg-green-500 border border-black/20",
    icon: <Check className="w-3 h-3 text-white" />,
    text: "text-green-700",
  },
  cancelled: {
    label: "Cancelled",
    container: "bg-white ring-1 ring-red-400",
    icon: <AlertTriangle className="w-3.5 h-3.5 text-yellow-500 fill-yellow-300" />,
    text: "text-red-600",
  },
};

const STATUS_STEPS = {
  pending_payment: 0, payment_failed: 0,
  paid: 1, confirmed: 2, shipped: 3, delivered: 4,
};

const STEPS = [
  "Order Placed", "Payment Confirmed", "Preparing", "Shipped", "Delivered",
];

const formatDate = (ts) => {
  if (!ts) return "";
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
};

const formatPrice = (n, currency = "ZAR") =>
  new Intl.NumberFormat("en-ZA", { style: "currency", currency }).format(n ?? 0);

// ── Icon container ───────────────────────────────────────────────────────────
function StatusIcon({ status, size = "md" }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.paid;
  const dim = size === "sm" ? "w-7 h-7" : "w-9 h-9";
  return (
    <div className={`${dim} rounded-full flex items-center justify-center shrink-0 ${cfg.container}`}>
      {cfg.icon}
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense>
      <TrackOrderInner />
    </Suspense>
  );
}

function TrackOrderInner() {
  const searchParams = useSearchParams();
  const prefillRef = searchParams.get("ref");

  const [reference, setReference] = useState(prefillRef || "");
  const [email, setEmail]         = useState("");
  const [result, setResult]       = useState(null);
  const [error, setError]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [searched, setSearched]   = useState(false);

  const unsubRef = useRef(null);

  // Cleanup subscription on unmount
  useEffect(() => () => { if (unsubRef.current) unsubRef.current(); }, []);

  const handleTrack = (e) => {
    e.preventDefault();
    if (!reference.trim() || !email.trim()) return;

    // Tear down previous subscription
    if (unsubRef.current) { unsubRef.current(); unsubRef.current = null; }

    setLoading(true);
    setError("");
    setResult(null);
    setSearched(true);

    unsubRef.current = subscribeToOrderByNumber(reference.trim(), email.trim(), ({ order, error: err }) => {
      if (err) {
        setError("Something went wrong. Please try again.");
        setResult(null);
      } else if (!order) {
        setError("No order found with that reference and email. Please check the details or contact us.");
        setResult(null);
      } else {
        setResult(order);
        setError("");
      }
      setLoading(false);
    });
  };

  const cfg = result ? (STATUS_CONFIG[result.status] || STATUS_CONFIG.paid) : null;
  const stepIndex = result ? (STATUS_STEPS[result.status] ?? 1) : 0;
  const isFailed = result?.status === "payment_failed" || result?.status === "cancelled";

  return (
    <main className="min-h-screen bg-white pb-20">
      <Breadcrumb />
      <div className="max-w-2xl mx-auto px-4 md:px-8 pt-12">

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-3">Order Status</p>
          <h1 className="text-3xl md:text-4xl font-bold text-black mb-3">Track Your Order</h1>
          <p className="text-gray-400 text-sm leading-relaxed">
            Enter your order reference and email address to check your shipment status.
          </p>
        </motion.div>

        {/* Search form */}
        <motion.form
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          onSubmit={handleTrack}
          className="border border-gray-100 rounded-lg p-6 mb-8 space-y-4"
        >
          <div>
            <label className="block text-xs font-bold tracking-widest uppercase text-gray-600 mb-2">
              Order Reference
            </label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="e.g. BX4821"
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black transition-colors placeholder:text-gray-300"
            />
            <p className="text-xs text-gray-400 mt-1.5">Found in your order confirmation email</p>
          </div>
          <div>
            <label className="block text-xs font-bold tracking-widest uppercase text-gray-600 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black transition-colors placeholder:text-gray-300"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-black text-white rounded-lg text-xs font-medium tracking-widest uppercase hover:bg-gray-900 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {loading ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Searching…</>
            ) : (
              <><Search className="w-3.5 h-3.5" /> Track Order</>
            )}
          </button>
        </motion.form>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-start gap-3 p-4 border border-gray-100 rounded-lg mb-8"
            >
              <AlertCircle className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
              <p className="text-sm text-gray-500">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result — animates in-place, live-updates via onSnapshot */}
        <AnimatePresence>
          {result && (
            <motion.div
              key={result.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="border border-gray-100 rounded-lg overflow-hidden"
            >
              {/* Status header */}
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Order Reference</p>
                  <p className="text-sm font-bold text-black font-mono">{result.orderNumber}</p>
                </div>
                {cfg && (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={result.status}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex items-center gap-2"
                    >
                      <StatusIcon status={result.status} size="sm" />
                      <span className={`text-xs font-semibold ${cfg.text}`}>{cfg.label}</span>
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>

              {/* Info grid */}
              <div className="px-6 py-4 border-b border-gray-100 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-gray-400 mb-0.5">Customer</p>
                  <p className="font-medium text-black">
                    {result.customer?.firstName} {result.customer?.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 mb-0.5">Order Placed</p>
                  <p className="font-medium text-black">{formatDate(result.createdAt)}</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-0.5">Items</p>
                  <p className="font-medium text-black">
                    {result.items?.map((i) => `${i.name} × ${i.quantity}`).join(", ")}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 mb-0.5">Total</p>
                  <p className="font-medium text-black">{formatPrice(result.total, result.currency)}</p>
                </div>
              </div>

              {/* Progress steps / failed message */}
              {!isFailed ? (
                <div className="px-6 py-5">
                  <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-5">
                    Shipment Progress
                  </p>
                  <div className="space-y-4">
                    {STEPS.map((step, i) => {
                      const done = i <= stepIndex;
                      return (
                        <div key={step} className="flex items-center gap-3">
                          <motion.div
                            animate={{ backgroundColor: done ? "#000" : "#f3f4f6" }}
                            transition={{ duration: 0.4 }}
                            className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                          >
                            {done && <Check className="w-3 h-3 text-white" />}
                          </motion.div>
                          <p className={`text-sm ${done ? "text-black font-medium" : "text-gray-400"}`}>
                            {step}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="px-6 py-5">
                  <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-yellow-500 fill-yellow-300 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-red-700">Payment not completed</p>
                      <p className="text-xs text-red-500 mt-0.5">
                        Sign in to your account to retry payment for this order.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-center text-xs text-gray-400 mt-10">
          Need help?{" "}
          <Link href="/contact" className="text-black font-medium underline hover:opacity-60 transition-opacity">
            Contact our team
          </Link>
        </p>
      </div>
    </main>
  );
}
