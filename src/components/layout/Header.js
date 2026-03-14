"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  User,
  ShoppingBag,
  Menu,
  X,
  LogOut,
  Package,
} from "lucide-react";

import { useCartStore } from "@/lib/stores/cart-store";
import { useUIStore } from "@/lib/stores/ui-store";
import { useAuthStore } from "@/lib/stores/auth-store";
import { logout } from "@/lib/firebase/auth";
import { useScrollDirection } from "@/lib/hooks/useScrollDirection";
import CurrencySelector from "../ui/CurrencySelector";
import CartSidebar from "./CartSidebar";
import MobileMenu from "./MobileMenu";
import AuthModal from "./AuthModal";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const pathname = usePathname();
  const router = useRouter();
  const { scrollDirection, scrollY } = useScrollDirection();
  const { totalItems, toggleCart } = useCartStore();
  const { toggleMobileMenu, isMobileMenuOpen } = useUIStore();
  const { isAuthenticated, user, getDisplayName } = useAuthStore();
  const { openAuthModal } = useUIStore();

  useEffect(() => {
    setIsScrolled(scrollY > 50);
  }, [scrollY]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setUserMenuOpen(false);
    await logout();
    router.push("/");
  };

  const initials = getDisplayName()?.charAt(0)?.toUpperCase() || "U";

  const isTransparent = !isScrolled && pathname === "/";

  return (
    <>
      <header
        className={`fixed left-0 right-0 z-50 transition-all duration-300 ${
          isTransparent
            ? "bg-linear-to-b from-black/50 to-transparent"
            : "bg-white shadow-sm border-b border-amber-400/20"
        }`}
        style={{ top: `${Math.max(0, 36 - scrollY)}px` }}
      >
        {/* Main Header */}
        <div className="px-4 md:px-8 lg:px-12">
          <div className="relative flex items-center justify-between h-20">
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

            {/* Center - Logo (absolutely centered) */}
            <Link
              href="/"
              className="absolute left-1/2 -translate-x-1/2 w-36 h-14 md:w-52 md:h-16"
            >
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

              {isAuthenticated ? (
                <div ref={userMenuRef} className="relative">
                  <button
                    onClick={() => setUserMenuOpen((v) => !v)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      isTransparent
                        ? "bg-white/20 text-white hover:bg-white/30"
                        : "bg-black text-white hover:bg-gray-800"
                    }`}
                  >
                    {user?.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={initials}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      initials
                    )}
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden z-50"
                      >
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-xs font-semibold text-black truncate">
                            {getDisplayName()}
                          </p>
                          {user?.email && (
                            <p className="text-xs text-gray-400 truncate mt-0.5">
                              {user.email}
                            </p>
                          )}
                        </div>
                        <Link
                          href="/account"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Package className="w-4 h-4" />
                          My Orders
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button
                  onClick={openAuthModal}
                  className={`p-2 rounded-full transition-colors ${
                    isTransparent ? "hover:bg-white/10" : "hover:bg-gray-100"
                  }`}
                >
                  <User
                    className={`w-5 h-5 ${isTransparent ? "text-white" : "text-black"}`}
                  />
                </button>
              )}

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
      <AuthModal />
    </>
  );
};

export default Header;
