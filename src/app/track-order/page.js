"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Package, CheckCircle, Truck, AlertCircle } from "lucide-react";

const mockStatuses = {
  "ORD-DEMO-001": {
    status: "delivered",
    product: "RE:COVER 5mg × 2",
    placed: "2026-03-10",
    updated: "2026-03-13",
    courier: "DHL Express",
    tracking: "DHL123456789",
    steps: [
      { label: "Order Placed", done: true, date: "Mar 10, 2026" },
      { label: "Payment Confirmed", done: true, date: "Mar 10, 2026" },
      { label: "Dispatched", done: true, date: "Mar 10, 2026" },
      { label: "In Transit", done: true, date: "Mar 12, 2026" },
      { label: "Delivered", done: true, date: "Mar 13, 2026" },
    ],
  },
};

export default function TrackOrderPage() {
  const [reference, setReference] = useState("");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTrack = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    await new Promise((r) => setTimeout(r, 800));

    const found = mockStatuses[reference.toUpperCase().trim()];
    if (found) {
      setResult(found);
    } else {
      setError(
        "No order found with that reference. Please check the number and try again, or contact us at sales@bodypharmlabs.com."
      );
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-white pt-32 pb-20">
      <div className="max-w-2xl mx-auto px-4 md:px-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-gray-400 mb-3">Order Status</p>
          <h1 className="text-3xl md:text-4xl font-bold text-black mb-3">Track Your Order</h1>
          <p className="text-gray-400 text-sm leading-relaxed">
            Enter your order reference number and email to check the status of your shipment.
          </p>
        </motion.div>

        {/* Search form */}
        <motion.form
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
          onSubmit={handleTrack}
          className="border border-gray-100 rounded-2xl p-6 mb-8 space-y-4"
        >
          <div>
            <label className="block text-xs font-bold tracking-[0.12em] uppercase text-gray-600 mb-2">
              Order Reference
            </label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="e.g. ORD-ABC123-1710000000000"
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black transition-colors placeholder:text-gray-300"
            />
            <p className="text-xs text-gray-400 mt-1.5">
              Found in your order confirmation email
            </p>
          </div>
          <div>
            <label className="block text-xs font-bold tracking-[0.12em] uppercase text-gray-600 mb-2">
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
            {loading ? "Searching…" : <><Search className="w-3.5 h-3.5" /> Track Order</>}
          </button>
        </motion.form>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
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
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="border border-gray-100 rounded-2xl overflow-hidden"
            >
              {/* Status header */}
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Order Reference</p>
                  <p className="text-sm font-bold text-black">{reference.toUpperCase().trim()}</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-black text-white rounded-full">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium capitalize">{result.status}</span>
                </div>
              </div>

              {/* Info */}
              <div className="px-6 py-4 border-b border-gray-100 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Products</p>
                  <p className="font-medium text-black text-xs">{result.product}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Courier</p>
                  <p className="font-medium text-black text-xs">{result.courier}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Order Placed</p>
                  <p className="font-medium text-black text-xs">{result.placed}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Last Update</p>
                  <p className="font-medium text-black text-xs">{result.updated}</p>
                </div>
              </div>

              {/* Progress steps */}
              <div className="px-6 py-5">
                <p className="text-xs font-bold tracking-[0.12em] uppercase text-gray-400 mb-5">Shipment Progress</p>
                <div className="space-y-4">
                  {result.steps.map((step, i) => (
                    <div key={step.label} className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        step.done ? "bg-black" : "bg-gray-100"
                      }`}>
                        {step.done && <CheckCircle className="w-3 h-3 text-white" />}
                      </div>
                      <div className="flex-1 flex items-center justify-between">
                        <p className={`text-sm ${step.done ? "text-black font-medium" : "text-gray-400"}`}>
                          {step.label}
                        </p>
                        {step.date && <p className="text-xs text-gray-400">{step.date}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
