"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

import { useUIStore } from "@/lib/stores/ui-store";
import { useAuthStore } from "@/lib/stores/auth-store";
import { usePreventScroll } from "@/lib/hooks/usePreventScroll";
import siteData from "@/lib/data/site-data.json";

const MobileMenu = () => {
  const { isMobileMenuOpen, toggleMobileMenu } = useUIStore();
  const { isAuthenticated, getDisplayName } = useAuthStore();
  const menuRef = useRef(null);

  usePreventScroll(isMobileMenuOpen);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isMobileMenuOpen) toggleMobileMenu();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isMobileMenuOpen, toggleMobileMenu]);

  // Greeting text: first word of display name, truncated
  const rawName = isAuthenticated ? getDisplayName()?.split(" ")[0] : null;
  const greeting = rawName ? `Hi, ${rawName}` : "Welcome";
  // If name is long, truncate with CSS rather than JS
  const greetingLong = rawName && rawName.length > 10;

  const menuItems = [
    { label: "Home",         href: "/"            },
    { label: "About Us",     href: "/about"       },
    { label: "Shop",         href: "/shop"        },
    { label: "Testimonials", href: "/testimonials"},
    { label: "Contact Us",   href: "/contact"     },
  ];

  return (
    <AnimatePresence>
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50"
            onClick={toggleMobileMenu}
          />

          {/* Drawer */}
          <motion.div
            ref={menuRef}
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed left-0 top-0 h-full w-4/5 max-w-xs bg-black z-50 flex flex-col"
          >
            {/* Header — greeting + X */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
              <p
                className={`font-semibold text-white leading-tight ${
                  greetingLong ? "text-xl" : "text-2xl"
                } max-w-40 truncate`}
              >
                {greeting}
              </p>
              <button
                onClick={toggleMobileMenu}
                className="p-2 rounded-full hover:bg-white/10 transition-colors shrink-0"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex-1 overflow-y-auto px-6 py-4">
              <ul>
                {menuItems.map((item, i) => (
                  <motion.li
                    key={item.href}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * i + 0.1 }}
                    className="border-b border-white/10"
                  >
                    <Link
                      href={item.href}
                      onClick={toggleMobileMenu}
                      className="block py-4 text-white text-base font-medium hover:text-gray-300 transition-colors tracking-wide"
                    >
                      {item.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </nav>

            {/* Logo — centered, large, between nav and contact */}
            <div className="px-6 py-6 flex justify-center border-t border-white/10">
              <div className="relative h-16 w-44">
                <Image
                  src="/images/logo.png"
                  alt="Body Pharm Labz"
                  fill
                  className="object-contain brightness-0 invert"
                />
              </div>
            </div>

            {/* Footer contact */}
            <div className="px-6 py-5 border-t border-white/10">
              <p className="text-xs text-gray-500 uppercase tracking-[0.15em] mb-3">Contact</p>
              <a
                href={`tel:${siteData.business.phone}`}
                className="block text-sm text-gray-400 hover:text-white transition-colors mb-1.5"
              >
                {siteData.business.phone}
              </a>
              <a
                href={`mailto:${siteData.business.email}`}
                className="block text-sm text-gray-400 hover:text-white transition-colors"
              >
                {siteData.business.email}
              </a>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileMenu;
