"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from "@firebase/auth";
import { auth } from "@/lib/firebase/config";
import { useAuthStore } from "@/lib/stores/auth-store";
import { getAffiliateByUid } from "@/lib/firebase/firestore";
import Image from "next/image";

export default function AffiliateLoginPage() {
  const router = useRouter();
  const { user, authLoading } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Already logged in as an active affiliate — go straight to the dashboard
  useEffect(() => {
    if (authLoading || !user?.uid) return;
    getAffiliateByUid(user.uid).then(({ affiliate }) => {
      if (affiliate?.active) router.replace("/affiliate/dashboard");
    });
  }, [user, authLoading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setSubmitting(true);

    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const { affiliate } = await getAffiliateByUid(cred.user.uid);
      if (!affiliate?.active) {
        await signOut(auth);
        setError("Access denied.");
        setSubmitting(false);
        return;
      }
      router.replace("/affiliate/dashboard");
    } catch {
      setError("Invalid credentials.");
      setSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    setError("");
    setInfo("");
    if (!email.trim()) {
      setError("Enter your email above first, then click 'Forgot password?'");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setInfo("If that email has an account, a reset link has been sent.");
    } catch {
      setInfo("If that email has an account, a reset link has been sent.");
    }
  };

  if (authLoading) return null;

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Image
            src="/images/logomark.png"
            alt="Body Pharm Labs"
            width={140}
            height={50}
            className="object-contain mx-auto mb-3"
          />
          <h1 className="text-2xl font-bold text-gray-900">Affiliate Login</h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm space-y-4"
        >
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm text-gray-900 focus:outline-none focus:border-gray-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm text-gray-900 focus:outline-none focus:border-gray-400"
            />
          </div>

          {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
          {info && <p className="text-xs text-green-600 font-medium">{info}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full h-10 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            {submitting ? "Signing in…" : "Sign In"}
          </button>

          <button
            type="button"
            onClick={handleForgotPassword}
            className="w-full text-center text-xs text-gray-400 hover:text-gray-700 transition-colors"
          >
            Forgot password?
          </button>
        </form>
      </div>
    </main>
  );
}
