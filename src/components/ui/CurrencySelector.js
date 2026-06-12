"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCurrency } from "@/lib/hooks/useCurrency";

const FLAG_CODES = {
  ZAR: "za",
  USD: "us",
  EUR: "eu",
  GBP: "gb",
  CAD: "ca",
  AUD: "au",
};

function FlagImg({ code, size = 20 }) {
  const countryCode = FLAG_CODES[code];
  if (!countryCode) return null;
  return (
    <img
      src={`https://flagcdn.com/w${size}/${countryCode}.png`}
      srcSet={`https://flagcdn.com/w${size * 2}/${countryCode}.png 2x`}
      width={size}
      height={Math.round(size * 0.75)}
      alt={code}
      className="object-cover shrink-0"
      style={{ borderRadius: "2px" }}
    />
  );
}

const CurrencySelector = ({ isTransparent }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { selectedCurrency, setSelectedCurrency, currencies, loading } =
    useCurrency();

  const selected =
    currencies.find((c) => c.code === selectedCurrency) || currencies[0];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (currency) => {
    setSelectedCurrency(currency.code);
    setIsOpen(false);
  };

  const btnBase = "h-10 md:h-11 flex items-center gap-1.5 px-3 rounded-lg border transition-all duration-200";
  const btnStyle = isTransparent
    ? `${btnBase} bg-black/[0.04] border-black/[0.10] hover:bg-black/[0.08]`
    : `${btnBase} bg-transparent border-gray-200 hover:bg-gray-50`;

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)} className={btnStyle}>
        <FlagImg code={selected?.code} size={20} />
        <span className="text-[11px] font-semibold text-black">{selected?.code}</span>
        <ChevronDown
          className={`w-3 h-3 text-black transition-transform shrink-0 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50"
          >
            <div className="py-1">
              {currencies.map((currency) => (
                <button
                  key={currency.code}
                  onClick={() => handleSelect(currency)}
                  className={`w-full px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2.5 ${
                    selectedCurrency === currency.code
                      ? "bg-gray-50 font-semibold"
                      : ""
                  }`}
                >
                  <FlagImg code={currency.code} size={20} />
                  <span className="text-black font-semibold text-xs">{currency.code}</span>
                  <span className="text-black/40 text-xs ml-auto">{currency.symbol}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CurrencySelector;
