"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Loader2 } from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useUIStore } from "@/lib/stores/ui-store";
import { getUserProfile } from "@/lib/firebase/firestore";

const BENEFITS = [
  "Instant 10% discount applied at checkout",
  "Priority access to new product drops",
  "One-time payment · Lifetime benefits",
];

export default function MembershipModal() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user, authLoading } = useAuthStore();
  const { openAuthModal } = useUIStore();

  useEffect(() => {
    if (authLoading) return;
    if (typeof sessionStorage !== "undefined" && sessionStorage.getItem("membershipDismissed")) return;

    const timer = setTimeout(async () => {
      if (user?.uid) {
        const { profile } = await getUserProfile(user.uid);
        if (profile?.membership?.active) return;
      }
      setOpen(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, [authLoading]);

  const dismiss = () => {
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.setItem("membershipDismissed", "1");
    }
    setOpen(false);
  };

  const handleJoin = async () => {
    if (!user?.uid) {
      dismiss();
      openAuthModal();
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/membership-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, userId: user.uid }),
      });
      const data = await res.json();
      if (data.success) {
        window.location.href = data.authorization_url;
      } else {
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={dismiss}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="relative z-10 w-full max-w-md bg-[#111114] border border-white/10 rounded-2xl overflow-hidden"
          >
            {/* Close */}
            <button
              onClick={dismiss}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-white/30 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="px-8 pt-8 pb-8">
              {/* Badge */}
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-widest uppercase mb-5">
                Members Only
              </span>

              {/* Big number */}
              <div className="mb-2">
                <span className="text-[86px] leading-none font-black text-white tracking-tight">10</span>
                <span className="text-[86px] leading-none font-black text-blue-400 tracking-tight">%</span>
              </div>
              <p className="text-white/50 text-sm mb-7 tracking-wide">
                off every order, forever.
              </p>

              {/* Benefits */}
              <ul className="space-y-3 mb-8">
                {BENEFITS.map((b) => (
                  <li key={b} className="flex items-start gap-3 text-sm text-white/60">
                    <Check className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    {b}
                  </li>
                ))}
              </ul>

              {/* Price */}
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-white font-semibold text-2xl">R199</span>
                <span className="text-white/30 text-xs">once · never again</span>
              </div>

              {/* CTA */}
              <button
                onClick={handleJoin}
                disabled={loading}
                className="w-full h-12 rounded-lg bg-white text-black text-sm font-semibold tracking-wide hover:bg-white/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Redirecting…
                  </>
                ) : user ? (
                  "Join Now — R199"
                ) : (
                  "Sign in to Join"
                )}
              </button>

              {/* Dismiss */}
              <button
                onClick={dismiss}
                className="w-full mt-3 text-xs text-white/25 hover:text-white/50 transition-colors py-1"
              >
                No thanks
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
