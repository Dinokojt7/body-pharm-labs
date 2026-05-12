"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/lib/stores/auth-store";
import {
  adminGetDiscounts,
  adminCreateDiscount,
  adminUpdateDiscount,
  adminDeleteDiscount,
} from "@/lib/firebase/firestore";
import AdminHeader from "@/components/layout/AdminHeader";
import { ArrowLeft, Plus, Trash2, ToggleLeft, ToggleRight, X, Info } from "lucide-react";
import { Timestamp } from "firebase/firestore";

const ADMIN_UID = process.env.NEXT_PUBLIC_ADMIN_UID;
const emptyForm = { code: "", value: "", maxUses: "", expiresAt: "", active: true };

// ── Tooltip ──────────────────────────────────────────────────────────────────
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
            {/* caret */}
            <span className="absolute top-full left-4 -mt-px border-4 border-transparent border-t-white" />
            <span className="absolute top-full left-4 border-4 border-transparent border-t-gray-100" style={{ marginTop: "1px" }} />
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}

// ── Field label with optional tooltip ────────────────────────────────────────
function FieldLabel({ children, tooltip }) {
  return (
    <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1.5">
      {children}
      {tooltip && <Tooltip text={tooltip} />}
    </label>
  );
}

const inputCls = "w-full h-10 px-3 rounded-lg border border-gray-200 text-sm text-gray-900 focus:outline-none focus:border-gray-400 bg-white";

// ── Main page ─────────────────────────────────────────────────────────────────
export default function DiscountsPage() {
  const router = useRouter();
  const { user, loading } = useAuthStore();

  const [discounts, setDiscounts] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!loading && user?.uid !== ADMIN_UID) router.replace("/admin");
  }, [user, loading, router]);

  useEffect(() => {
    if (loading || user?.uid !== ADMIN_UID) return;
    load();
  }, [loading, user]);

  const load = async () => {
    setFetching(true);
    const { discounts: data } = await adminGetDiscounts();
    setDiscounts(data);
    setFetching(false);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.code.trim()) { setFormError("Code is required."); return; }
    if (!form.value || isNaN(Number(form.value)) || Number(form.value) <= 0 || Number(form.value) > 100) {
      setFormError("Enter a valid percentage between 1 and 100."); return;
    }
    setSaving(true);
    setFormError("");
    const payload = {
      code: form.code.toUpperCase().trim(),
      type: "percentage",
      value: Number(form.value),
      active: form.active,
      maxUses: form.maxUses ? parseInt(form.maxUses) : null,
      expiresAt: form.expiresAt ? Timestamp.fromDate(new Date(form.expiresAt)) : null,
    };
    const { error } = await adminCreateDiscount(payload);
    if (error) { setFormError(error); setSaving(false); return; }
    setForm(emptyForm);
    setShowForm(false);
    setSaving(false);
    load();
  };

  const toggleActive = async (discount) => {
    await adminUpdateDiscount(discount.id, { active: !discount.active });
    setDiscounts((prev) => prev.map((d) => d.id === discount.id ? { ...d, active: !d.active } : d));
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this discount code?")) return;
    await adminDeleteDiscount(id);
    setDiscounts((prev) => prev.filter((d) => d.id !== id));
  };

  const isExpired = (d) => d.expiresAt && d.expiresAt.toMillis() < Date.now();

  const statusLabel = (d) => {
    if (!d.active) return { text: "Inactive", cls: "bg-gray-100 text-gray-500" };
    if (isExpired(d)) return { text: "Expired", cls: "bg-red-50 text-red-500" };
    if (d.maxUses !== null && d.uses >= d.maxUses) return { text: "Maxed out", cls: "bg-orange-50 text-orange-500" };
    return { text: "Active", cls: "bg-green-50 text-green-600" };
  };

  if (loading || (!loading && user?.uid !== ADMIN_UID)) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
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
            <h1 className="text-sm font-semibold text-gray-900">Discount Codes</h1>
          </div>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => { setShowForm(true); setFormError(""); setForm(emptyForm); }}
            className="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-gray-900 text-white text-xs font-semibold hover:bg-gray-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            New Code
          </motion.button>
        </motion.div>

        {/* Create form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: -10, scaleY: 0.97 }}
              animate={{ opacity: 1, y: 0, scaleY: 1 }}
              exit={{ opacity: 0, y: -8, scaleY: 0.97 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              style={{ transformOrigin: "top" }}
              className="bg-white rounded-xl border border-gray-200 p-6 mb-6 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Create Discount Code</h2>
                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-black transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="grid sm:grid-cols-2 gap-4">
                {/* Code */}
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="space-y-0">
                  <FieldLabel>Code *</FieldLabel>
                  <input
                    type="text"
                    value={form.code}
                    onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
                    placeholder="e.g. TUMI15"
                    className={`${inputCls} uppercase tracking-wider`}
                  />
                </motion.div>

                {/* Value */}
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="space-y-0">
                  <FieldLabel>Discount % *</FieldLabel>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={form.value}
                    onChange={(e) => setForm((p) => ({ ...p, value: e.target.value }))}
                    placeholder="e.g. 15"
                    className={inputCls}
                  />
                </motion.div>

                {/* Max Uses */}
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.11 }} className="space-y-0">
                  <FieldLabel tooltip="The maximum number of times this code can be used across all customers. Once reached, the code will automatically stop working at checkout. Leave blank to allow unlimited uses.">
                    Max Uses
                  </FieldLabel>
                  <input
                    type="number"
                    min="1"
                    value={form.maxUses}
                    onChange={(e) => setForm((p) => ({ ...p, maxUses: e.target.value }))}
                    placeholder="Unlimited"
                    className={inputCls}
                  />
                </motion.div>

                {/* Expiry Date */}
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }} className="space-y-0">
                  <FieldLabel tooltip="The last date this code can be used. After midnight on this date, the code will be rejected at checkout. Leave blank if the code should never expire.">
                    Expiry Date
                  </FieldLabel>
                  <input
                    type="date"
                    value={form.expiresAt}
                    onChange={(e) => setForm((p) => ({ ...p, expiresAt: e.target.value }))}
                    className={inputCls}
                  />
                </motion.div>

                {/* Active toggle */}
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.17 }} className="sm:col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.active}
                      onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))}
                      className="w-4 h-4 rounded accent-gray-900"
                    />
                    <span className="text-sm text-gray-600">Active immediately</span>
                  </label>
                </motion.div>

                {formError && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="sm:col-span-2 text-xs text-red-500"
                  >
                    {formError}
                  </motion.p>
                )}

                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="sm:col-span-2 flex justify-end gap-3">
                  <button type="button" onClick={() => setShowForm(false)} className="h-9 px-4 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} className="h-9 px-5 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-700 transition-colors disabled:opacity-50">
                    {saving ? "Creating…" : "Create Code"}
                  </button>
                </motion.div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Table card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.08 }}
          className="bg-white rounded-xl border border-gray-200 overflow-hidden"
        >
          {fetching ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-16 text-center text-sm text-gray-400">
              Loading…
            </motion.div>
          ) : discounts.length === 0 ? (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="py-16 text-center">
              <p className="text-sm text-gray-400 mb-1">No discount codes yet</p>
              <p className="text-xs text-gray-400">Click "New Code" to create your first one.</p>
            </motion.div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Code", "Discount", "Uses", "Expires", "Status", ""].map((h) => (
                    <th key={h} className={`text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide ${h === "" ? "w-16" : ""}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                <AnimatePresence initial={false}>
                  {discounts.map((d, i) => {
                    const status = statusLabel(d);
                    return (
                      <motion.tr
                        key={d.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.18, delay: i * 0.04 }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-5 py-4 font-mono font-semibold text-gray-900 tracking-wider">{d.code}</td>
                        <td className="px-5 py-4 text-gray-700">{d.value}% off</td>
                        <td className="px-5 py-4 text-gray-500">
                          {d.uses ?? 0}{d.maxUses !== null ? ` / ${d.maxUses}` : ""}
                        </td>
                        <td className="px-5 py-4 text-gray-500">
                          {d.expiresAt ? new Date(d.expiresAt.toMillis()).toLocaleDateString("en-ZA") : "—"}
                        </td>
                        <td className="px-5 py-4">
                          <motion.span
                            initial={{ scale: 0.85, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.18, delay: i * 0.04 + 0.05 }}
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.cls}`}
                          >
                            {status.text}
                          </motion.span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 justify-end">
                            <button
                              onClick={() => toggleActive(d)}
                              className="text-gray-400 hover:text-gray-700 transition-colors"
                              title={d.active ? "Deactivate" : "Activate"}
                            >
                              {d.active
                                ? <ToggleRight className="w-5 h-5 text-green-500" />
                                : <ToggleLeft className="w-5 h-5" />}
                            </button>
                            <button
                              onClick={() => handleDelete(d.id)}
                              className="text-gray-300 hover:text-red-500 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          )}
        </motion.div>
      </div>
    </div>
  );
}
