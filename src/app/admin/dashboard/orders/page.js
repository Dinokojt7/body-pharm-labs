"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/lib/stores/auth-store";
import { adminSubscribeToAllOrders, updateOrderStatus, deleteOrder } from "@/lib/firebase/firestore";
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Trash2, AlertTriangle, Printer, FileText } from "lucide-react";
import AdminHeader from "@/components/layout/AdminHeader";
import CustomSelect from "@/components/ui/CustomSelect";

const ADMIN_UIDS = [process.env.NEXT_PUBLIC_ADMIN_UID, process.env.NEXT_PUBLIC_CO_ADMIN_UID].filter(Boolean);
const PAGE_SIZE = 20;

const FULFILLMENT_STATUSES = [
  { value: "pending",          label: "Pending",           color: "bg-yellow-50 text-yellow-700" },
  { value: "processing",       label: "Processing",        color: "bg-blue-50 text-blue-700" },
  { value: "shipped",          label: "Shipped",           color: "bg-indigo-50 text-indigo-700" },
  { value: "out_for_delivery", label: "Out for Delivery",  color: "bg-purple-50 text-purple-700" },
  { value: "delivered",        label: "Delivered",         color: "bg-green-50 text-green-700" },
  { value: "on_hold",          label: "On Hold",           color: "bg-orange-50 text-orange-700" },
  { value: "cancelled",        label: "Cancelled",         color: "bg-red-50 text-red-700" },
  { value: "returned",         label: "Returned",          color: "bg-gray-100 text-gray-600" },
];

function StatusBadge({ status }) {
  const match = FULFILLMENT_STATUSES.find((s) => s.value === status);
  const color = match?.color || "bg-gray-100 text-gray-600";
  const label = match?.label || status || "—";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${color}`}>
      {label}
    </span>
  );
}

function formatDate(ts) {
  if (!ts) return "—";
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  return date.toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" });
}

function formatCurrency(amount, currency = "ZAR") {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency }).format(amount ?? 0);
}

function displayAmount(amount, order) {
  const rate = order?.exchangeRate || 1;
  const currency = order?.currency || "ZAR";
  return formatCurrency((amount ?? 0) * rate, currency);
}

export default function AdminOrders() {
  const router = useRouter();
  const { user, loading } = useAuthStore();

  const [orders, setOrders] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [confirmOrder, setConfirmOrder] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [page, setPage] = useState(1);
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (!loading && !ADMIN_UIDS.includes(user?.uid)) router.replace("/admin");
  }, [user, loading, router]);

  useEffect(() => {
    if (loading || !ADMIN_UIDS.includes(user?.uid)) return;
    setFetching(true);
    const unsubscribe = adminSubscribeToAllOrders(({ orders }) => {
      setOrders(orders);
      setFetching(false);
      setPage(1);
    });
    return unsubscribe;
  }, [user, loading]);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    await updateOrderStatus(orderId, newStatus);
    // Realtime subscription will push the update — no manual state patch needed
    setUpdatingId(null);
  };

  const handleDeleteConfirmed = async () => {
    const order = confirmOrder;
    setConfirmOrder(null);
    setDeletingId(order.id);
    await deleteOrder(order.id);
    // Realtime subscription will drop it from orders automatically
    setDeletingId(null);
  };

  const filteredOrders = orders
    .filter((o) => paymentFilter === "all" ? true : paymentFilter === "paid" ? o.paymentStatus === "paid" : o.paymentStatus !== "paid")
    .filter((o) => statusFilter === "all" ? true : (o.status || "pending") === statusFilter);
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const pagedOrders = filteredOrders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loading || (!loading && !ADMIN_UIDS.includes(user?.uid))) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader backHref="/admin/dashboard" />

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">Orders</h1>
          <p className="text-xs text-gray-400 mt-0.5">{orders.length} total</p>
        </div>

        {/* Filters row */}
        <div className="flex items-center gap-2 mb-5">
          {[
            { key: "all",    label: "All",    count: orders.length },
            { key: "paid",   label: "Paid",   count: orders.filter(o => o.paymentStatus === "paid").length },
            { key: "unpaid", label: "Unpaid", count: orders.filter(o => o.paymentStatus !== "paid").length },
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => { setPaymentFilter(key); setPage(1); setExpandedId(null); }}
              className={`h-8 px-4 rounded-lg text-xs font-medium transition-colors border ${
                paymentFilter === key
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {label} <span className={`ml-1 ${paymentFilter === key ? "text-white/60" : "text-gray-400"}`}>({count})</span>
            </button>
          ))}

          <div className="ml-auto w-48">
            <CustomSelect
              compact
              value={statusFilter}
              onChange={(val) => { setStatusFilter(val); setPage(1); setExpandedId(null); }}
              options={[
                { value: "all", label: "All Statuses" },
                ...FULFILLMENT_STATUSES.map(s => ({ value: s.value, label: s.label })),
              ]}
            />
          </div>
        </div>

        {fetching ? (
          <div className="text-center py-20 text-gray-400 text-sm">Loading…</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 text-gray-400 text-sm">No orders yet.</div>
        ) : (
          <div className="space-y-2">
            {pagedOrders.map((order) => {
              const isExpanded = expandedId === order.id;
              return (
                <div key={order.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  {/* Order row */}
                  <div className="px-5 py-4 flex flex-wrap items-center gap-4">
                    {/* Order number + date */}
                    <div className="min-w-35">
                      <p className="text-xs font-bold text-gray-900 font-mono">{order.orderNumber || order.id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{formatDate(order.createdAt)}</p>
                    </div>

                    {/* Customer */}
                    <div className="flex-1 min-w-40">
                      <p className="text-xs font-semibold text-gray-800">
                        {order.customer?.firstName || order.firstName} {order.customer?.lastName || order.lastName}
                      </p>
                      <p className="text-[11px] text-gray-400 truncate">{order.customer?.email || order.email}</p>
                    </div>

                    {/* Items count + total */}
                    <div className="hidden sm:block min-w-20 text-right">
                      <p className="text-xs text-gray-500">{(order.items || []).length} item{order.items?.length !== 1 ? "s" : ""}</p>
                      <p className="text-xs font-bold text-gray-900 mt-0.5">{displayAmount(order.total, order)}</p>
                    </div>

                    {/* Payment status */}
                    <div className="hidden md:block">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${order.paymentStatus === "paid" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                        {order.paymentStatus === "paid" ? "Paid" : order.paymentStatus || "Unpaid"}
                      </span>
                    </div>

                    {/* Fulfillment status dropdown */}
                    <div className={updatingId === order.id ? "opacity-50 pointer-events-none" : ""}>
                      <CustomSelect
                        compact
                        value={order.status || "pending"}
                        onChange={(val) => handleStatusChange(order.id, val)}
                        options={FULFILLMENT_STATUSES.map((s) => ({ value: s.value, label: s.label }))}
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 ml-auto">
                      <button
                        onClick={() => setConfirmOrder(order)}
                        disabled={deletingId === order.id}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : order.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded detail panel */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 px-5 py-5 bg-gray-50 grid sm:grid-cols-2 gap-6">
                      {/* Items */}
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Items</p>
                        <div className="space-y-2">
                          {(order.items || []).map((item, i) => (
                            <div key={i} className="flex items-center justify-between text-xs">
                              <span className="text-gray-700 font-medium">
                                {item.name}{item.size ? ` — ${item.size}` : ""} <span className="text-gray-400">× {item.quantity}</span>
                              </span>
                              <span className="text-gray-900 font-semibold">{displayAmount(item.price * item.quantity, order)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-200 space-y-1">
                          {order.memberDiscount > 0 && (
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>Member discount</span>
                              <span>−{displayAmount(order.memberDiscount, order)}</span>
                            </div>
                          )}
                          {order.discountCode && (
                            <div className="flex justify-between text-xs text-green-600">
                              <span>Promo ({order.discountCode})</span>
                              <span>−{displayAmount(order.discountAmount || 0, order)}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Shipping</span>
                            <span>{order.shipping === 0 ? "Free" : displayAmount(order.shipping, order)}</span>
                          </div>
                          <div className="flex justify-between text-xs font-bold text-gray-900 pt-1">
                            <span>Total</span>
                            <span>{displayAmount(order.total, order)}</span>
                          </div>
                        </div>

                        {/* Receipt preview + print */}
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Receipt</p>
                            <button
                              onClick={() => window.open(`/api/invoice/${order.id}`, "_blank")}
                              className="flex items-center gap-1.5 text-[11px] font-medium text-gray-600 hover:text-black transition-colors"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              Print / Save PDF
                            </button>
                          </div>
                          <iframe
                            src={`/api/invoice/${order.id}`}
                            className="w-full rounded-lg border border-gray-200"
                            style={{ height: "420px" }}
                            title={`Receipt ${order.orderNumber}`}
                          />
                        </div>
                      </div>

                      {/* Customer + Shipping */}
                      <div className="space-y-4">
                        <div>
                          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Customer</p>
                          <p className="text-xs font-semibold text-gray-700">
                            {order.customer?.firstName || order.firstName} {order.customer?.lastName || order.lastName}
                          </p>
                          <p className="text-xs text-gray-500">{order.customer?.email || order.email}</p>
                          {(order.customer?.phone || order.phone) && (
                            <p className="text-xs text-gray-500">{order.customer?.phone || order.phone}</p>
                          )}
                        </div>

                        {order.shippingAddress && (
                          <div>
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Shipping Address</p>
                            <p className="text-xs text-gray-700 leading-relaxed">
                              {[
                                order.shippingAddress.address,
                                order.shippingAddress.city,
                                order.shippingAddress.province,
                                order.shippingAddress.postalCode,
                                order.shippingAddress.country,
                              ].filter(Boolean).join(", ")}
                            </p>
                          </div>
                        )}

                        {order.notes && (
                          <div>
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Notes</p>
                            <p className="text-xs text-gray-600 italic">{order.notes}</p>
                          </div>
                        )}

                        <div>
                          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Status History</p>
                          <div className="space-y-1.5">
                            {(order.statusHistory || []).slice().reverse().map((h, i) => (
                              <div key={i} className="flex items-start gap-2">
                                <StatusBadge status={h.status} />
                                <span className="text-[11px] text-gray-400">{formatDate(h.timestamp)}</span>
                                {h.note && <span className="text-[11px] text-gray-400">— {h.note}</span>}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!fetching && totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-xs text-gray-400">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredOrders.length)} of {filteredOrders.length} orders
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => { setPage(p => p - 1); setExpandedId(null); }}
                disabled={page === 1}
                className="flex items-center gap-1 h-8 px-3 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => { setPage(p); setExpandedId(null); }}
                  className={`h-8 w-8 rounded-lg text-xs font-medium transition-colors ${
                    p === page
                      ? "bg-gray-900 text-white"
                      : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {p}
                </button>
              ))}

              <button
                onClick={() => { setPage(p => p + 1); setExpandedId(null); }}
                disabled={page === totalPages}
                className="flex items-center gap-1 h-8 px-3 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete confirm modal */}
      {confirmOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setConfirmOrder(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4 text-red-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Delete order?</p>
                <p className="text-xs text-gray-500 mt-1">
                  Order <span className="font-medium text-gray-700">{confirmOrder.orderNumber}</span> will be permanently removed.
                </p>
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-1">
              <button
                onClick={() => setConfirmOrder(null)}
                className="h-9 px-4 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirmed}
                className="h-9 px-4 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
