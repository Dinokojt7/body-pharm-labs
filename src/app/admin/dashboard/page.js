"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useAuthStore } from "@/lib/stores/auth-store";
import { isAdmin } from "@/lib/utils/admin";
import { Package, ShoppingBag, Tag, Layers, Info, Users, TrendingUp, IdCard } from "lucide-react";
import AdminHeader from "@/components/layout/AdminHeader";
import { getMaintenanceMode, setMaintenanceMode, adminGetAffiliates, adminGetMembers } from "@/lib/firebase/firestore";

// ── Tooltip — matches discounts page exactly ──────────────────────────────────
function Tooltip({ text }) {
  const [show, setShow] = useState(false);
  return (
    <span className="relative inline-flex items-center" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      <span className="w-3.5 h-3.5 rounded-full border border-gray-300 text-gray-400 flex items-center justify-center cursor-default select-none">
        <Info className="w-2 h-2" strokeWidth={2.5} />
      </span>
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-0 mb-2 z-50 w-72 bg-white border border-gray-100 rounded-xl shadow-lg px-4 py-3.5 pointer-events-none"
          >
            <p className="text-xs text-gray-600 leading-relaxed">{text}</p>
            <span className="absolute top-full left-4 -mt-px border-4 border-transparent border-t-white" />
            <span className="absolute top-full left-4 border-4 border-transparent border-t-gray-100" style={{ marginTop: "1px" }} />
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}

// ── Confirm modal ─────────────────────────────────────────────────────────────
function ConfirmModal({ turningOn, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.18 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-xl px-8 py-7 w-full max-w-sm mx-4"
      >
        <h3 className="text-base font-bold text-gray-900 mb-2">
          {turningOn ? "Enable maintenance mode?" : "Disable maintenance mode?"}
        </h3>
        <p className="text-sm text-gray-500 leading-relaxed mb-6">
          {turningOn
            ? "Visitors will immediately see the maintenance page and won't be able to browse or checkout until you turn this off."
            : "The store will go live immediately. Make sure products and images are ready before continuing."}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 h-10 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 h-10 rounded-lg text-sm font-semibold text-white transition-colors ${
              turningOn ? "bg-red-500 hover:bg-red-600" : "bg-gray-900 hover:bg-gray-700"
            }`}
          >
            {turningOn ? "Enable" : "Disable"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const router = useRouter();
  const { user, loading } = useAuthStore();

  const [maintenance, setMaintenance] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [affiliateCount, setAffiliateCount] = useState(null);
  const [memberCount, setMemberCount] = useState(null);

  useEffect(() => {
    if (!loading && !isAdmin(user?.uid)) router.replace("/admin");
  }, [user, loading, router]);

  useEffect(() => {
    if (!isAdmin(user?.uid)) return;
    getMaintenanceMode().then(setMaintenance);
    adminGetAffiliates().then(({ affiliates }) => setAffiliateCount(affiliates.length));
    adminGetMembers().then(({ members }) => setMemberCount(members.length));
  }, [user]);

  const handleConfirm = async () => {
    setConfirm(false);
    setToggling(true);
    const next = !maintenance;
    await setMaintenanceMode(next);
    setMaintenance(next);
    setToggling(false);
  };

  if (loading || (!loading && !isAdmin(user?.uid))) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />

      {/* Confirm modal — fixed overlay, outside the layout flow */}
      <AnimatePresence>
        {confirm && (
          <ConfirmModal
            turningOn={!maintenance}
            onConfirm={handleConfirm}
            onCancel={() => setConfirm(false)}
          />
        )}
      </AnimatePresence>

      {/* Sticky sub-header — page label. Pinned right below AdminHeader (top
          offset matches its height exactly) so only the tiles below scroll
          underneath it. */}
      <div className="sticky top-20 md:top-24 z-20 bg-gray-50 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 h-14 flex items-center">
          <h1 className="text-sm font-semibold text-gray-700 inline-flex items-center">
            Admin Dashboard
          </h1>
        </div>
      </div>

      {/* Maintenance toggle — floating widget, bottom-right, fixed dimensions
          so it never shifts as its own label/state change */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-5 py-3.5 shadow-lg">
        <span className="text-sm font-semibold text-gray-700 hidden sm:inline">Maintenance Mode</span>

        <Tooltip text="When switched on, visitors see a maintenance page with a WhatsApp contact button. Use during inventory updates, image uploads, holiday closures, or any planned downtime. Toggle off when the store is ready." />

        {/* Toggle switch */}
        <button
          onClick={() => !toggling && setConfirm(true)}
          disabled={toggling}
          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none ${
            maintenance ? "bg-black" : "bg-gray-200"
          } ${toggling ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
        >
          <span
            className={`inline-block h-4 w-4 shrink-0 transform rounded-full bg-white shadow transition-transform duration-200 ${
              maintenance ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>

        {/* Fixed-width status label so it never shifts the container */}
        <span className={`text-xs font-semibold w-10 ${maintenance ? "text-red-500" : "text-gray-400"}`}>
          {toggling ? "…" : maintenance ? "ON" : "OFF"}
        </span>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Nav cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
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

          <Link
            href="/admin/dashboard/categories"
            className="group bg-white rounded-xl border border-gray-200 p-10 text-center shadow-sm hover:shadow-md hover:border-gray-300 transition-all"
          >
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gray-100 mb-5 group-hover:bg-gray-200 transition-colors">
              <Layers className="w-6 h-6 text-gray-600" />
            </div>
            <h2 className="text-base font-bold text-gray-900 mb-1">Categories</h2>
            <p className="text-xs text-gray-400">Manage product categories</p>
          </Link>

          <Link
            href="/admin/dashboard/affiliates"
            className="group bg-white rounded-xl border border-gray-200 p-10 text-center shadow-sm hover:shadow-md hover:border-gray-300 transition-all"
          >
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gray-100 mb-5 group-hover:bg-gray-200 transition-colors">
              <Users className="w-6 h-6 text-gray-600" />
            </div>
            <h2 className="text-base font-bold text-gray-900 mb-1">Affiliates</h2>
            <p className="text-xs text-gray-400">
              {affiliateCount === null ? "Track affiliate sales" : `${affiliateCount} affiliate${affiliateCount === 1 ? "" : "s"}`}
            </p>
          </Link>

          <Link
            href="/admin/dashboard/members"
            className="group bg-white rounded-xl border border-gray-200 p-10 text-center shadow-sm hover:shadow-md hover:border-gray-300 transition-all"
          >
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gray-100 mb-5 group-hover:bg-gray-200 transition-colors">
              <IdCard className="w-6 h-6 text-gray-600" />
            </div>
            <h2 className="text-base font-bold text-gray-900 mb-1">Members</h2>
            <p className="text-xs text-gray-400">
              {memberCount === null ? "10% lifetime members" : `${memberCount} member${memberCount === 1 ? "" : "s"}`}
            </p>
          </Link>

          <Link
            href="/admin/dashboard/marketing"
            className="group bg-white rounded-xl border border-gray-200 p-10 text-center shadow-sm hover:shadow-md hover:border-gray-300 transition-all"
          >
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gray-100 mb-5 group-hover:bg-gray-200 transition-colors">
              <TrendingUp className="w-6 h-6 text-gray-600" />
            </div>
            <h2 className="text-base font-bold text-gray-900 mb-1">Marketing</h2>
            <p className="text-xs text-gray-400">UTM source &amp; campaign performance</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
