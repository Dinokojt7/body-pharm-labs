"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, CalendarDays, X } from "lucide-react";

const DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function parseLocal(str) {
  if (!str) return null;
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function toYMD(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function CustomDatePicker({ value, onChange, placeholder = "No expiry" }) {
  const selected = parseLocal(value);
  const today = new Date();

  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const [view, setView] = useState(() => {
    const base = selected || today;
    return { year: base.getFullYear(), month: base.getMonth() };
  });
  const triggerRef = useRef(null);
  const calendarRef = useRef(null);

  // Close on any scroll or resize
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  // Click-outside: check both trigger and portal calendar
  useEffect(() => {
    const handler = (e) => {
      if (!triggerRef.current?.contains(e.target) && !calendarRef.current?.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Compute position synchronously at click time
  const handleToggle = () => {
    if (!open && triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect();
      setCoords({ top: r.bottom + 6, left: r.left });
    }
    setOpen((v) => !v);
  };

  const prevMonth = () => setView((v) => {
    const d = new Date(v.year, v.month - 1);
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const nextMonth = () => setView((v) => {
    const d = new Date(v.year, v.month + 1);
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  // Build calendar grid — weeks starting Monday
  const firstDay = new Date(view.year, view.month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7; // Mon=0
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const isSelected = (d) => {
    if (!d || !selected) return false;
    return selected.getFullYear() === view.year && selected.getMonth() === view.month && selected.getDate() === d;
  };

  const isToday = (d) => {
    if (!d) return false;
    return today.getFullYear() === view.year && today.getMonth() === view.month && today.getDate() === d;
  };

  const selectDay = (d) => {
    if (!d) return;
    onChange(toYMD(new Date(view.year, view.month, d)));
    setOpen(false);
  };

  const displayValue = selected
    ? selected.toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "numeric" })
    : "";

  return (
    <div className="relative w-full">
      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        className="w-full h-10 px-3 flex items-center justify-between gap-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:border-gray-400 transition-colors cursor-pointer select-none"
      >
        <span className={displayValue ? "text-gray-900" : "text-gray-400"}>
          {displayValue || placeholder}
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          {value && (
            <span
              onClick={(e) => { e.stopPropagation(); onChange(""); }}
              className="text-gray-300 hover:text-gray-600 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <CalendarDays className="w-4 h-4 text-gray-400" />
        </div>
      </button>

      {/* Calendar — portaled to document.body, never clipped by any ancestor */}
      <AnimatePresence>
        {open && createPortal(
          <motion.div
            ref={calendarRef}
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            style={{ top: coords.top, left: coords.left }}
            className="fixed z-9999 w-72 bg-white border border-gray-100 rounded-xl shadow-xl p-4"
          >
            {/* Month nav */}
            <div className="flex items-center justify-between mb-4">
              <button type="button" onClick={prevMonth} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-500">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-semibold text-gray-900">
                {MONTHS[view.month]} {view.year}
              </span>
              <button type="button" onClick={nextMonth} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-500">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 mb-2">
              {DAYS.map((d) => (
                <div key={d} className="text-center text-[10px] font-semibold text-gray-400 py-1">{d}</div>
              ))}
            </div>

            {/* Day grid */}
            <div className="grid grid-cols-7 gap-y-1">
              {cells.map((d, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => selectDay(d)}
                  disabled={!d}
                  className={`
                    h-8 w-full flex items-center justify-center rounded-lg text-sm transition-colors
                    ${!d ? "pointer-events-none" : ""}
                    ${isSelected(d) ? "bg-black text-white font-semibold" : ""}
                    ${!isSelected(d) && d ? "text-gray-700 hover:bg-gray-100" : ""}
                    ${isToday(d) && !isSelected(d) ? "font-semibold text-black underline underline-offset-2" : ""}
                  `}
                >
                  {d || ""}
                </button>
              ))}
            </div>

            {/* Clear */}
            {value && (
              <div className="mt-3 pt-3 border-t border-gray-100 text-center">
                <button
                  type="button"
                  onClick={() => { onChange(""); setOpen(false); }}
                  className="text-xs text-gray-400 hover:text-black transition-colors"
                >
                  Clear date
                </button>
              </div>
            )}
          </motion.div>,
          document.body
        )}
      </AnimatePresence>
    </div>
  );
}
