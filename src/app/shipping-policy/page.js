"use client";
import Breadcrumb from "@/components/ui/Breadcrumb";

import { motion } from "framer-motion";
import { Truck, Clock, Globe, Package } from "lucide-react";

const highlights = [
  { icon: Truck, label: "Free Shipping", value: "On orders $250+" },
  {
    icon: Clock,
    label: "Same-Day Dispatch",
    value: "Orders before 14:00 GMT+2",
  },
  { icon: Globe, label: "Worldwide", value: "40+ countries served" },
  { icon: Package, label: "Discreet Packaging", value: "Always" },
];

const regions = [
  {
    region: "South Africa",
    time: "1–3 business days",
    notes: "Standard & express available",
  },
  {
    region: "Southern Africa (SADC)",
    time: "3–7 business days",
    notes: "Courier dependent",
  },
  {
    region: "Europe",
    time: "5–10 business days",
    notes: "Subject to customs clearance",
  },
  {
    region: "United States & Canada",
    time: "7–14 business days",
    notes: "Subject to customs clearance",
  },
  {
    region: "Australia & Asia",
    time: "7–14 business days",
    notes: "Subject to customs clearance",
  },
  {
    region: "Middle East",
    time: "5–10 business days",
    notes: "Courier dependent",
  },
  {
    region: "Rest of World",
    time: "10–21 business days",
    notes: "Contact us for specifics",
  },
];

const sections = [
  {
    title: "Order Processing",
    body: "Orders placed before 14:00 GMT+2 Monday–Friday are dispatched the same day. Orders placed after the cutoff or on weekends are processed the next business day. You will receive a tracking number via email once your order has shipped.",
  },
  {
    title: "Customs & Import Duties",
    body: "International orders may be subject to customs duties, taxes, or import fees levied by the destination country. These charges are the responsibility of the recipient. Body Pharm Labs has no control over customs processes and cannot predict applicable fees.",
  },
  {
    title: "Packaging",
    body: "All orders are shipped in discreet, unmarked packaging. Cold-chain sensitive compounds are packed with appropriate temperature control materials. Product integrity during transit is our priority.",
  },
  {
    title: "Lost or Delayed Shipments",
    body: "If your order has not arrived within the estimated delivery window, please contact us at sales@bodypharmlabs.com. We will investigate with the courier and provide updates. Claims for lost packages must be submitted within 21 business days of the shipping date.",
  },
];

export default function ShippingPolicyPage() {
  return (
    <main className="min-h-screen bg-white pb-20">
      <Breadcrumb />
      <div className="max-w-3xl mx-auto px-4 md:px-8 pt-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-gray-400 mb-3">
            Legal
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-black mb-3">
            Shipping Policy
          </h1>
          <p className="text-gray-400 text-sm mb-12">
            We ship research compounds worldwide with speed and discretion.
          </p>
        </motion.div>

        {/* Highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-gray-100 border border-gray-100 rounded-lg overflow-hidden mb-12">
          {highlights.map((h) => (
            <div key={h.label} className="bg-white px-5 py-6 text-center">
              <h.icon className="w-5 h-5 text-black mx-auto mb-2" />
              <p className="text-xs font-bold text-black tracking-wide">
                {h.label}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{h.value}</p>
            </div>
          ))}
        </div>

        {/* Delivery times table */}
        <h2 className="text-xs font-bold tracking-[0.15em] uppercase text-black mb-4">
          Estimated Delivery Times
        </h2>
        <div className="border border-gray-100 rounded-lg overflow-hidden mb-12">
          {regions.map((r, i) => (
            <div
              key={r.region}
              className={`flex flex-col sm:flex-row sm:items-center justify-between px-5 py-4 gap-1 ${
                i !== regions.length - 1 ? "border-b border-gray-100" : ""
              }`}
            >
              <span className="text-sm font-medium text-black">{r.region}</span>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">{r.time}</span>
                <span className="text-xs text-gray-400">{r.notes}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Policy sections */}
        <div className="space-y-6">
          {sections.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="pb-6 border-b border-gray-100 last:border-0"
            >
              <h2 className="text-sm font-bold text-black mb-2 tracking-wide">
                {s.title}
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed">{s.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}
