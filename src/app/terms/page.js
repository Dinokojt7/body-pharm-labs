"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const sections = [
  {
    title: "1. Research Use Only",
    body: `All products sold by Body Pharm Labz are intended strictly for laboratory and in-vitro research purposes. They are not approved for human or veterinary use, consumption, or any clinical application. By purchasing from us, you confirm that you are a qualified researcher and will use the products accordingly.`,
  },
  {
    title: "2. Eligibility",
    body: `You must be at least 18 years of age and legally permitted to purchase research chemicals in your jurisdiction. By placing an order, you represent that you meet these requirements. Body Pharm Labz reserves the right to refuse any order at its sole discretion.`,
  },
  {
    title: "3. Orders & Payment",
    body: `All prices are listed in USD unless otherwise stated. We accept Visa, Mastercard, American Express, and payments via Paystack. Orders are confirmed only upon successful payment. We reserve the right to cancel orders in the event of pricing errors or suspected fraudulent activity.`,
  },
  {
    title: "4. Shipping & Delivery",
    body: `We offer same-day worldwide shipping on orders placed before 14:00 GMT+2. Free shipping applies to orders of $250 or more. Delivery times vary by destination and are estimated only — Body Pharm Labz is not liable for delays caused by customs authorities or courier services beyond our control.`,
  },
  {
    title: "5. Returns & Refunds",
    body: `Due to the nature of research chemicals, we are unable to accept returns. However, if your order arrives damaged, contaminated, or materially different from the product described, please contact us within 48 hours of receipt with photographic evidence and we will arrange a replacement or refund.`,
  },
  {
    title: "6. Intellectual Property",
    body: `All content on this website — including text, images, product descriptions, and branding — is the exclusive property of Body Pharm Labz. Reproduction or commercial use without written permission is strictly prohibited.`,
  },
  {
    title: "7. Limitation of Liability",
    body: `Body Pharm Labz shall not be held liable for any direct, indirect, incidental, or consequential damages arising from the use or misuse of our products. All products are sold as-is for research purposes only.`,
  },
  {
    title: "8. Governing Law",
    body: `These terms are governed by the laws of the Republic of South Africa. Any disputes shall be resolved exclusively in the courts of Gauteng, South Africa.`,
  },
  {
    title: "9. Changes to These Terms",
    body: `We reserve the right to update these Terms & Conditions at any time. Continued use of our website following any changes constitutes your acceptance of the revised terms. Last updated: March 2026.`,
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white pt-32 pb-20">
      <div className="max-w-3xl mx-auto px-4 md:px-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-gray-400 mb-3">Legal</p>
          <h1 className="text-3xl md:text-4xl font-bold text-black mb-3">Terms & Conditions</h1>
          <p className="text-gray-400 text-sm mb-12">
            Please read these terms carefully before using our services or placing an order.
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
            Questions? Email us at{" "}
            <a href="mailto:sales@bodypharmlabs.com" className="text-black underline">
              sales@bodypharmlabs.com
            </a>
          </p>
          <Link
            href="/privacy-policy"
            className="text-xs font-medium tracking-widest uppercase text-black border-b border-black pb-0.5 hover:opacity-60 transition-opacity"
          >
            Privacy Policy →
          </Link>
        </div>
      </div>
    </main>
  );
}
