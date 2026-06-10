"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/lib/stores/auth-store";
import { Package, ShoppingBag, Tag, Info } from "lucide-react";
import AdminHeader from "@/components/layout/AdminHeader";
import { getMaintenanceMode, setMaintenanceMode } from "@/lib/firebase/firestore";

const ADMIN_UID = process.env.NEXT_PUBLIC_ADMIN_UID;

export default function AdminDashboard() {
  const router = useRouter();
  const { user, loading } = useAuthStore();

  const [maintenance, setMaintenance] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [tooltip, setTooltip] = useState(false);
  const tooltipRef = useRef(null);

  useEffect(() => {
    if (!loading && user?.uid !== ADMIN_UID) {
      router.replace("/admin");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.uid === ADMIN_UID) {
      getMaintenanceMode().then(setMaintenance);
    }
  }, [user]);

  const handleToggle = async () => {
    setToggling(true);
    const next = !maintenance;
    await setMaintenanceMode(next);
    setMaintenance(next);
    setToggling(false);
  };

  if (loading || (!loading && user?.uid !== ADMIN_UID)) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />

      <div className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-65px)] px-4 gap-10">
        {/* Nav cards */}
        <div className="grid sm:grid-cols-3 gap-6 w-full max-w-3xl">
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

          <Link
            href="/admin/dashboard/discounts"
            className="group bg-white rounded-xl border border-gray-200 p-10 text-center shadow-sm hover:shadow-md hover:border-gray-300 transition-all"
          >
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gray-100 mb-5 group-hover:bg-gray-200 transition-colors">
              <Tag className="w-6 h-6 text-gray-600" />
            </div>
            <h2 className="text-base font-bold text-gray-900 mb-1">Discounts</h2>
            <p className="text-xs text-gray-400">Create &amp; manage promo codes</p>
          </Link>
        </div>

        {/* Maintenance toggle */}
        <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-5 py-3.5 shadow-sm">
          <span className="text-sm font-semibold text-gray-700">Maintenance Mode</span>

          {/* Info icon + tooltip */}
          <div className="relative" ref={tooltipRef}>
            <button
              onMouseEnter={() => setTooltip(true)}
              onMouseLeave={() => setTooltip(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              tabIndex={-1}
            >
              <Info className="w-4 h-4" />
            </button>
            {tooltip && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-gray-900 text-white text-xs rounded-lg px-3 py-2.5 leading-relaxed shadow-lg pointer-events-none z-50">
                When switched on, visitors see a maintenance page with a WhatsApp contact button. Use during inventory updates, image uploads, holiday closures, or any planned downtime. Toggle off when the store is ready.
                <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
              </div>
            )}
          </div>

          {/* Toggle switch */}
          <button
            onClick={handleToggle}
            disabled={toggling}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
              maintenance ? "bg-black" : "bg-gray-200"
            } ${toggling ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
                maintenance ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>

          <span className={`text-xs font-semibold ${maintenance ? "text-red-500" : "text-gray-400"}`}>
            {toggling ? "Saving…" : maintenance ? "ON" : "OFF"}
          </span>
        </div>
      </div>
    </div>
  );
}
