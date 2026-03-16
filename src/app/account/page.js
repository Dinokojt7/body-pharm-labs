"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package, Mail, User, LogOut, Clock, ChevronRight,
  Check, X, Pencil, ShoppingBag, Loader2, AlertCircle, RefreshCw, Trash2,
} from "lucide-react";

import { useAuthStore } from "@/lib/stores/auth-store";
import { useCartStore } from "@/lib/stores/cart-store";
import { logout } from "@/lib/firebase/auth";
import { getUserOrders, getUserProfile, saveUserProfile, deleteOrder } from "@/lib/firebase/firestore";
import Breadcrumb from "@/components/ui/Breadcrumb";

const STATUS_COLORS = {
  pending_payment: { dot: "bg-amber-400",  text: "text-amber-600",  label: "Pending Payment" },
  payment_failed:  { dot: "bg-red-400",    text: "text-red-500",    label: "Payment Failed"  },
  paid:            { dot: "bg-blue-400",   text: "text-blue-600",   label: "Paid"            },
  confirmed:       { dot: "bg-blue-400",   text: "text-blue-600",   label: "Confirmed"       },
  shipped:         { dot: "bg-indigo-400", text: "text-indigo-600", label: "Shipped"         },
  delivered:       { dot: "bg-green-500",  text: "text-green-600",  label: "Delivered"       },
  cancelled:       { dot: "bg-red-400",    text: "text-red-500",    label: "Cancelled"       },
};

const formatDate = (ts) => {
  if (!ts) return "";
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
};

const formatPrice = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n ?? 0);

const ADDRESS_FIELDS = [
  { key: "line1",    label: "Street Address",   placeholder: "123 Main St",   full: true  },
  { key: "city",     label: "City",             placeholder: "Cape Town",     full: false },
  { key: "province", label: "Province / State", placeholder: "Western Cape",  full: false },
  { key: "country",  label: "Country",          placeholder: "South Africa",  full: false },
  { key: "zip",      label: "Postal Code",      placeholder: "8001",          full: false },
];

export default function AccountPage() {
  return (
    <Suspense>
      <AccountPageInner />
    </Suspense>
  );
}

function AccountPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isWelcome = searchParams.get("welcome") === "1";

  const { user, isAuthenticated, authLoading, getDisplayName } = useAuthStore();
  const { addItem } = useCartStore();

  const [profile, setProfile] = useState({
    displayName: "", phone: "",
    address: { line1: "", city: "", province: "", country: "", zip: "" },
  });
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push("/");
  }, [isAuthenticated, authLoading, router]);

  // Open edit mode automatically for new users
  useEffect(() => {
    if (isWelcome) setEditing(true);
  }, [isWelcome]);

  // Load Firestore profile
  useEffect(() => {
    if (!user?.uid) return;
    getUserProfile(user.uid).then(({ profile: p }) => {
      setProfile({
        displayName: p?.displayName || user.displayName || "",
        phone:       p?.phone       || user.phoneNumber  || "",
        address:     p?.address     || { line1: "", city: "", province: "", country: "", zip: "" },
      });
    });
  }, [user?.uid, user?.displayName, user?.phoneNumber]);

  // Load orders
  useEffect(() => {
    if (!user?.uid) return;
    getUserOrders(user.uid).then(({ orders: o }) => {
      setOrders(o || []);
      setOrdersLoading(false);
    });
  }, [user?.uid]);

  const handleSave = async () => {
    if (!user?.uid) return;
    setSaving(true);
    await saveUserProfile(user.uid, profile);
    setSaving(false);
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 2500);
    if (isWelcome) router.replace("/account");
  };

  const handleCancel = () => {
    setEditing(false);
    if (isWelcome) router.replace("/account");
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("Delete this order? This cannot be undone.")) return;
    setDeletingId(orderId);
    await deleteOrder(orderId);
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    setDeletingId(null);
  };

  const handleResumePayment = (order) => {
    // Re-add items to cart and navigate to checkout
    order.items?.forEach((item) => {
      addItem({
        id: item.productId,
        name: item.name,
        price: item.price,
        image: item.image || null,
        selectedSize: item.size || null,
      }, item.quantity);
    });
    router.push("/checkout");
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  if (authLoading || !isAuthenticated) return null;

  const displayName = profile.displayName || getDisplayName();
  const initials = displayName?.slice(0, 2).toUpperCase() || "U";
  const memberSince = user?.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : null;

  return (
    <main className="min-h-screen bg-white">
      <Breadcrumb />

      <div className="max-w-5xl mx-auto px-4 md:px-8 lg:px-12 pt-12 pb-24">

        {/* New-user welcome banner */}
        <AnimatePresence>
          {isWelcome && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-8 flex items-start gap-3 bg-black text-white rounded px-5 py-4"
            >
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-sm">Welcome to Body Pharm Labz!</p>
                <p className="text-white/60 text-xs mt-0.5">
                  Complete your profile so we can personalise your experience and pre-fill your shipping details at checkout.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Page heading */}
        <div className="mb-10">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-gray-400 mb-2">Your Account</p>
          <h1 className="text-3xl md:text-4xl font-semibold text-black">
            Welcome back{displayName ? `, ${displayName.split(" ")[0]}` : ""}
          </h1>
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8 items-start">

          {/* ── Sidebar ── */}
          <motion.aside
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:col-span-1 space-y-4"
          >
            {/* Profile card */}
            <div className="border border-gray-200 rounded p-6 space-y-5">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center text-xl font-semibold tracking-wide">
                  {initials}
                </div>
                <div>
                  <p className="font-semibold text-black text-sm">{displayName}</p>
                  {user?.email && (
                    <p className="text-xs text-gray-400 mt-0.5 break-all">{user.email}</p>
                  )}
                  {profile.phone && (
                    <p className="text-xs text-gray-400 mt-0.5">{profile.phone}</p>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-100" />

              <div className="space-y-2.5 text-xs text-gray-500">
                {memberSince && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                    Member since {memberSince}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                  {ordersLoading
                    ? "Loading orders…"
                    : `${orders.length} order${orders.length !== 1 ? "s" : ""} placed`}
                </div>
              </div>

              <div className="border-t border-gray-100" />

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 h-9 rounded border border-gray-200 text-xs text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>

            {/* Quick links */}
            <div className="border border-gray-200 rounded overflow-hidden">
              {[
                { href: "/shop",        label: "Browse Products", Icon: ShoppingBag },
                { href: "/track-order", label: "Track an Order",  Icon: Package     },
                { href: "/contact",     label: "Contact Support", Icon: Mail        },
              ].map(({ href, label, Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center justify-between px-4 py-3 text-xs text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className="w-3.5 h-3.5 text-gray-400" />
                    {label}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                </Link>
              ))}
            </div>
          </motion.aside>

          {/* ── Main content ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="md:col-span-2 space-y-8"
          >

            {/* Profile details card */}
            <div className="border border-gray-200 rounded">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h2 className="text-xs font-semibold tracking-[0.15em] uppercase text-black">Profile Details</h2>
                {!editing ? (
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-black transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </button>
                ) : (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleCancel}
                      className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-1.5 h-7 px-3 rounded bg-black text-white text-xs font-semibold disabled:opacity-60"
                    >
                      {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      {saving ? "Saving…" : "Save"}
                    </button>
                  </div>
                )}
              </div>

              {saved && (
                <div className="px-5 py-2.5 bg-green-50 border-b border-green-100 text-xs text-green-700 flex items-center gap-2">
                  <Check className="w-3.5 h-3.5" />
                  Profile saved successfully
                </div>
              )}

              <div className="p-5 space-y-6">
                {/* Personal */}
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-gray-400 mb-3">Personal</p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      { key: "displayName", label: "Full Name",    placeholder: "Your name"       },
                      { key: "phone",       label: "Phone Number", placeholder: "+1 555 000 0000" },
                    ].map(({ key, label, placeholder }) => (
                      <label key={key} className="block">
                        <span className="text-xs text-gray-500 mb-1.5 block">{label}</span>
                        {editing ? (
                          <input
                            value={profile[key] || ""}
                            onChange={(e) => setProfile((p) => ({ ...p, [key]: e.target.value }))}
                            className="w-full h-9 border border-gray-200 rounded px-3 text-sm text-black focus:outline-none focus:border-black transition-colors"
                            placeholder={placeholder}
                          />
                        ) : (
                          <p className="text-sm text-black">
                            {profile[key] || <span className="text-gray-300 italic">Not set</span>}
                          </p>
                        )}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Account (read-only) */}
                {user?.email && (
                  <div>
                    <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-gray-400 mb-3">Account</p>
                    <label className="block">
                      <span className="text-xs text-gray-500 mb-1.5 block">Email</span>
                      <p className="text-sm text-black break-all">{user.email}</p>
                    </label>
                  </div>
                )}

                {/* Shipping address */}
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-gray-400 mb-3">Default Shipping Address</p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {ADDRESS_FIELDS.map(({ key, label, placeholder, full }) => (
                      <label key={key} className={`block ${full ? "sm:col-span-2" : ""}`}>
                        <span className="text-xs text-gray-500 mb-1.5 block">{label}</span>
                        {editing ? (
                          <input
                            value={profile.address?.[key] || ""}
                            onChange={(e) =>
                              setProfile((p) => ({ ...p, address: { ...p.address, [key]: e.target.value } }))
                            }
                            className="w-full h-9 border border-gray-200 rounded px-3 text-sm text-black focus:outline-none focus:border-black transition-colors"
                            placeholder={placeholder}
                          />
                        ) : (
                          <p className="text-sm text-black">
                            {profile.address?.[key] || <span className="text-gray-300 italic">Not set</span>}
                          </p>
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Orders card */}
            <div className="border border-gray-200 rounded">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="text-xs font-semibold tracking-[0.15em] uppercase text-black">Order History</h2>
              </div>

              {ordersLoading ? (
                <div className="p-5 space-y-3">
                  {[0, 1].map((i) => (
                    <div key={i} className="h-20 bg-gray-100 rounded animate-pulse" />
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <div className="py-14 flex flex-col items-center justify-center text-center gap-4 px-5">
                  <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center">
                    <Package className="w-5 h-5 text-gray-300" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-black">No orders yet</p>
                    <p className="text-xs text-gray-400 mt-1 max-w-xs">
                      When you place your first order it will appear here.
                    </p>
                  </div>
                  <Link
                    href="/shop"
                    className="h-9 px-5 rounded bg-black text-white text-xs font-semibold tracking-widest uppercase hover:bg-gray-800 transition-colors inline-flex items-center"
                  >
                    Shop Now
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {orders.map((order) => {
                    const s = STATUS_COLORS[order.status] || STATUS_COLORS.paid;
                    const isFailed = order.status === "payment_failed" || order.status === "pending_payment";
                    return (
                      <div key={order.id} className="px-5 py-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-semibold text-black font-mono truncate">
                                {order.orderNumber || `#${order.id.slice(0, 8).toUpperCase()}`}
                              </span>
                              <span className={`flex items-center gap-1 text-[10px] font-semibold ${s.text}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                                {s.label}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400">
                              {formatDate(order.createdAt)} &middot; {order.items?.length ?? 0} item{(order.items?.length ?? 0) !== 1 ? "s" : ""}
                            </p>
                          </div>
                          <div className="flex items-center gap-4 shrink-0">
                            <span className="text-sm font-semibold text-black">
                              {formatPrice(order.total ?? order.totals?.total)}
                            </span>
                            {!isFailed && order.orderNumber && (
                              <Link
                                href={`/track-order?ref=${order.orderNumber}`}
                                className="text-xs text-gray-400 hover:text-black transition-colors flex items-center gap-1"
                              >
                                Track <ChevronRight className="w-3.5 h-3.5" />
                              </Link>
                            )}
                          </div>
                        </div>

                        {/* Failed/pending payment actions */}
                        {isFailed && (
                          <div className="mt-3 flex items-center gap-3 pt-3 border-t border-gray-50">
                            <div className="flex items-center gap-1.5 text-xs text-amber-600 flex-1">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                              Payment was not completed for this order.
                            </div>
                            <button
                              onClick={() => handleResumePayment(order)}
                              className="flex items-center gap-1.5 h-7 px-3 rounded bg-black text-white text-xs font-semibold hover:bg-gray-800 transition-colors"
                            >
                              <RefreshCw className="w-3 h-3" />
                              Resume
                            </button>
                            <button
                              onClick={() => handleDeleteOrder(order.id)}
                              disabled={deletingId === order.id}
                              className="flex items-center gap-1.5 h-7 px-3 rounded border border-gray-200 text-xs text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors disabled:opacity-40"
                            >
                              {deletingId === order.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Trash2 className="w-3 h-3" />
                              )}
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </motion.div>
        </div>
      </div>
    </main>
  );
}
