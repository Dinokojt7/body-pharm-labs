"use client";
import Breadcrumb from "@/components/ui/Breadcrumb";

import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

const eligible = [
  "Order arrived damaged or contaminated",
  "Product received differs materially from description",
  "Order never arrived after 21 business days",
  "Duplicate charge processed in error",
];

const ineligible = [
  "Change of mind after order is placed",
  "Incorrect order placed by the customer",
  "Products that have been opened or used",
  "Orders delayed by customs or courier",
];

const sections = [
  {
    title: "Timeframe",
    body: "All refund or replacement requests must be submitted within 48 hours of confirmed delivery. Requests submitted after this window will not be considered unless there is documented evidence of carrier delay.",
  },
  {
    title: "Process",
    body: "Email sales@bodypharmlabs.com with your order number, a description of the issue, and photographic evidence where applicable. Our team will respond within 1–2 business days with a resolution.",
  },
  {
    title: "Resolution",
    body: "Approved claims will be resolved via replacement shipment or full/partial refund to the original payment method, at our discretion. Refunds typically process within 5–10 business days depending on your bank.",
  },
];

export default function RefundPolicyPage() {
  return (
    <main className="min-h-screen bg-white pb-20">
      <Breadcrumb />
      <div className="max-w-3xl mx-auto px-4 md:px-8 pt-12">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-gray-400 mb-3">Legal</p>
          <h1 className="text-3xl md:text-4xl font-bold text-black mb-3">Refund & Return Policy</h1>
          <p className="text-gray-400 text-sm mb-12">
            Due to the nature of research chemicals, all sales are final under most circumstances.
            However, we stand behind our products.
          </p>
        </motion.div>

        {/* Eligible / Ineligible grid */}
        <div className="grid md:grid-cols-2 gap-5 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="border border-gray-100 rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-5">
              <CheckCircle className="w-4 h-4 text-black" />
              <h2 className="text-xs font-bold tracking-[0.15em] uppercase text-black">Eligible for Refund</h2>
            </div>
            <ul className="space-y-3">
              {eligible.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-black mt-1.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="border border-gray-100 rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-5">
              <XCircle className="w-4 h-4 text-gray-400" />
              <h2 className="text-xs font-bold tracking-[0.15em] uppercase text-gray-400">Not Eligible</h2>
            </div>
            <ul className="space-y-3">
              {ineligible.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-gray-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-1.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Process sections */}
        <div className="space-y-6 mb-12">
          {sections.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              className="pb-6 border-b border-gray-100 last:border-0"
            >
              <h2 className="text-sm font-bold text-black mb-2 tracking-wide">{s.title}</h2>
              <p className="text-gray-500 text-sm leading-relaxed">{s.body}</p>
            </motion.div>
          ))}
        </div>

        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
          <p className="text-xs text-gray-500 leading-relaxed">
            To initiate a claim, email{" "}
            <a href="mailto:sales@bodypharmlabs.com" className="text-black font-medium underline">
              sales@bodypharmlabs.com
            </a>{" "}
            with your order number and supporting evidence within 48 hours of delivery.
          </p>
        </div>
      </div>
    </main>
  );
}
