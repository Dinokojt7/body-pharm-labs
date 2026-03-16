"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Package, CheckCircle, Truck, Clock, AlertCircle, XCircle } from "lucide-react";

import Breadcrumb from "@/components/ui/Breadcrumb";
import { getOrderByNumber } from "@/lib/firebase/firestore";

const STATUS_STEPS = {
  pending_payment: 0,
  payment_failed: 0,
  paid: 1,
  confirmed: 2,
  shipped: 3,
  delivered: 4,
};

const STEPS = [
  { label: "Order Placed" },
  { label: "Payment Confirmed" },
  { label: "Preparing" },
  { label: "Shipped" },
  { label: "Delivered" },
];

const STATUS_BADGE = {
  pending_payment: { label: "Pending Payment", icon: Clock,       cls: "bg-amber-50 text-amber-700 border-amber-200" },
  payment_failed:  { label: "Payment Failed",  icon: XCircle,     cls: "bg-red-50 text-red-600 border-red-200"       },
  paid:            { label: "Paid",            icon: CheckCircle, cls: "bg-blue-50 text-blue-700 border-blue-200"    },
  confirmed:       { label: "Confirmed",       icon: CheckCircle, cls: "bg-blue-50 text-blue-700 border-blue-200"    },
  shipped:         { label: "Shipped",         icon: Truck,       cls: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  delivered:       { label: "Delivered",       icon: CheckCircle, cls: "bg-green-50 text-green-700 border-green-200" },
};

const formatDate = (ts) => {
  if (!ts) return "";
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
};

const formatPrice = (n, currency = "ZAR") =>
  new Intl.NumberFormat("en-ZA", { style: "currency", currency }).format(n ?? 0);

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

  // Auto-search if ref came from success page / account page and we have a prefilled ref
  // (user still needs to supply email for security)

  const handleTrack = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    const { order, error: fetchError } = await getOrderByNumber(reference.trim(), email.trim());

    if (fetchError) {
      setError("Something went wrong. Please try again.");
    } else if (!order) {
      setError(
        "No order found with that reference and email. Please check the details and try again, or contact us at sales@bodypharmlabs.com.",
      );
    } else {
      setResult(order);
    }

    setLoading(false);
  };

  const badge = result ? (STATUS_BADGE[result.status] || STATUS_BADGE.paid) : null;
  const stepIndex = result ? (STATUS_STEPS[result.status] ?? 1) : 0;
  const isFailed = result?.status === "payment_failed";

  return (
    <main className="min-h-screen bg-white pb-20">
      <Breadcrumb />
      <div className="max-w-2xl mx-auto px-4 md:px-8 pt-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-3">
            Order Status
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-black mb-3">
            Track Your Order
          </h1>
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
          className="border border-gray-100 rounded-2xl p-6 mb-8 space-y-4"
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
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black transition-colors placeholder:text-gray-300"
            />
            <p className="text-xs text-gray-400 mt-1.5">
              Found in your order confirmation email
            </p>
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
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black transition-colors placeholder:text-gray-300"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-black text-white rounded-xl text-xs font-medium tracking-widest uppercase hover:bg-gray-900 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {loading ? (
              "Searching…"
            ) : (
              <>
                <Search className="w-3.5 h-3.5" /> Track Order
              </>
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
              className="flex items-start gap-3 p-4 border border-gray-100 rounded-2xl mb-8"
            >
              <AlertCircle className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
              <p className="text-sm text-gray-500">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="border border-gray-100 rounded-2xl overflow-hidden"
            >
              {/* Status header */}
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Order Reference</p>
                  <p className="text-sm font-bold text-black font-mono">{result.orderNumber}</p>
                </div>
                {badge && (
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold ${badge.cls}`}>
                    <badge.icon className="w-3.5 h-3.5" />
                    {badge.label}
                  </div>
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
                  <p className="font-medium text-black">
                    {formatPrice(result.total, result.currency)}
                  </p>
                </div>
              </div>

              {/* Progress steps (only for non-failed orders) */}
              {!isFailed ? (
                <div className="px-6 py-5">
                  <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-5">
                    Shipment Progress
                  </p>
                  <div className="space-y-4">
                    {STEPS.map((step, i) => {
                      const done = i <= stepIndex;
                      return (
                        <div key={step.label} className="flex items-start gap-3">
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                              done ? "bg-black" : "bg-gray-100"
                            }`}
                          >
                            {done && <CheckCircle className="w-3 h-3 text-white" />}
                          </div>
                          <p className={`text-sm ${done ? "text-black font-medium" : "text-gray-400"}`}>
                            {step.label}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="px-6 py-5">
                  <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl">
                    <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
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
          <Link
            href="/contact"
            className="text-black font-medium underline hover:opacity-60 transition-opacity"
          >
            Contact our team
          </Link>
        </p>
      </div>
    </main>
  );
}
