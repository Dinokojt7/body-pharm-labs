"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/auth-store";
import { getAffiliateByUid, getOrdersByDiscountCode } from "@/lib/firebase/firestore";
import AffiliateHeader from "@/components/affiliate/AffiliateHeader";

const currencyFmt = new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" });

function formatDate(ts) {
  if (!ts) return "—";
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  return date.toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" });
}

export default function AffiliateDashboard() {
  const router = useRouter();
  const { user, authLoading } = useAuthStore();

  const [affiliate, setAffiliate] = useState(null);
  const [orders, setOrders] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user?.uid) {
      router.replace("/affiliate/login");
      return;
    }

    (async () => {
      const { affiliate: aff } = await getAffiliateByUid(user.uid);
      if (!aff?.active) {
        setDenied(true);
        setFetching(false);
        return;
      }
      setAffiliate(aff);

      const { orders: ordersForCode } = await getOrdersByDiscountCode(aff.discountCode);
      setOrders(ordersForCode);
      setFetching(false);
    })();
  }, [user, authLoading, router]);

  useEffect(() => {
    if (denied) router.replace("/affiliate/login");
  }, [denied, router]);

  if (authLoading || fetching || denied || !affiliate) return null;

  const paidOrders = orders.filter((o) => o.paymentStatus === "paid");
  const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.total || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <AffiliateHeader />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-sm font-semibold text-gray-900">Welcome, {affiliate.name}</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Your code: <span className="font-mono font-semibold text-gray-600">{affiliate.discountCode}</span>
          </p>
        </div>

        {/* Stat cards */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Paid Orders</p>
            <p className="text-2xl font-bold text-gray-900">{paidOrders.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Total Revenue</p>
            <p className="text-2xl font-bold text-gray-900">{currencyFmt.format(totalRevenue)}</p>
          </div>
        </div>

        {/* Orders table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {orders.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm text-gray-400">No sales with your code yet.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Order", "Date", "Amount", "Status"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td className="px-5 py-4 font-mono font-semibold text-gray-900">{o.orderNumber || o.id.slice(0, 8).toUpperCase()}</td>
                    <td className="px-5 py-4 text-gray-500">{formatDate(o.createdAt)}</td>
                    <td className="px-5 py-4 text-gray-700">{currencyFmt.format(o.total || 0)}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        o.paymentStatus === "paid" ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"
                      }`}>
                        {o.paymentStatus === "paid" ? "Paid" : o.paymentStatus || "Unpaid"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
