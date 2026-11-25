"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePreventScroll } from "@/lib/hooks/usePreventScroll";

// Sale window (SAST). Outside it the popup never shows and SiteChrome
// falls back to the regular membership popup.
export const BLACK_FRIDAY_START = new Date("2026-11-25T00:00:00+02:00");
export const BLACK_FRIDAY_END = new Date("2026-11-30T23:59:59+02:00");
export const BLACK_FRIDAY_CODE = "BPL40";

export function isBlackFridayLive(now = new Date()) {
  return now >= BLACK_FRIDAY_START && now <= BLACK_FRIDAY_END;
}

const DISMISS_KEY = "blackFridayDismissed";

const goldBg = {
  background: "linear-gradient(135deg, #b8892a 0%, #f0cb6e 50%, #b8892a 100%)",
};

export default function BlackFridayModal() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  usePreventScroll(open);

  useEffect(() => {
    if (!isBlackFridayLive()) return;
    if (typeof sessionStorage !== "undefined" && sessionStorage.getItem(DISMISS_KEY)) return;
    const timer = setTimeout(() => setOpen(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    if (typeof sessionStorage !== "undefined") sessionStorage.setItem(DISMISS_KEY, "1");
    setOpen(false);
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(BLACK_FRIDAY_CODE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked: the code is visible on the button anyway.
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"
            onClick={dismiss}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Black Friday sale: 50% off all peptides"
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            style={{ width: "min(400px, calc((92vh - 68px) * 770 / 1280), 100%)" }}
            className="relative z-10 flex flex-col overflow-hidden rounded-xl bg-black shadow-2xl ring-1 ring-[#b8892a]/40"
          >
            <button
              onClick={dismiss}
              aria-label="Close"
              className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/60 text-white/80 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Poster: 770x1280 */}
            <div className="relative w-full aspect-[770/1280]">
              <Image
                src="/images/black-friday-2026.jpeg"
                alt="Black Friday Sale: 50% off all peptides. Use code BPL40 for 40% off, plus the 10% lifetime members discount."
                fill
                sizes="400px"
                className="object-contain"
                priority
              />
            </div>

            <div className="flex gap-2 p-3 bg-black">
              <button
                onClick={copyCode}
                className="flex-1 h-11 rounded-lg border border-[#b8892a] text-[#f0cb6e] text-sm font-semibold tracking-wide flex items-center justify-center gap-2 hover:bg-white/5 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" /> {BLACK_FRIDAY_CODE}
                  </>
                )}
              </button>
              <Link
                href="/shop"
                onClick={dismiss}
                style={goldBg}
                className="flex-1 h-11 rounded-lg text-black text-sm font-bold tracking-wide flex items-center justify-center hover:opacity-90 transition-opacity"
              >
                Shop Now
              </Link>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
