"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, ArrowLeft, AlertCircle, ChevronLeft } from "lucide-react";

import {
  signInWithGoogle,
  setupRecaptcha,
  signInWithPhone,
  verifyPhoneOTP,
} from "@/lib/firebase/auth";
import { useAuthStore } from "@/lib/stores/auth-store";

// Google icon SVG
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
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
  { code: "+49", flag: "🇩🇪", name: "DE" },
  { code: "+33", flag: "🇫🇷", name: "FR" },
  { code: "+91", flag: "🇮🇳", name: "IN" },
  { code: "+971", flag: "🇦🇪", name: "UAE" },
];

export default function AuthPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  // Steps: "main" | "phone-input" | "otp"
  const [step, setStep] = useState("main");
  const [countryCode, setCountryCode] = useState(COUNTRY_CODES[0]);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const otpRefs = useRef([]);

  useEffect(() => {
    if (isAuthenticated) router.replace("/");
  }, [isAuthenticated, router]);

  // ── Google ──────────────────────────────────────────────────
  const handleGoogle = async () => {
    setLoading(true);
    setError("");
    const { error: err } = await signInWithGoogle();
    if (err) {
      setError(err);
      setLoading(false);
    }
    // onAuthStateChanged in AuthContext will update store → redirect via useEffect
  };

  // ── Phone step 1 ────────────────────────────────────────────
  const handleSendOTP = async (e) => {
    e.preventDefault();
    const fullPhone = `${countryCode.code}${phoneNumber.replace(/^0/, "")}`;
    setLoading(true);
    setError("");

    const verifier = setupRecaptcha("recaptcha-container");
    if (!verifier) {
      setError("reCAPTCHA setup failed. Please refresh and try again.");
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

  // ── OTP input handling ───────────────────────────────────────
  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
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

  // ── Phone step 2 ────────────────────────────────────────────
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
    // success → AuthContext updates store → useEffect redirects
  };

  const resetToMain = () => {
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
  };

  // ── Render ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      {/* Invisible reCAPTCHA anchor */}
      <div id="recaptcha-container" />

      {/* Logo */}
      <Link href="/" className="mb-10 block">
        <div className="relative h-14 w-44">
          <Image
            src="/images/logo.png"
            alt="Body Pharm Labs"
            fill
            className="object-contain"
          />
        </div>
      </Link>

      {/* Card */}
      <div className="w-full max-w-sm bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <AnimatePresence mode="wait">
          {/* ── Main: choose method ── */}
          {step === "main" && (
            <motion.div
              key="main"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="p-8"
            >
              <h1 className="text-lg font-bold tracking-tight text-black mb-1">
                Sign in
              </h1>
              <p className="text-sm text-gray-400 mb-8">
                Access your account to manage orders and research.
              </p>

              {/* Google */}
              <button
                onClick={handleGoogle}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-200 rounded-lg text-sm font-medium text-black hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <GoogleIcon />
                Continue with Google
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs text-gray-400 uppercase tracking-widest">
                  or
                </span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              {/* Phone */}
              <button
                onClick={() => setStep("phone-input")}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Phone className="w-4 h-4" />
                Continue with Phone
              </button>

              {/* Error */}
              {error && (
                <div className="mt-5 flex items-start gap-2 text-red-500 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
            </motion.div>
          )}

          {/* ── Phone input ── */}
          {step === "phone-input" && (
            <motion.div
              key="phone-input"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="p-8"
            >
              <button
                onClick={resetToMain}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-black transition-colors mb-6"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Back
              </button>

              <h1 className="text-lg font-bold tracking-tight text-black mb-1">
                Enter your number
              </h1>
              <p className="text-sm text-gray-400 mb-8">
                We'll send a one-time code to verify your identity.
              </p>

              <form onSubmit={handleSendOTP} className="space-y-4">
                <div className="flex gap-2">
                  {/* Country code selector */}
                  <div className="relative">
                    <select
                      value={countryCode.code}
                      onChange={(e) =>
                        setCountryCode(
                          COUNTRY_CODES.find((c) => c.code === e.target.value),
                        )
                      }
                      className="appearance-none h-full pl-3 pr-8 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-black transition-colors cursor-pointer"
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

                  {/* Phone number */}
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) =>
                      setPhoneNumber(e.target.value.replace(/\D/g, ""))
                    }
                    placeholder="81 234 5678"
                    required
                    autoFocus
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black transition-colors placeholder:text-gray-300"
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
                  className="w-full py-3 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {loading ? "Sending…" : "Send Code"}
                </button>
              </form>
            </motion.div>
          )}

          {/* ── OTP verification ── */}
          {step === "otp" && (
            <motion.div
              key="otp"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="p-8"
            >
              <button
                onClick={() => {
                  setStep("phone-input");
                  setOtp(["", "", "", "", "", ""]);
                  setError("");
                }}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-black transition-colors mb-6"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Back
              </button>

              <h1 className="text-lg font-bold tracking-tight text-black mb-1">
                Enter the code
              </h1>
              <p className="text-sm text-gray-400 mb-8">
                Sent to {countryCode.code} {phoneNumber}
              </p>

              <form onSubmit={handleVerifyOTP} className="space-y-6">
                {/* 6-digit OTP boxes */}
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
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className="w-11 h-12 text-center text-lg font-bold border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors"
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
                  className="w-full py-3 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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

      <p className="mt-8 text-xs text-gray-400 text-center max-w-xs">
        By continuing, you agree to our{" "}
        <Link
          href="/terms"
          className="text-black hover:opacity-60 transition-opacity"
        >
          Terms
        </Link>{" "}
        and{" "}
        <Link
          href="/privacy"
          className="text-black hover:opacity-60 transition-opacity"
        >
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}
