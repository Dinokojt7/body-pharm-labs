"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth-store";
import { isAdmin } from "@/lib/utils/admin";
import { getMaintenanceMode, setMaintenanceMode } from "@/lib/firebase/firestore";
import AdminHeader from "@/components/layout/AdminHeader";
import AdminSidebar from "@/components/layout/AdminSidebar";

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

export default function AdminDashboardLayout({ children }) {
  const router = useRouter();
  const { user, loading } = useAuthStore();

  const [maintenance, setMaintenance] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !isAdmin(user?.uid)) router.replace("/admin");
  }, [user, loading, router]);

  useEffect(() => {
    if (!isAdmin(user?.uid)) return;
    getMaintenanceMode().then(setMaintenance);
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

  const sidebarProps = {
    maintenance,
    toggling,
    onToggleClick: () => setConfirm(true),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader onMenuClick={() => setSidebarOpen(true)} />

      <AnimatePresence>
        {confirm && (
          <ConfirmModal
            turningOn={!maintenance}
            onConfirm={handleConfirm}
            onCancel={() => setConfirm(false)}
          />
        )}
      </AnimatePresence>

      <div className="flex items-start">
        {/* Desktop sidebar — sticky, own scroll, never a page-level overflow container */}
        <aside className="hidden md:block w-60 shrink-0 sticky top-20 md:top-24 self-start h-[calc(100vh-5rem)] md:h-[calc(100vh-6rem)] border-r border-gray-200 bg-white">
          <AdminSidebar {...sidebarProps} />
        </aside>

        {/* Mobile drawer */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-black/40 md:hidden"
                onClick={() => setSidebarOpen(false)}
              />
              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "tween", duration: 0.22 }}
                className="fixed left-0 top-0 h-full w-72 z-50 bg-white shadow-xl md:hidden"
              >
                <div className="flex items-center justify-between px-4 h-16 border-b border-gray-200">
                  <span className="text-sm font-semibold text-gray-900">Menu</span>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="h-[calc(100%-4rem)]">
                  <AdminSidebar {...sidebarProps} onNavigate={() => setSidebarOpen(false)} />
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
