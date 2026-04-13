"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/lib/stores/auth-store";
import { Package, ShoppingBag } from "lucide-react";
import AdminHeader from "@/components/layout/AdminHeader";

const ADMIN_UID = process.env.NEXT_PUBLIC_ADMIN_UID;

export default function AdminDashboard() {
  const router = useRouter();
  const { user, loading } = useAuthStore();

  useEffect(() => {
    if (!loading && user?.uid !== ADMIN_UID) {
      router.replace("/admin");
    }
  }, [user, loading, router]);

  if (loading || (!loading && user?.uid !== ADMIN_UID)) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />

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
