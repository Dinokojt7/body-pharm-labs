"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

import { useUIStore } from "@/lib/stores/ui-store";
import { usePreventScroll } from "@/lib/hooks/usePreventScroll";
import siteData from "@/lib/data/site-data.json";

const MobileMenu = () => {
  const { isMobileMenuOpen, toggleMobileMenu } = useUIStore();
  const menuRef = useRef(null);

  usePreventScroll(isMobileMenuOpen);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isMobileMenuOpen) {
        toggleMobileMenu();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isMobileMenuOpen, toggleMobileMenu]);

  const menuItems = [
    { label: "Home", href: "/" },
    { label: "About Us", href: "/about" },
    { label: "Shop", href: "/shop" },
    { label: "Testimonials", href: "/testimonials" },
    { label: "Contact Us", href: "/contact" },
  ];

  return (
    <AnimatePresence>
      {isMobileMenuOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={toggleMobileMenu}
          />

          <motion.div
            ref={menuRef}
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed left-0 top-0 h-full w-64 bg-white z-50 shadow-xl"
          >
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="font-bold">Menu</h2>
              <button
                onClick={toggleMobileMenu}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="p-6">
              <ul className="space-y-4">
                {menuItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={toggleMobileMenu}
                      className="block py-2 text-gray-700 hover:text-black transition-colors font-medium"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="mt-8 pt-8 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-2">Contact</p>
                <a
                  href={`tel:${siteData.business.phone}`}
                  className="block text-sm text-gray-700 hover:text-black"
                >
                  {siteData.business.phone}
                </a>
                <a
                  href={`mailto:${siteData.business.email}`}
                  className="block text-sm text-gray-700 hover:text-black mt-1"
                >
                  {siteData.business.email}
                </a>
              </div>
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileMenu;
