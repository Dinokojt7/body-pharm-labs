"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";

export default function CustomSelect({
  value,
  onChange,
  options = [],       // [{ value, label }]
  placeholder = "Select…",
  className = "",
  compact = false,    // true → h-7 px-2 text-xs (admin inline use)
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = options.find((o) => o.value === value);
  const triggerCls = compact
    ? `h-7 px-2 text-xs border border-gray-200 rounded-lg bg-white text-gray-700 cursor-pointer`
    : `w-full h-10 px-3 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 cursor-pointer`;

  return (
    <div ref={ref} className={`relative ${compact ? "inline-block" : "block"} ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`${triggerCls} flex items-center justify-between gap-2 focus:outline-none focus:border-gray-400 transition-colors select-none`}
      >
        <span className={selected ? "" : "text-gray-400"}>
          {selected ? selected.label : placeholder}
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.18 }}>
          <ChevronDown className={compact ? "w-3 h-3 text-gray-400 shrink-0" : "w-4 h-4 text-gray-400 shrink-0"} />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 top-full mt-1.5 left-0 min-w-full bg-white border border-gray-100 rounded-xl shadow-lg py-1 overflow-hidden"
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className="w-full flex items-center justify-between px-3 py-2 text-sm text-left hover:bg-gray-50 transition-colors"
              >
                <span className={opt.value === value ? "font-medium text-black" : "text-gray-700"}>
                  {opt.label}
                </span>
                {opt.value === value && <Check className="w-3.5 h-3.5 text-black shrink-0 ml-2" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
