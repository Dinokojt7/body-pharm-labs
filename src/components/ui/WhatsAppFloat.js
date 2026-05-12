"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/lib/stores/cart-store";

const PHONE = "27624623288";
const WA_URL = `https://wa.me/${PHONE}?text=${encodeURIComponent("Hi, I'd like to enquire about your products.")}`;
const SESSION_KEY = "wa_banner_dismissed";

export default function WhatsAppFloat() {
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();
  const cartOpen = useCartStore((s) => s.isOpen);

  // Hide banner on any navigation without dismissing to sessionStorage,
  // so it can re-trigger if the user scrolls past About on the new page
  useEffect(() => {
    setVisible(false);
  }, [pathname]);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return;

    const aboutEl = document.getElementById("about-section");

    if (aboutEl) {
      // Homepage: show once About section has fully scrolled out of view upward
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting && entry.boundingClientRect.top < 0) {
            setVisible(true);
            observer.disconnect();
          }
        },
        { threshold: 0 }
      );
      observer.observe(aboutEl);
      return () => observer.disconnect();
    } else {
      // Other pages: show after 500px scroll
      const onScroll = () => {
        if (window.scrollY > 500) {
          setVisible(true);
          window.removeEventListener("scroll", onScroll);
        }
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => window.removeEventListener("scroll", onScroll);
    }
  }, []);

  function dismiss() {
    sessionStorage.setItem(SESSION_KEY, "1");
    setVisible(false);
  }

  return (
    <AnimatePresence>
      {visible && !cartOpen && (
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ type: "spring", stiffness: 340, damping: 32 }}
          className="fixed bottom-16 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-2xl"
        >
          <div className="relative bg-white border border-gray-200 rounded-lg shadow-lg px-5 py-3 flex items-center gap-3">
            {/* Dismiss — top-right corner */}
            <button
              onClick={dismiss}
              className="absolute -top-2.5 -right-2.5 w-5 h-5 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 hover:text-black hover:bg-gray-200 transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-3 h-3" />
            </button>

            {/* WhatsApp icon */}
            <WhatsAppIcon className="w-5 h-5 text-[#25D366] shrink-0" />

            {/* Text */}
            <p className="flex-1 text-xs text-gray-500 leading-snug">
              For enquiries and direct orders, send us a WhatsApp on{" "}
              <span className="font-semibold text-gray-700">+27 62 462 3288</span>
            </p>

            {/* CTA */}
            <a
              href={WA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 h-7 px-4 rounded-full border border-gray-300 text-xs font-medium text-gray-700 hover:border-gray-500 hover:text-black transition-colors flex items-center whitespace-nowrap"
            >
              WhatsApp Us
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function WhatsAppIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
