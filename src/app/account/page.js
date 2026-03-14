"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Package, Mail, User, LogOut, ShieldCheck, Clock } from "lucide-react";

import { useAuthStore } from "@/lib/stores/auth-store";
import { logout } from "@/lib/firebase/auth";
import Breadcrumb from "@/components/ui/Breadcrumb";

export default function AccountPage() {
  const router = useRouter();
  const { user, isAuthenticated, getDisplayName, authLoading } = useAuthStore();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, authLoading, router]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  if (authLoading || !isAuthenticated) return null;

  const displayName = getDisplayName();
  const initials = displayName?.slice(0, 2).toUpperCase() || "U";
  const memberSince = user?.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <main>
      <Breadcrumb />

      <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12 pt-12 pb-20">
        {/* Page heading */}
        <div className="mb-10">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-gray-400 mb-2">
            Your Account
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-black">
            Welcome back{displayName ? `, ${displayName.split(" ")[0]}` : ""}
          </h1>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Left — Profile card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:col-span-1"
          >
            <div className="bg-gray-50 border border-gray-200 rounded p-6 space-y-5">
              {/* Avatar */}
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center text-xl font-bold tracking-wide">
                  {initials}
                </div>
                <div>
                  <p className="font-semibold text-black">{displayName}</p>
                  {user?.email && (
                    <p className="text-xs text-gray-400 mt-0.5 break-all">
                      {user.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-200" />

              {/* Meta */}
              <div className="space-y-3 text-sm">
                {user?.email && (
                  <div className="flex items-center gap-2.5 text-gray-600">
                    <Mail className="w-4 h-4 shrink-0 text-gray-400" />
                    <span className="truncate">{user.email}</span>
                  </div>
                )}
                {memberSince && (
                  <div className="flex items-center gap-2.5 text-gray-600">
                    <Clock className="w-4 h-4 shrink-0 text-gray-400" />
                    <span>Member since {memberSince}</span>
                  </div>
                )}
                <div className="flex items-center gap-2.5 text-gray-600">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-gray-400" />
                  <span>Verified account</span>
                </div>
              </div>

              <div className="border-t border-gray-200" />

              {/* Sign out */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 h-9 rounded border border-gray-200 text-sm text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </motion.div>

          {/* Right — Orders */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-2 space-y-4"
          >
            {/* Section header */}
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold tracking-[0.15em] uppercase text-black">
                Order History
              </h2>
            </div>

            {/* Empty state */}
            <div className="border border-gray-200 rounded bg-gray-50 py-16 flex flex-col items-center justify-center text-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center">
                <Package className="w-5 h-5 text-gray-400" />
              </div>
              <div>
                <p className="font-semibold text-black text-sm">
                  No orders yet
                </p>
                <p className="text-gray-400 text-xs mt-1 max-w-xs">
                  When you place your first order it will appear here.
                </p>
              </div>
              <a
                href="/shop"
                className="inline-flex items-center h-9 px-5 rounded bg-black text-white text-xs font-medium tracking-widest uppercase hover:bg-gray-800 transition-colors"
              >
                Shop Now
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
