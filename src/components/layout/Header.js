"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, User, ShoppingBag, Menu, X } from "lucide-react";

import { useCartStore } from "@/lib/stores/cart-store";
import { useUIStore } from "@/lib/stores/ui-store";
import { useScrollDirection } from "@/lib/hooks/useScrollDirection";
import CurrencySelector from "../ui/CurrencySelector";
import CartSidebar from "./CartSidebar";
import MobileMenu from "./MobileMenu";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { scrollDirection, scrollY } = useScrollDirection();
  const { totalItems, toggleCart } = useCartStore();
  const { toggleMobileMenu, isMobileMenuOpen } = useUIStore();

  useEffect(() => {
    setIsScrolled(scrollY > 50);
  }, [scrollY]);

  const isTransparent = !isScrolled && pathname === "/";

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isTransparent ? "bg-transparent" : "bg-white shadow-md"
        }`}
        style={{
          top: scrollDirection === "down" && isScrolled ? "-120px" : "0",
        }}
      >
        {/* Main Header */}
        <div className="px-4 md:px-8 lg:px-12">
          <div className="flex items-center justify-between h-20">
            {/* Left - Hamburger Menu */}
            <button
              onClick={toggleMobileMenu}
              className={`p-2 rounded-full transition-colors ${
                isTransparent ? "hover:bg-white/10" : "hover:bg-gray-100"
              }`}
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

            {/* Center - Logo */}
            <Link href="/" className="relative h-12 w-32">
              <Image
                src="/images/logo.png"
                alt="Body Pharm Labz"
                fill
                className={`object-contain transition-all ${
                  isTransparent ? "brightness-0 invert" : ""
                }`}
              />
            </Link>

            {/* Right - Icons */}
            <div className="flex items-center space-x-4">
              <CurrencySelector isTransparent={isTransparent} />

              <button
                className={`p-2 rounded-full transition-colors ${
                  isTransparent ? "hover:bg-white/10" : "hover:bg-gray-100"
                }`}
              >
                <Search
                  className={`w-5 h-5 ${isTransparent ? "text-white" : "text-black"}`}
                />
              </button>

              <Link
                href="/auth"
                className={`p-2 rounded-full transition-colors ${
                  isTransparent ? "hover:bg-white/10" : "hover:bg-gray-100"
                }`}
              >
                <User
                  className={`w-5 h-5 ${isTransparent ? "text-white" : "text-black"}`}
                />
              </Link>

              <button
                onClick={toggleCart}
                className={`relative p-2 rounded-full transition-colors ${
                  isTransparent ? "hover:bg-white/10" : "hover:bg-gray-100"
                }`}
              >
                <ShoppingBag
                  className={`w-5 h-5 ${isTransparent ? "text-white" : "text-black"}`}
                />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
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
    </>
  );
};

export default Header;
