"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuthStore } from "@/lib/stores/auth-store";
import { isAdmin } from "@/lib/utils/admin";
import { adminGetAllOrders } from "@/lib/firebase/firestore";
import AdminHeader from "@/components/layout/AdminHeader";
import CustomDatePicker from "@/components/ui/CustomDatePicker";
import { ArrowLeft } from "lucide-react";

const currencyFmt = new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" });

function orderDate(order) {
  const ts = order.createdAt;
  if (!ts) return null;
  return ts.toDate ? ts.toDate() : new Date(ts);
}

export default function MarketingPage() {
  const router = useRouter();
  const { user, loading } = useAuthStore();

  const [orders, setOrders] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    if (!loading && !isAdmin(user?.uid)) router.replace("/admin");
  }, [user, loading, router]);

  useEffect(() => {
    if (loading || !isAdmin(user?.uid)) return;
    adminGetAllOrders().then(({ orders }) => {
      setOrders(orders);
      setFetching(false);
    });
  }, [user, loading]);

  const filteredOrders = useMemo(() => {
    if (!fromDate && !toDate) return orders;
    const from = fromDate ? new Date(fromDate + "T00:00:00") : null;
    const to = toDate ? new Date(toDate + "T23:59:59") : null;
    return orders.filter((o) => {
      const d = orderDate(o);
      if (!d) return false;
      if (from && d < from) return false;
      if (to && d > to) return false;
      return true;
    });
  }, [orders, fromDate, toDate]);

  const bySource = useMemo(() => {
    const map = new Map();
    for (const o of filteredOrders) {
      const source = o.utm?.source || "Direct/Unknown";
      if (!map.has(source)) map.set(source, { orders: 0, paidOrders: 0, revenue: 0, campaigns: new Map() });
      const bucket = map.get(source);
      bucket.orders += 1;
      if (o.paymentStatus === "paid") {
        bucket.paidOrders += 1;
        bucket.revenue += o.total || 0;
      }
      const campaign = o.utm?.campaign || "—";
      bucket.campaigns.set(campaign, (bucket.campaigns.get(campaign) || 0) + 1);
    }
    return Array.from(map.entries())
      .map(([source, data]) => ({ source, ...data }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [filteredOrders]);

  if (loading || (!loading && !isAdmin(user?.uid))) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard" className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-sm font-semibold text-gray-900">Marketing — UTM Tracking</h1>
          </div>
        </motion.div>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-40">
            <CustomDatePicker value={fromDate} onChange={setFromDate} placeholder="From" />
          </div>
          <div className="w-40">
            <CustomDatePicker value={toDate} onChange={setToDate} placeholder="To" />
          </div>
          {(fromDate || toDate) && (
            <button
              onClick={() => { setFromDate(""); setToDate(""); }}
              className="text-xs text-gray-400 hover:text-gray-700 underline transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.08 }}
          className="bg-white rounded-xl border border-gray-200 overflow-hidden"
        >
          {fetching ? (
            <div className="py-16 text-center text-sm text-gray-400">Loading…</div>
          ) : bySource.length === 0 ? (
            <div className="py-16 text-center text-sm text-gray-400">No orders in this range.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Source", "Top Campaign", "Orders", "Paid", "Revenue"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {bySource.map((row) => {
                  const topCampaign = Array.from(row.campaigns.entries()).sort((a, b) => b[1] - a[1])[0];
                  return (
                    <tr key={row.source} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4 font-semibold text-gray-900 capitalize">{row.source}</td>
                      <td className="px-5 py-4 text-gray-500">{topCampaign && topCampaign[0] !== "—" ? topCampaign[0] : "—"}</td>
                      <td className="px-5 py-4 text-gray-500">{row.orders}</td>
                      <td className="px-5 py-4 text-gray-500">{row.paidOrders}</td>
                      <td className="px-5 py-4 font-semibold text-gray-900">{currencyFmt.format(row.revenue)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </motion.div>
      </div>
    </div>
  );
}
