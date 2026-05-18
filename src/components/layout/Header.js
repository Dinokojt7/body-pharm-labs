"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, ShoppingBag, Search, X } from "lucide-react";
import { AnimatePresence } from "framer-motion";

import { useCartStore } from "@/lib/stores/cart-store";
import { useUIStore } from "@/lib/stores/ui-store";
import { useAuthStore } from "@/lib/stores/auth-store";
import CurrencySelector from "../ui/CurrencySelector";
import CartSidebar from "./CartSidebar";
import MobileMenu from "./MobileMenu";
import AuthModal from "./AuthModal";
import SearchBar from "./SearchBar";
import SearchDropdown from "./SearchDropdown";

const PREH = 36;

const NAV_LINKS = [
  { label: "Home",    href: "/"        },
  { label: "Shop",    href: "/shop"    },
  { label: "About",   href: "/about"   },
  { label: "Contact", href: "/contact" },
];

const BTN = "w-10 h-10 md:w-11 md:h-11 flex items-center justify-center rounded-lg border transition-all duration-200";
const BTN_TRANSPARENT = `${BTN} bg-black/[0.04] border-black/[0.10] hover:bg-black/[0.08]`;
const BTN_SOLID = `${BTN} bg-transparent border-gray-200 hover:bg-gray-50`;

const Header = () => {
  const [scrollY, setScrollY] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [query, setQuery] = useState("");
  const [dropdownTop, setDropdownTop] = useState(null);
  const headerRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const handler = () => {
      const y = window.scrollY;
      setScrollY(y);
      setScrolled(y > 40);
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Track header bottom edge for dropdown fixed positioning
  useEffect(() => {
    const update = () => {
      if (headerRef.current) {
        setDropdownTop(headerRef.current.getBoundingClientRect().bottom);
      }
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const { totalItems, toggleCart } = useCartStore();
  const { toggleMobileMenu, openAuthModal, isSearchOpen, toggleSearch, closeSearch } = useUIStore();
  const { isAuthenticated, getDisplayName } = useAuthStore();
  const pathname = usePathname();

  const initial = getDisplayName()?.slice(0, 1)?.toUpperCase() || "U";
  const headerTop = Math.max(0, PREH - scrollY);

  // Force solid background when search is open
  const isTransparent = pathname === "/" && !scrolled && !isSearchOpen;
  const btn = isTransparent ? BTN_TRANSPARENT : BTN_SOLID;

  // Focus input when search opens; reset query when it closes
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [isSearchOpen]);

  // ESC closes search
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && isSearchOpen) closeSearch();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isSearchOpen, closeSearch]);

  return (
    <>
      <header
        ref={headerRef}
        className="fixed left-0 right-0 z-40 transition-[background,box-shadow] duration-300"
        style={{
          top: `${headerTop}px`,
          background: isTransparent ? "transparent" : "white",
          boxShadow: isTransparent ? "none" : "0 1px 8px rgba(0,0,0,0.06)",
        }}
      >
        <div className="px-5 sm:px-8 lg:px-12">
          <div className="relative flex items-center justify-between h-28 md:h-32">

            {/* LEFT — logo */}
            <Link href="/" className="shrink-0">
              <img
                src="/images/app-logo.png"
                alt="Body Pharm Labs"
                className="h-28 md:h-32 w-auto object-contain"
                style={{ mixBlendMode: "multiply" }}
              />
            </Link>

            {/* CENTER — search input (when search open, fills available space) */}
            {isSearchOpen && (
              <div className="flex-1 mx-4 md:mx-8">
                <SearchBar
                  query={query}
                  onChange={setQuery}
                  inputRef={searchInputRef}
                />
              </div>
            )}

            {/* CENTER — pill nav (desktop only, hidden when search open) */}
            {!isSearchOpen && (
              <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2">
                <div
                  className="flex items-center gap-0.5 rounded-lg px-2 py-1.5 transition-all duration-300"
                  style={{
                    background: isTransparent ? "rgba(0,0,0,0.04)" : "rgba(0,0,0,0.03)",
                  }}
                >
                  {NAV_LINKS.map(({ label, href }) => {
                    const isActive = href === "/" ? pathname === "/" : pathname?.startsWith(href);
                    return (
                      <Link
                        key={href}
                        href={href}
                        className={`px-4 py-1.5 rounded-md text-[11px] font-semibold tracking-wide transition-all duration-200 ${
                          isActive
                            ? "text-black bg-black/[0.07]"
                            : "text-black/50 hover:text-black hover:bg-black/[0.06]"
                        }`}
                      >
                        {label}
                      </Link>
                    );
                  })}
                </div>
              </nav>
            )}

            {/* RIGHT — action buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              {!isSearchOpen && (
                <div className="hidden sm:block">
                  <CurrencySelector isTransparent={isTransparent} />
                </div>
              )}

              {/* Account — hidden when search open */}
              {!isSearchOpen && (
                <div className="relative">
                  {isAuthenticated ? (
                    <Link href="/account" aria-label="My account" className={btn}>
                      <User className="w-4 h-4 md:w-[18px] md:h-[18px] text-black" />
                    </Link>
                  ) : (
                    <button onClick={openAuthModal} aria-label="Sign in" className={btn}>
                      <User className="w-4 h-4 md:w-[18px] md:h-[18px] text-black" />
                    </button>
                  )}
                  {isAuthenticated && (
                    <span className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-semibold bg-amber-500 text-white pointer-events-none leading-none">
                      {initial}
                    </span>
                  )}
                </div>
              )}

              {/* Search toggle */}
              <button
                onClick={isSearchOpen ? closeSearch : toggleSearch}
                aria-label={isSearchOpen ? "Close search" : "Search"}
                className={btn}
              >
                {isSearchOpen
                  ? <X className="w-4 h-4 md:w-[18px] md:h-[18px] text-black" />
                  : <Search className="w-4 h-4 md:w-[18px] md:h-[18px] text-black" />}
              </button>

              {/* Cart */}
              <button onClick={toggleCart} aria-label="Shopping cart" className={`relative ${btn}`}>
                <ShoppingBag className="w-4 h-4 md:w-[18px] md:h-[18px] text-black" />
                {totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-black text-white text-[9px] font-semibold rounded-full h-5 w-5 flex items-center justify-center leading-none">
                    {totalItems}
                  </span>
                )}
              </button>

              {/* Mobile hamburger */}
              <button onClick={toggleMobileMenu} aria-label="Menu" className={`md:hidden ${btn}`}>
                <div className="flex flex-col gap-[5px]">
                  <span className="block h-px w-[18px] bg-black" />
                  <span className="block h-px w-3 bg-black" />
                  <span className="block h-px w-[18px] bg-black" />
                </div>
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Search dropdown — fixed at header bottom edge */}
      <AnimatePresence>
        {isSearchOpen && dropdownTop !== null && (
          <SearchDropdown
            query={query}
            top={dropdownTop}
            onClose={closeSearch}
          />
        )}
      </AnimatePresence>

      <CartSidebar />
      <MobileMenu />
      <AuthModal />
    </>
  );
};

export default Header;
