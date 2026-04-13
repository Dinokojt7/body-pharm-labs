"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { useAuthStore } from "@/lib/stores/auth-store";
import { Package, ShoppingBag, LogOut } from "lucide-react";

const ADMIN_UID = process.env.NEXT_PUBLIC_ADMIN_UID;

export default function AdminDashboard() {
  const router = useRouter();
  const { user, loading } = useAuthStore();

  useEffect(() => {
    if (!loading && user?.uid !== ADMIN_UID) {
      router.replace("/admin");
    }
  }, [user, loading, router]);

  const handleSignOut = async () => {
    await signOut(auth);
    router.replace("/admin");
  };

  if (loading || (!loading && user?.uid !== ADMIN_UID)) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Package className="w-5 h-5 text-gray-400" />
          <span className="font-semibold text-gray-900 text-sm">Body Pharm Labs Admin</span>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </header>

      <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-65px)] px-4">
        <div className="grid sm:grid-cols-2 gap-6 w-full max-w-2xl">
          <Link
            href="/admin/dashboard/store"
            className="group bg-white rounded-xl border border-gray-200 p-10 text-center shadow-sm hover:shadow-md hover:border-gray-300 transition-all"
          >
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gray-100 mb-5 group-hover:bg-gray-200 transition-colors">
              <Package className="w-6 h-6 text-gray-600" />
            </div>
            <h2 className="text-base font-bold text-gray-900 mb-1">Manage Store</h2>
            <p className="text-xs text-gray-400">Products, inventory &amp; listings</p>
          </Link>

          <Link
            href="/admin/dashboard/orders"
            className="group bg-white rounded-xl border border-gray-200 p-10 text-center shadow-sm hover:shadow-md hover:border-gray-300 transition-all"
          >
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gray-100 mb-5 group-hover:bg-gray-200 transition-colors">
              <ShoppingBag className="w-6 h-6 text-gray-600" />
            </div>
            <h2 className="text-base font-bold text-gray-900 mb-1">Manage Orders</h2>
            <p className="text-xs text-gray-400">View, update &amp; fulfil orders</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
