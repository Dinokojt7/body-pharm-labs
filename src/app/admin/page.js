"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { useAuthStore } from "@/lib/stores/auth-store";
import Image from "next/image";

const ADMIN_UID = process.env.NEXT_PUBLIC_ADMIN_UID;

export default function AdminLoginPage() {
  const router = useRouter();
  const { user, loading } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Already logged in as admin — go straight to dashboard
  useEffect(() => {
    if (!loading && user?.uid === ADMIN_UID) {
      router.replace("/admin/dashboard");
    }
  }, [user, loading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      if (cred.user.uid !== ADMIN_UID) {
        await signOut(auth);
        setError("Access denied.");
        setSubmitting(false);
        return;
      }
      router.replace("/admin/dashboard");
    } catch {
      setError("Invalid credentials.");
      setSubmitting(false);
    }
  };

  if (loading) return null;

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
          <h1 className="text-2xl font-bold text-gray-900">Admin</h1>
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

          {error && (
            <p className="text-xs text-red-500 font-medium">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full h-10 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            {submitting ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </main>
  );
}
