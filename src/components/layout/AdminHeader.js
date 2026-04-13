"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { LogOut, ArrowLeft } from "lucide-react";

export default function AdminHeader({ backHref = null }) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSignOut = async () => {
    setShowConfirm(false);
    await signOut(auth);
    router.replace("/admin");
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-4 md:px-8 lg:px-12 h-20 md:h-24 flex items-center justify-between">
        {/* Left — logo (+ back arrow on sub-pages) */}
        <div className="flex items-center gap-3">
          {backHref && (
            <Link href={backHref} className="p-1 rounded hover:bg-gray-100 transition-colors inline-flex shrink-0">
              <ArrowLeft className="w-4 h-4 text-gray-400" />
            </Link>
          )}
          <div className="relative w-14 h-14 sm:w-16 sm:h-16">
            <Image
              src="/images/logomark.png"
              alt="Body Pharm Labs"
              fill
              priority
              className="object-contain"
              sizes="48px"
            />
          </div>
        </div>

        {/* Right — label + sign out */}
        <div className="flex items-center gap-4">
          <span className="text-xs font-semibold text-gray-400 tracking-wide uppercase hidden sm:block">
            Admin Dashboard
          </span>
          <button
            onClick={() => setShowConfirm(true)}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </header>

      {/* Sign-out confirm dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-6 sm:pb-0">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowConfirm(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <div>
              <p className="text-sm font-semibold text-gray-900">Sign out?</p>
              <p className="text-xs text-gray-500 mt-1">You will be returned to the admin login screen.</p>
            </div>
            <div className="flex gap-2 justify-end pt-1">
              <button
                onClick={() => setShowConfirm(false)}
                className="h-10 px-5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSignOut}
                className="h-10 px-5 rounded-lg bg-black text-white text-sm font-semibold hover:bg-gray-800 transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
