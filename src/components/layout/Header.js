"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { User, ShoppingBag, Menu, X } from "lucide-react";

import { useCartStore } from "@/lib/stores/cart-store";
import { useUIStore } from "@/lib/stores/ui-store";
import { useAuthStore } from "@/lib/stores/auth-store";
import CurrencySelector from "../ui/CurrencySelector";
import CartSidebar from "./CartSidebar";
import MobileMenu from "./MobileMenu";
import AuthModal from "./AuthModal";

// PreHeader height in px — used to shift Header up as it scrolls away
const PREH = 36;

const Header = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handler = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const { totalItems, toggleCart } = useCartStore();
  const { toggleMobileMenu, isMobileMenuOpen, openAuthModal } = useUIStore();
  const { isAuthenticated, getDisplayName } = useAuthStore();

  const initials = getDisplayName()?.slice(0, 2)?.toUpperCase() || "U";

  // Header slides up as PreHeader scrolls away
  const headerTop = Math.max(0, PREH - scrollY);

  return (
    <>
      <header
        className="fixed left-0 right-0 z-40 bg-white shadow-[0_1px_8px_rgba(0,0,0,0.06)]"
        style={{ top: `${headerTop}px` }}
      >
        {/* Nav row */}
        <div className="px-4 md:px-8 lg:px-12">
          <div className="relative flex items-center justify-between h-24 md:h-28 lg:h-32">

            {/* Left — hamburger */}
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors z-50"
              aria-label="Menu"
            >
              {isMobileMenuOpen
                ? <X className="w-6 h-6 text-black" />
                : <Menu className="w-6 h-6 text-black" />}
            </button>

            {/* Center — logo */}
            <Link href="/" className="absolute left-1/2 -translate-x-1/2 z-40">
              <div className="relative w-48 h-14 sm:w-64 sm:h-18 md:w-96 md:h-24 lg:w-md lg:h-28">
                <Image
                  src="/images/logo.png"
                  alt="Body Pharm Labz"
                  fill
                  priority
                  className="object-contain"
                  sizes="(max-width: 768px) 288px, (max-width: 1024px) 384px, 448px"
                />
              </div>
            </Link>

            {/* Right — icons */}
            <div className="flex items-center gap-2 sm:gap-4 z-50">
              <div className="hidden sm:block">
                <CurrencySelector isTransparent={false} />
              </div>

              <div className="relative">
                {isAuthenticated ? (
                  <Link
                    href="/account"
                    className="p-2.5 rounded-full hover:bg-gray-100 transition-colors flex items-center justify-center"
                    aria-label="My account"
                  >
                    <User className="w-5 h-5 md:w-6 md:h-6 text-black" />
                  </Link>
                ) : (
                  <button
                    onClick={openAuthModal}
                    className="p-2.5 rounded-full hover:bg-gray-100 transition-colors"
                    aria-label="Sign in"
                  >
                    <User className="w-5 h-5 md:w-6 md:h-6 text-black" />
                  </button>
                )}
                {isAuthenticated && (
                  <span className="absolute -top-1 -right-1 h-6 w-6 rounded-full flex items-center justify-center text-[11px] font-semibold border pointer-events-none bg-transparent border-amber-400/30 text-black shadow-[0_0_6px_rgba(251,191,36,0.4)]">
                    {initials.charAt(0)}
                  </span>
                )}
              </div>

              <button
                onClick={toggleCart}
                className="relative p-2.5 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Shopping cart"
              >
                <ShoppingBag className="w-5 h-5 md:w-6 md:h-6 text-black" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full h-5 w-5 md:h-6 md:w-6 md:text-sm flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom border — slightly narrower than full-width but wider than hero margins */}
        <div className="border-b border-gray-100 mx-2 md:mx-4" />
      </header>

      <CartSidebar />
      <MobileMenu />
      <AuthModal />
    </>
  );
};

export default Header;
