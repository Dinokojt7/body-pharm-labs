"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signOut } from "@firebase/auth";
import { auth } from "@/lib/firebase/config";
import { LogOut } from "lucide-react";

export default function AffiliateHeader() {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSignOut = async () => {
    setShowConfirm(false);
    await signOut(auth);
    router.replace("/affiliate/login");
  };

  return (
    <>
      <header
        className="relative overflow-hidden border-b border-gray-200 px-4 md:px-8 lg:px-12 h-20 md:h-24 flex items-center justify-between"
        style={{
          backgroundImage: "url('/images/new-hero.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Overlay for contrast — solid over the logo (which isn't a transparent PNG),
            fading out toward the right so the hero image shows through near the sign-out button */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to right, rgba(255,255,255,1) 0%, rgba(255,255,255,1) 28%, rgba(255,255,255,0) 85%)",
          }}
        />

        <div className="relative z-10 w-40 h-12 sm:w-52 sm:h-14 md:w-64 md:h-18">
          <Image
            src="/images/logo-header.png"
            alt="Body Pharm Labs"
            fill
            priority
            className="object-contain object-left"
            sizes="(max-width: 768px) 288px, (max-width: 1024px) 384px, 448px"
          />
        </div>

        <div className="relative z-10 flex items-center gap-4">
          <button
            onClick={() => setShowConfirm(true)}
            className="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-red-500/10 backdrop-blur-md border border-red-400/50 hover:bg-red-500/20 text-xs font-medium text-red-600 hover:text-red-700 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </header>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-6 sm:pb-0">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowConfirm(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <div>
              <p className="text-sm font-semibold text-gray-900">Sign out?</p>
              <p className="text-xs text-gray-500 mt-1">You will be returned to the affiliate login screen.</p>
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
