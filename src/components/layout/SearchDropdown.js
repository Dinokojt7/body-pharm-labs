"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import products from "@/lib/data/products.json";

const QUICK_LINKS = [
  { label: "Shop All Products", href: "/shop" },
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Shipping Policy", href: "/shipping-policy" },
];

export default function SearchDropdown({ query, top, onClose }) {
  const trimmed = query.trim();

  const results = trimmed.length > 0
    ? products.filter((p) => {
        const q = trimmed.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.subtitle?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.type?.toLowerCase().includes(q)
        );
      }).slice(0, 6)
    : [];

  const noResults = trimmed.length > 0 && results.length === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.15 }}
      className="fixed left-0 right-0 bg-white border-b border-gray-100 shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
      style={{ top: `${top}px`, zIndex: 39 }}
    >
      <div className="px-4 md:px-8 lg:px-12 py-4 max-w-screen-xl mx-auto">
        {noResults && (
          <p className="text-sm text-gray-500 py-2 text-center">
            No products found for &quot;{trimmed}&quot;
          </p>
        )}

        {results.length > 0 && (
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-2">
              Products
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
              {results.map((p) => (
                <Link
                  key={p.id}
                  href={`/shop/${p.slug}`}
                  onClick={onClose}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="relative w-10 h-10 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden">
                    <Image
                      src={p.imageString}
                      alt={p.name}
                      fill
                      className="object-contain p-1"
                      sizes="40px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                    <p className="text-xs text-gray-400 truncate">
                      {p.subtitle} · {p.category}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                </Link>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <Link
                href={`/shop?q=${encodeURIComponent(trimmed)}`}
                onClick={onClose}
                className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
              >
                See all results for &quot;{trimmed}&quot; →
              </Link>
            </div>
          </div>
        )}

        {!trimmed && (
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-2">
              Quick Links
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
              {QUICK_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm text-gray-700">{link.label}</span>
                  <ArrowRight className="w-4 h-4 text-gray-300 ml-2 flex-shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
