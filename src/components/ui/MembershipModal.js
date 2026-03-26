"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Loader2 } from "lucide-react";
import Image from "next/image";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useUIStore } from "@/lib/stores/ui-store";
import { getUserProfile } from "@/lib/firebase/firestore";

const BENEFITS = [
  "10% off applied automatically at checkout",
  "Priority access to new product drops",
  "One-time fee · Benefits never expire",
];

const goldStyle = {
  background: "linear-gradient(135deg, #b8892a 0%, #f0cb6e 45%, #b8892a 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
};

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={dismiss}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 24 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="relative z-10 w-full max-w-2xl flex overflow-hidden rounded-2xl shadow-2xl"
          >
            {/* Left panel — image, desktop only */}
            <div className="hidden md:block md:w-5/12 relative min-h-[520px] overflow-hidden bg-[#f0ede8]">
              <Image
                src="/images/hero-bg2.webp"
                alt=""
                fill
                className="object-cover object-right"
                priority
              />
            </div>

            {/* Right panel */}
            <div className="w-full md:w-7/12 bg-white flex flex-col justify-between px-8 py-9 relative">
              {/* Close */}
              <button
                onClick={dismiss}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-300 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div>
                {/* Gold label */}
                <p className="text-xs font-semibold tracking-[0.25em] uppercase mb-5" style={goldStyle}>
                  Members Only
                </p>

                {/* Mixed typography headline */}
                <div className="mb-1">
                  <span className="block text-2xl font-light text-gray-400 leading-tight tracking-wide">
                    Unlock
                  </span>
                  <span className="block text-[72px] leading-none font-black text-black tracking-tight">
                    10%
                  </span>
                  <span className="block text-xl font-light italic text-gray-500 leading-snug -mt-1">
                    off every order.
                  </span>
                </div>

                {/* Sub-label */}
                <p className="text-xs font-light text-gray-400 mt-3 mb-7 leading-relaxed max-w-xs">
                  Join the Body Pharm Labs member club and save on every purchase — for life.
                </p>

                {/* Benefits */}
                <ul className="space-y-2.5 mb-8">
                  {BENEFITS.map((b) => (
                    <li key={b} className="flex items-start gap-2.5">
                      <Check className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                      <span className="text-xs text-gray-500 leading-relaxed">{b}</span>
                    </li>
                  ))}
                </ul>

                {/* Price */}
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-3xl font-black text-black">R199</span>
                  <span className="text-xs font-medium" style={goldStyle}>
                    once-off · lifetime access
                  </span>
                </div>

                {/* CTA */}
                <button
                  onClick={handleJoin}
                  disabled={loading}
                  className="w-full h-12 rounded-lg bg-black text-white text-sm font-semibold tracking-wide hover:bg-gray-900 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
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
              </div>

              {/* Skip */}
              <button
                onClick={dismiss}
                className="mt-5 text-xs text-gray-400 hover:text-gray-600 transition-colors text-left tracking-wide"
              >
                Skip for now
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
