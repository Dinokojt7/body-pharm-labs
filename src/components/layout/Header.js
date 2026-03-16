"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { User, ShoppingBag, Menu, X } from "lucide-react";

import { useCartStore } from "@/lib/stores/cart-store";
import { useUIStore } from "@/lib/stores/ui-store";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useScrollDirection } from "@/lib/hooks/useScrollDirection";
import CurrencySelector from "../ui/CurrencySelector";
import CartSidebar from "./CartSidebar";
import MobileMenu from "./MobileMenu";
import AuthModal from "./AuthModal";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { scrollDirection, scrollY } = useScrollDirection();
  const { totalItems, toggleCart } = useCartStore();
  const { toggleMobileMenu, isMobileMenuOpen, openAuthModal } = useUIStore();
  const { isAuthenticated, getDisplayName } = useAuthStore();

  useEffect(() => {
    setIsScrolled(scrollY > 50);
  }, [scrollY]);

  const initials = getDisplayName()?.slice(0, 2)?.toUpperCase() || "U";

  const isTransparent = !isScrolled && pathname === "/";

  return (
    <>
      <header
        className={`fixed left-0 right-0 z-40 transition-all duration-300 ${
          isTransparent
            ? "bg-linear-to-b from-black/50 to-transparent"
            : "bg-white shadow-sm border-b border-amber-400/20"
        }`}
        style={{ top: `${Math.max(0, 36 - scrollY)}px` }}
      >
        {/* Main Header */}
        <div className="px-4 md:px-8 lg:px-12">
          <div className="relative flex items-center justify-between h-24 md:h-28 lg:h-32">
            {/* Left - Hamburger Menu */}
            <button
              onClick={toggleMobileMenu}
              className={`p-2 rounded-full transition-colors z-50 ${
                isTransparent ? "hover:bg-white/10" : "hover:bg-gray-100"
              }`}
              aria-label="Menu"
            >
              {isMobileMenuOpen ? (
                <X
                  className={`w-6 h-6 ${isTransparent ? "text-white" : "text-black"}`}
                />
              ) : (
                <Menu
                  className={`w-6 h-6 ${isTransparent ? "text-white" : "text-black"}`}
                />
              )}
            </button>

            {/* Center - Logo - PERFECTLY CENTERED */}
            <Link href="/" className="absolute left-1/2 -translate-x-1/2 z-40">
              <div className="relative w-72 h-20 md:w-96 md:h-24 lg:w-[28rem] lg:h-28">
                <Image
                  src="/images/logo.png"
                  alt="Body Pharm Labz"
                  fill
                  priority
                  className={`object-contain transition-all ${
                    isTransparent ? "brightness-0 invert" : ""
                  }`}
                  sizes="(max-width: 768px) 288px, (max-width: 1024px) 384px, 448px"
                />
              </div>
            </Link>

            {/* Right - Icons */}
            <div className="flex items-center gap-2 sm:gap-4 z-50">
              <div className="hidden sm:block">
                <CurrencySelector isTransparent={isTransparent} />
              </div>

              {/* <button
                className={`hidden sm:flex p-2.5 rounded-full transition-colors ${
                  isTransparent ? "hover:bg-white/10" : "hover:bg-gray-100"
                }`}
                aria-label="Search"
              >
                <Search
                  className={`w-5 h-5 md:w-6 md:h-6 ${isTransparent ? "text-white" : "text-black"}`}
                />
              </button> */}

              {isAuthenticated ? (
                <Link
                  href="/account"
                  className={`w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center text-sm md:text-base font-semibold transition-colors ${
                    isTransparent
                      ? "bg-white/20 text-white hover:bg-white/30"
                      : "bg-black text-white hover:bg-gray-800"
                  }`}
                  aria-label="My account"
                >
                  {initials}
                </Link>
              ) : (
                <button
                  onClick={openAuthModal}
                  className={`p-2.5 rounded-full transition-colors ${
                    isTransparent ? "hover:bg-white/10" : "hover:bg-gray-100"
                  }`}
                  aria-label="Sign in"
                >
                  <User
                    className={`w-5 h-5 md:w-6 md:h-6 ${isTransparent ? "text-white" : "text-black"}`}
                  />
                </button>
              )}

              <button
                onClick={toggleCart}
                className={`relative p-2.5 rounded-full transition-colors ${
                  isTransparent ? "hover:bg-white/10" : "hover:bg-gray-100"
                }`}
                aria-label="Shopping cart"
              >
                <ShoppingBag
                  className={`w-5 h-5 md:w-6 md:h-6 ${isTransparent ? "text-white" : "text-black"}`}
                />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full h-5 w-5 md:h-6 md:w-6 md:text-sm flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom border - only when transparent */}
        {isTransparent && (
          <div className="border-b border-white/20 mx-4 md:mx-8 lg:mx-12" />
        )}
      </header>

      <CartSidebar />
      <MobileMenu />
      <AuthModal />
    </>
  );
};

export default Header;
