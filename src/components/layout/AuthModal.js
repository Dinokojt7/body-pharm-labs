"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, Phone, AlertCircle, ChevronLeft } from "lucide-react";

import {
  signInWithGoogle,
  setupRecaptcha,
  signInWithPhone,
  verifyPhoneOTP,
} from "@/lib/firebase/auth";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useUIStore } from "@/lib/stores/ui-store";
import { usePreventScroll } from "@/lib/hooks/usePreventScroll";

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

const COUNTRY_CODES = [
  { code: "+27", flag: "🇿🇦", name: "SA" },
  { code: "+1", flag: "🇺🇸", name: "US" },
  { code: "+44", flag: "🇬🇧", name: "UK" },
  { code: "+61", flag: "🇦🇺", name: "AU" },
  { code: "+971", flag: "🇦🇪", name: "UAE" },
  { code: "+91", flag: "🇮🇳", name: "IN" },
  { code: "+49", flag: "🇩🇪", name: "DE" },
  { code: "+33", flag: "🇫🇷", name: "FR" },
];

export default function AuthModal() {
  const { isAuthenticated } = useAuthStore();
  const { isAuthModalOpen, closeAuthModal } = useUIStore();

  const [step, setStep] = useState("main");
  const [countryCode, setCountryCode] = useState(COUNTRY_CODES[0]);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const otpRefs = useRef([]);
  const modalRef = useRef(null);

  usePreventScroll(isAuthModalOpen);

  // Close on auth success
  useEffect(() => {
    if (isAuthenticated && isAuthModalOpen) closeAuthModal();
  }, [isAuthenticated, isAuthModalOpen, closeAuthModal]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") handleClose();
    };
    if (isAuthModalOpen) window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isAuthModalOpen]);

  const handleClose = () => {
    closeAuthModal();
    setTimeout(() => {
      setStep("main");
      setPhoneNumber("");
      setOtp(["", "", "", "", "", ""]);
      setError("");
      setConfirmationResult(null);
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch {}
        window.recaptchaVerifier = null;
      }
    }, 300);
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError("");
    const { error: err } = await signInWithGoogle();
    if (err) {
      setError(err);
      setLoading(false);
    }
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    const fullPhone = `${countryCode.code}${phoneNumber.replace(/^0/, "")}`;
    setLoading(true);
    setError("");
    const verifier = setupRecaptcha("recaptcha-container-modal");
    if (!verifier) {
      setError("reCAPTCHA failed. Please refresh and try again.");
      setLoading(false);
      return;
    }
    const { confirmationResult: result, error: err } = await signInWithPhone(
      fullPhone,
      verifier,
    );
    setLoading(false);
    if (err) {
      setError(err);
      return;
    }
    setConfirmationResult(result);
    setStep("otp");
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0)
      otpRefs.current[index - 1]?.focus();
  };

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      otpRefs.current[5]?.focus();
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) {
      setError("Enter all 6 digits.");
      return;
    }
    setLoading(true);
    setError("");
    const { error: err } = await verifyPhoneOTP(confirmationResult, code);
    setLoading(false);
    if (err) {
      setError(err);
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
    }
  };

  return (
    <AnimatePresence>
      {isAuthModalOpen && (
        <>
          {/* Invisible reCAPTCHA */}
          <div id="recaptcha-container-modal" />

          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-60"
          />

          {/* Modal - FULLY MOBILE RESPONSIVE */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            ref={modalRef}
            className="fixed inset-0 z-61 flex items-center justify-center p-2 sm:p-4 pointer-events-none"
          >
            <div className="w-full max-w-3xl overflow-hidden rounded-2xl shadow-2xl flex flex-col md:flex-row pointer-events-auto max-h-[90vh] md:max-h-none">
              {/* ── Left panel - Hidden on mobile, visible on desktop ── */}
              <div className="hidden md:block md:w-5/12 relative min-h-[500px] bg-black overflow-hidden">
                {/* Background image */}
                <div className="absolute inset-0">
                  <Image
                    src="/images/auth-bg.jpg"
                    alt=""
                    fill
                    className="object-cover opacity-40"
                  />
                  <div className="absolute inset-0 bg-linear-to-b from-black/70 via-black/30 to-black/80" />
                </div>

                {/* Logo */}
                <div className="relative z-10 flex items-center justify-center h-full">
                  <div className="relative w-64 h-24 lg:w-80 lg:h-32">
                    <Image
                      src="/images/logo.png"
                      alt="Body Pharm Labz"
                      fill
                      className="object-contain brightness-0 invert"
                      priority
                    />
                  </div>
                </div>

                {/* Tagline - Hidden on mobile */}
                <div className="absolute bottom-8 left-8 right-8 z-10">
                  <p className="text-white text-xl font-bold leading-tight">
                    Research-Grade
                    <br />
                    Peptides.
                  </p>
                  <p className="text-white/50 text-xs mt-2">
                    Trusted by scientists worldwide.
                  </p>
                </div>
              </div>

              {/* ── Right panel - Takes full width on mobile ── */}
              <div className="w-full md:w-7/12 bg-white relative flex flex-col max-h-[90vh] md:max-h-[500px] overflow-y-auto">
                {/* Close button */}
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors z-10"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>

                <AnimatePresence mode="wait">
                  {step === "main" && (
                    <motion.div
                      key="main"
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -12 }}
                      transition={{ duration: 0.2 }}
                      className="p-6 sm:p-8 md:p-10 flex flex-col justify-center min-h-[500px] md:min-h-0"
                    >
                      {/* Mobile Logo - Only visible on mobile */}
                      <div className="md:hidden flex justify-center mb-6">
                        <div className="relative w-48 h-16">
                          <Image
                            src="/images/logo.png"
                            alt="Body Pharm Labz"
                            fill
                            className="object-contain"
                            priority
                          />
                        </div>
                      </div>

                      <h2 className="text-2xl font-bold tracking-tight text-black mb-1">
                        Sign in
                      </h2>
                      <p className="text-sm text-gray-400 mb-6 md:mb-8">
                        Access your account to manage orders.
                      </p>

                      <button
                        onClick={handleGoogle}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-200 rounded-xl text-sm font-medium text-black hover:bg-gray-50 transition-colors disabled:opacity-50"
                      >
                        <GoogleIcon />
                        {loading ? "Redirecting…" : "Continue with Google"}
                      </button>

                      <div className="flex items-center gap-3 my-5">
                        <div className="flex-1 h-px bg-gray-100" />
                        <span className="text-xs text-gray-400 uppercase tracking-widest">
                          or
                        </span>
                        <div className="flex-1 h-px bg-gray-100" />
                      </div>

                      <button
                        onClick={() => setStep("phone-input")}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-900 transition-colors disabled:opacity-50"
                      >
                        <Phone className="w-4 h-4" />
                        Continue with Phone
                      </button>

                      {error && (
                        <div className="mt-5 flex items-start gap-2 text-red-500 text-xs">
                          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                          <span>{error}</span>
                        </div>
                      )}

                      <p className="mt-6 md:mt-8 text-xs text-gray-400 text-center">
                        By continuing you agree to our{" "}
                        <span className="text-black underline cursor-pointer">
                          Terms
                        </span>
                      </p>
                    </motion.div>
                  )}

                  {step === "phone-input" && (
                    <motion.div
                      key="phone-input"
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -12 }}
                      transition={{ duration: 0.2 }}
                      className="p-6 sm:p-8 md:p-10 flex flex-col justify-center min-h-[500px] md:min-h-0"
                    >
                      <button
                        onClick={() => {
                          setStep("main");
                          setError("");
                        }}
                        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-black transition-colors mb-6 self-start"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        Back
                      </button>

                      <h2 className="text-2xl font-bold tracking-tight text-black mb-1">
                        Enter your number
                      </h2>
                      <p className="text-sm text-gray-400 mb-6 md:mb-8">
                        We'll send a one-time code.
                      </p>

                      <form onSubmit={handleSendOTP} className="space-y-4">
                        <div className="flex gap-2">
                          <div className="relative">
                            <select
                              value={countryCode.code}
                              onChange={(e) =>
                                setCountryCode(
                                  COUNTRY_CODES.find(
                                    (c) => c.code === e.target.value,
                                  ),
                                )
                              }
                              className="appearance-none h-full pl-3 pr-8 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:border-black transition-colors cursor-pointer"
                            >
                              {COUNTRY_CODES.map((c) => (
                                <option key={c.code} value={c.code}>
                                  {c.flag} {c.code}
                                </option>
                              ))}
                            </select>
                            <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </div>
                          </div>
                          <input
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) =>
                              setPhoneNumber(e.target.value.replace(/\D/g, ""))
                            }
                            placeholder="81 234 5678"
                            required
                            autoFocus
                            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black transition-colors placeholder:text-gray-300"
                          />
                        </div>

                        {error && (
                          <div className="flex items-start gap-2 text-red-500 text-xs">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                            <span>{error}</span>
                          </div>
                        )}

                        <button
                          type="submit"
                          disabled={loading || phoneNumber.length < 7}
                          className="w-full py-3 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-900 transition-colors disabled:opacity-40"
                        >
                          {loading ? "Sending…" : "Send Code"}
                        </button>
                      </form>
                    </motion.div>
                  )}

                  {step === "otp" && (
                    <motion.div
                      key="otp"
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -12 }}
                      transition={{ duration: 0.2 }}
                      className="p-6 sm:p-8 md:p-10 flex flex-col justify-center min-h-[500px] md:min-h-0"
                    >
                      <button
                        onClick={() => {
                          setStep("phone-input");
                          setOtp(["", "", "", "", "", ""]);
                          setError("");
                        }}
                        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-black transition-colors mb-6 self-start"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        Back
                      </button>

                      <h2 className="text-2xl font-bold tracking-tight text-black mb-1">
                        Enter the code
                      </h2>
                      <p className="text-sm text-gray-400 mb-6 md:mb-8">
                        Sent to {countryCode.code} {phoneNumber}
                      </p>

                      <form onSubmit={handleVerifyOTP} className="space-y-6">
                        <div
                          className="flex gap-2 justify-between"
                          onPaste={handleOtpPaste}
                        >
                          {otp.map((digit, i) => (
                            <input
                              key={i}
                              ref={(el) => (otpRefs.current[i] = el)}
                              type="text"
                              inputMode="numeric"
                              maxLength={1}
                              value={digit}
                              onChange={(e) =>
                                handleOtpChange(i, e.target.value)
                              }
                              onKeyDown={(e) => handleOtpKeyDown(i, e)}
                              className="w-10 h-12 sm:w-11 sm:h-12 text-center text-lg font-bold border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors"
                            />
                          ))}
                        </div>

                        {error && (
                          <div className="flex items-start gap-2 text-red-500 text-xs">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                            <span>{error}</span>
                          </div>
                        )}

                        <button
                          type="submit"
                          disabled={loading || otp.join("").length < 6}
                          className="w-full py-3 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-900 transition-colors disabled:opacity-40"
                        >
                          {loading ? "Verifying…" : "Verify & Sign In"}
                        </button>

                        <p className="text-center text-xs text-gray-400">
                          Didn't receive it?{" "}
                          <button
                            type="button"
                            onClick={() => {
                              setStep("phone-input");
                              setOtp(["", "", "", "", "", ""]);
                              setError("");
                            }}
                            className="text-black font-medium hover:opacity-60 transition-opacity"
                          >
                            Resend
                          </button>
                        </p>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
