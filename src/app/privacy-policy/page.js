"use client";
import Breadcrumb from "@/components/ui/Breadcrumb";

import Link from "next/link";
import { motion } from "framer-motion";

const sections = [
  {
    title: "1. Information We Collect",
    body: `When you place an order or create an account, we collect your name, email address, phone number, shipping address, and payment information. We also collect usage data such as pages visited, browser type, and device information to improve our services.`,
  },
  {
    title: "2. How We Use Your Information",
    body: `We use your information to process orders, communicate order status, provide customer support, and improve our website. We do not sell, rent, or trade your personal data to third parties. Your information may be shared with trusted service providers (payment processors, shipping partners) solely to fulfil your order.`,
  },
  {
    title: "3. Payment Security",
    body: `All payment processing is handled by Paystack, a PCI-DSS compliant payment gateway. Body Pharm Labz does not store your credit card details. All transactions are encrypted using SSL technology.`,
  },
  {
    title: "4. Cookies",
    body: `We use cookies and similar technologies to maintain session state, remember your preferences, and analyse website traffic. You may disable cookies in your browser settings, though this may affect certain site functionality.`,
  },
  {
    title: "5. Data Retention",
    body: `We retain your personal data for as long as necessary to fulfil the purposes outlined in this policy, comply with legal obligations, and resolve disputes. Order records are retained for a minimum of 5 years in accordance with South African financial regulations.`,
  },
  {
    title: "6. Your Rights",
    body: `Under the Protection of Personal Information Act (POPIA), you have the right to access, correct, or delete your personal data. To exercise these rights, contact us at sales@bodypharmlabs.com. We will respond within 30 days.`,
  },
  {
    title: "7. Third-Party Links",
    body: `Our website may contain links to third-party websites. We are not responsible for the privacy practices of these sites and encourage you to review their policies before submitting personal information.`,
  },
  {
    title: "8. Changes to This Policy",
    body: `We may update this Privacy Policy periodically. Significant changes will be communicated via email or a prominent notice on our website. Continued use of our services after changes constitutes your acceptance. Last updated: March 2026.`,
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-white pb-20">
      <Breadcrumb />
      <div className="max-w-3xl mx-auto px-4 md:px-8 pt-12">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-gray-400 mb-3">Legal</p>
          <h1 className="text-3xl md:text-4xl font-bold text-black mb-3">Privacy Policy</h1>
          <p className="text-gray-400 text-sm mb-12">
            Your privacy matters. Here's how we collect, use, and protect your information.
          </p>
        </motion.div>

        <div className="space-y-8">
          {sections.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className="pb-8 border-b border-gray-100 last:border-0"
            >
              <h2 className="text-sm font-bold text-black mb-3 tracking-wide">{s.title}</h2>
              <p className="text-gray-500 text-sm leading-relaxed">{s.body}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-xs text-gray-400">
            Questions? Email{" "}
            <a href="mailto:sales@bodypharmlabs.com" className="text-black underline">
              sales@bodypharmlabs.com
            </a>
          </p>
          <Link
            href="/terms"
            className="text-xs font-medium tracking-widest uppercase text-black border-b border-black pb-0.5 hover:opacity-60 transition-opacity"
          >
            Terms & Conditions →
          </Link>
        </div>
      </div>
    </main>
  );
}
