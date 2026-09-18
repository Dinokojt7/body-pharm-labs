"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/lib/stores/auth-store";
import { isAdmin } from "@/lib/utils/admin";
import { adminSubscribeToAllOrders, updateOrderStatus, deleteOrder } from "@/lib/firebase/firestore";
import { sendAbandonedOrderReminders } from "@/lib/services/order-reminder-service";
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Trash2, AlertTriangle, Printer, FileText, Send, Check } from "lucide-react";
import AdminHeader from "@/components/layout/AdminHeader";
import CustomSelect from "@/components/ui/CustomSelect";
const PAGE_SIZE = 20;
const ABANDONED_THRESHOLD_MS = 2 * 60 * 60 * 1000; // 2 hours

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
  const [selectedEmails, setSelectedEmails] = useState(new Set());
  const [sending, setSending] = useState(false);
  const [sendResults, setSendResults] = useState(new Map());

  useEffect(() => {
    if (!loading && !isAdmin(user?.uid)) router.replace("/admin");
  }, [user, loading, router]);

  useEffect(() => {
    if (loading || !isAdmin(user?.uid)) return;
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

  // Abandoned = never paid AND old enough that they're not just mid-payment
  // right now. Grouped by customer email since a repeat-abandoner creates a
  // fresh order doc every attempt — the most recent one per customer is the
  // representative (drives display, reminder status, and what gets emailed).
  const abandonedGroups = useMemo(() => {
    const cutoff = Date.now() - ABANDONED_THRESHOLD_MS;
    const candidates = orders.filter((o) => {
      if (o.paymentStatus === "paid") return false;
      const createdMs = o.createdAt?.toMillis?.() ?? new Date(o.createdAt ?? 0).getTime();
      return createdMs > 0 && createdMs < cutoff;
    });

    const byEmail = new Map();
    for (const o of candidates) {
      const email = (o.customer?.email || o.email || "").toLowerCase();
      if (!email) continue;
      if (!byEmail.has(email)) byEmail.set(email, []);
      byEmail.get(email).push(o);
    }

    return Array.from(byEmail.entries())
      .map(([email, ordersForEmail]) => {
        const sorted = ordersForEmail
          .slice()
          .sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
        return { email, representative: sorted[0], orders: sorted };
      })
      .sort((a, b) => (b.representative.createdAt?.toMillis?.() ?? 0) - (a.representative.createdAt?.toMillis?.() ?? 0));
  }, [orders]);

  const isAbandonedView = paymentFilter === "abandoned";

  // Default the selection to never-reminded customers each time the tab is
  // opened — doesn't fight with live updates the rest of the time.
  useEffect(() => {
    if (!isAbandonedView) return;
    setSelectedEmails(new Set(abandonedGroups.filter((g) => !g.representative.reminderSentAt).map((g) => g.email)));
    setSendResults(new Map());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAbandonedView]);

  const toggleSelected = (email) => {
    setSelectedEmails((prev) => {
      const next = new Set(prev);
      if (next.has(email)) next.delete(email); else next.add(email);
      return next;
    });
  };

  const handleSendReminders = async () => {
    const targets = abandonedGroups.filter((g) => selectedEmails.has(g.email));
    if (targets.length === 0) return;

    setSending(true);
    const { success, results, error } = await sendAbandonedOrderReminders(targets.map((g) => g.representative.id));
    setSending(false);

    // Never assume success — map real per-order results back onto rows, and
    // only clear the checkbox for ones that actually sent.
    const resultsByOrderId = new Map((results || []).map((r) => [r.orderId, r]));
    const newResults = new Map();
    const stillSelected = new Set(selectedEmails);
    for (const g of targets) {
      const r = success ? resultsByOrderId.get(g.representative.id) : null;
      const outcome = r || { success: false, error: error || "Request failed" };
      newResults.set(g.email, outcome);
      if (outcome.success) stillSelected.delete(g.email);
    }
    setSendResults(newResults);
    setSelectedEmails(stillSelected);
  };

  const filteredOrders = orders
    .filter((o) => paymentFilter === "all" ? true : paymentFilter === "paid" ? o.paymentStatus === "paid" : paymentFilter === "unpaid" ? o.paymentStatus !== "paid" : true)
    .filter((o) => statusFilter === "all" ? true : (o.status || "pending") === statusFilter);

  const totalPages = isAbandonedView
    ? Math.max(1, Math.ceil(abandonedGroups.length / PAGE_SIZE))
    : Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const pagedOrders = isAbandonedView ? [] : filteredOrders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pagedGroups = isAbandonedView ? abandonedGroups.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) : [];

  if (loading || (!loading && !isAdmin(user?.uid))) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader backHref="/admin/dashboard" />

      {/* Sticky sub-header — title + filters pinned right below AdminHeader;
          only the order list below scrolls underneath it. */}
      <div className="sticky top-20 md:top-24 z-20 bg-gray-50 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="mb-3">
            <h1 className="text-sm font-semibold text-gray-900">Orders</h1>
            <p className="text-xs text-gray-400 mt-0.5">{orders.length} total</p>
          </div>

          {/* Filters row */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { key: "all",       label: "All",       count: orders.length },
              { key: "paid",      label: "Paid",      count: orders.filter(o => o.paymentStatus === "paid").length },
              { key: "unpaid",    label: "Unpaid",    count: orders.filter(o => o.paymentStatus !== "paid").length },
              { key: "abandoned", label: "Abandoned", count: abandonedGroups.length },
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

            <div className="ml-auto">
              {isAbandonedView ? (
                <button
                  onClick={handleSendReminders}
                  disabled={sending || selectedEmails.size === 0}
                  className="flex items-center gap-1.5 h-8 px-4 rounded-lg bg-gray-900 text-white text-xs font-semibold hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Send className="w-3.5 h-3.5" />
                  {sending ? "Sending…" : `Send reminder to selected (${selectedEmails.size})`}
                </button>
              ) : (
                <div className="w-48">
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
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {fetching ? (
          <div className="text-center py-20 text-gray-400 text-sm">Loading…</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 text-gray-400 text-sm">No orders yet.</div>
        ) : isAbandonedView && abandonedGroups.length === 0 ? (
          <div className="text-center py-20 text-gray-400 text-sm">No abandoned orders right now.</div>
        ) : isAbandonedView ? (
          <div className="space-y-2">
            {pagedGroups.map((group) => {
              const isExpanded = expandedId === group.email;
              const result = sendResults.get(group.email);
              const order = group.representative;
              return (
                <div key={group.email} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="px-5 py-4 flex flex-wrap items-center gap-4">
                    <input
                      type="checkbox"
                      checked={selectedEmails.has(group.email)}
                      onChange={() => toggleSelected(group.email)}
                      className="w-4 h-4 rounded accent-gray-900 shrink-0"
                    />

                    <div className="min-w-35">
                      <p className="text-xs font-bold text-gray-900 font-mono">{order.orderNumber || order.id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{formatDate(order.createdAt)}</p>
                    </div>

                    <div className="flex-1 min-w-40">
                      <p className="text-xs font-semibold text-gray-800">
                        {order.customer?.firstName || order.firstName} {order.customer?.lastName || order.lastName}
                      </p>
                      <p className="text-[11px] text-gray-400 truncate">{group.email}</p>
                    </div>

                    <div className="hidden sm:block min-w-24 text-right">
                      <p className="text-xs text-gray-500">{group.orders.length} attempt{group.orders.length !== 1 ? "s" : ""}</p>
                      <p className="text-xs font-bold text-gray-900 mt-0.5">{displayAmount(order.total, order)}</p>
                    </div>

                    <div className="hidden md:block">
                      {order.reminderSentAt ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-500">
                          Reminded {formatDate(order.reminderSentAt)}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-50 text-yellow-700">
                          Not reminded
                        </span>
                      )}
                    </div>

                    {result && (
                      <div className="hidden lg:flex items-center">
                        {result.success ? (
                          <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Sent
                          </span>
                        ) : (
                          <span className="text-xs text-red-500 font-medium">Failed: {result.error}</span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-1 ml-auto">
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : group.email)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-gray-100 px-5 py-5 bg-gray-50 grid sm:grid-cols-2 gap-6">
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
                          <div className="flex justify-between text-xs font-bold text-gray-900 pt-1">
                            <span>Total</span>
                            <span>{displayAmount(order.total, order)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Customer</p>
                          <p className="text-xs font-semibold text-gray-700">
                            {order.customer?.firstName || order.firstName} {order.customer?.lastName || order.lastName}
                          </p>
                          <p className="text-xs text-gray-500">{group.email}</p>
                          {(order.customer?.phone || order.phone) && (
                            <p className="text-xs text-gray-500">{order.customer?.phone || order.phone}</p>
                          )}
                        </div>

                        {group.orders.length > 1 && (
                          <div>
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">All abandoned attempts</p>
                            <div className="space-y-1">
                              {group.orders.map((o) => (
                                <div key={o.id} className="flex items-center justify-between text-xs text-gray-500">
                                  <span className="font-mono">{o.orderNumber || o.id.slice(0, 8).toUpperCase()}</span>
                                  <span>{formatDate(o.createdAt)}</span>
                                  <span>{o.reminderSentAt ? "Reminded" : "—"}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
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
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>VAT (15%)</span>
                            <span>{displayAmount(order.tax, order)}</span>
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
              {isAbandonedView
                ? `Showing ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, abandonedGroups.length)} of ${abandonedGroups.length} customers`
                : `Showing ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, filteredOrders.length)} of ${filteredOrders.length} orders`}
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
