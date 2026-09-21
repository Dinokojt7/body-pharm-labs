"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Package, ShoppingBag, Tag, Layers, Users, TrendingUp, IdCard, Mail, Info } from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin/dashboard/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/dashboard/store", label: "Store", icon: Package },
  { href: "/admin/dashboard/discounts", label: "Discounts", icon: Tag },
  { href: "/admin/dashboard/categories", label: "Categories", icon: Layers },
  { href: "/admin/dashboard/affiliates", label: "Affiliates", icon: Users },
  { href: "/admin/dashboard/members", label: "Members", icon: IdCard },
  { href: "/admin/dashboard/marketing", label: "Marketing", icon: TrendingUp },
  { href: "/admin/dashboard/campaigns", label: "Campaigns", icon: Mail },
];

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
            className="absolute bottom-full left-0 mb-2 z-50 w-64 bg-white border border-gray-100 rounded-xl shadow-lg px-4 py-3.5 pointer-events-none"
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

export default function AdminSidebar({ maintenance, toggling, onToggleClick, onNavigate }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full">
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname?.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-3 h-10 rounded-lg text-sm font-medium transition-colors ${
                active ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Maintenance toggle — pinned at the bottom, shared state passed in as
          props so desktop and mobile-drawer instances never desync */}
      <div className="p-3 border-t border-gray-200">
        <div className="flex items-center gap-2.5 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-3">
          <span className="text-xs font-semibold text-gray-700 flex-1">Maintenance</span>
          <Tooltip text="When switched on, visitors see a maintenance page with a WhatsApp contact button. Use during inventory updates, image uploads, holiday closures, or any planned downtime. Toggle off when the store is ready." />
          <button
            onClick={() => !toggling && onToggleClick()}
            disabled={toggling}
            className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none ${
              maintenance ? "bg-black" : "bg-gray-200"
            } ${toggling ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 shrink-0 transform rounded-full bg-white shadow transition-transform duration-200 ${
                maintenance ? "translate-x-[18px]" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
