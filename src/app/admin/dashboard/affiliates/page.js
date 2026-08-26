"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/lib/stores/auth-store";
import { isAdmin } from "@/lib/utils/admin";
import {
  adminGetAffiliates,
  adminUpdateAffiliate,
  adminGetDiscounts,
  adminGetAllOrders,
} from "@/lib/firebase/firestore";
import { createAffiliate, deleteAffiliate } from "@/lib/services/affiliate-service";
import AdminHeader from "@/components/layout/AdminHeader";
import CustomSelect from "@/components/ui/CustomSelect";
import { ArrowLeft, Plus, Trash2, ToggleLeft, ToggleRight, X, Copy, Check } from "lucide-react";

const emptyForm = { name: "", email: "", discountCode: "" };
const currencyFmt = new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" });

const inputCls = "w-full h-10 px-3 rounded-lg border border-gray-200 text-sm text-gray-900 focus:outline-none focus:border-gray-400 bg-white";

function CopyLink({ link }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable — link is still visible to select/copy manually
    }
  };
  return (
    <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
      <p className="text-xs text-amber-700 flex-1 truncate">{link}</p>
      <button type="button" onClick={copy} className="text-amber-600 hover:text-amber-900 transition-colors shrink-0">
        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}

export default function AffiliatesPage() {
  const router = useRouter();
  const { user, loading } = useAuthStore();

  const [affiliates, setAffiliates] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [statsByCode, setStatsByCode] = useState({});
  const [fetching, setFetching] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [fallbackLink, setFallbackLink] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!loading && !isAdmin(user?.uid)) router.replace("/admin");
  }, [user, loading, router]);

  useEffect(() => {
    if (loading || !isAdmin(user?.uid)) return;
    load();
  }, [loading, user]);

  const load = async () => {
    setFetching(true);
    const [{ affiliates: affs }, { discounts: disc }, { orders }] = await Promise.all([
      adminGetAffiliates(),
      adminGetDiscounts(),
      adminGetAllOrders(),
    ]);
    setAffiliates(affs);
    setDiscounts(disc);

    const byCode = {};
    for (const o of orders) {
      if (!o.discountCode || o.paymentStatus !== "paid") continue;
      if (!byCode[o.discountCode]) byCode[o.discountCode] = { orders: 0, revenue: 0 };
      byCode[o.discountCode].orders += 1;
      byCode[o.discountCode].revenue += o.total || 0;
    }
    setStatsByCode(byCode);
    setFetching(false);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError("");
    setFallbackLink(null);
    setShowForm(true);
  };

  const openEdit = (a) => {
    setEditingId(a.id);
    setForm({ name: a.name, email: a.email, discountCode: a.discountCode });
    setFormError("");
    setFallbackLink(null);
    setShowForm(true);
  };

  const closeForm = () => { setShowForm(false); setEditingId(null); setForm(emptyForm); setFormError(""); };

  const claimedCodes = new Set(
    affiliates.filter((a) => a.id !== editingId).map((a) => a.discountCode)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setFormError("Name is required."); return; }
    if (!editingId) {
      if (!form.email.trim()) { setFormError("Email is required."); return; }
      if (!form.discountCode) { setFormError("Select a discount code."); return; }
    }

    setSaving(true);
    setFormError("");
    setFallbackLink(null);

    if (editingId) {
      const { success, error } = await adminUpdateAffiliate(editingId, { name: form.name.trim() });
      if (!success) { setFormError(error || "Failed to save changes."); setSaving(false); return; }
      closeForm();
      setSaving(false);
      load();
      return;
    }

    const result = await createAffiliate({
      name: form.name.trim(),
      email: form.email.trim(),
      discountCode: form.discountCode,
    });
    if (!result.success) { setFormError(result.error || "Failed to create affiliate."); setSaving(false); return; }

    setSaving(false);
    if (!result.emailSent && result.resetLink) {
      setFallbackLink(result.resetLink);
      load();
    } else {
      closeForm();
      load();
    }
  };

  const toggleActive = async (affiliate) => {
    const { success } = await adminUpdateAffiliate(affiliate.id, { active: !affiliate.active });
    if (success) {
      setAffiliates((prev) => prev.map((a) => a.id === affiliate.id ? { ...a, active: !a.active } : a));
    }
  };

  const closeDeleteModal = () => { setConfirmDelete(null); setDeleteError(""); };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    setDeleteError("");
    const { success, error } = await deleteAffiliate(confirmDelete);
    setDeleting(false);
    if (!success) {
      setDeleteError(error || "Failed to delete this affiliate. Please try again.");
      return;
    }
    setAffiliates((prev) => prev.filter((a) => a.id !== confirmDelete));
    setConfirmDelete(null);
  };

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
            <h1 className="text-sm font-semibold text-gray-900">Affiliates</h1>
          </div>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={openCreate}
            className="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-gray-900 text-white text-xs font-semibold hover:bg-gray-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            New Affiliate
          </motion.button>
        </motion.div>

        <AnimatePresence>
          {showForm && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: -10, scaleY: 0.97 }}
              animate={{ opacity: 1, y: 0, scaleY: 1 }}
              exit={{ opacity: 0, y: -8, scaleY: 0.97 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              style={{ transformOrigin: "top" }}
              className="bg-white rounded-xl border border-gray-200 p-6 mb-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wide">{editingId ? "Edit Affiliate" : "New Affiliate"}</h2>
                <button onClick={closeForm} className="text-gray-400 hover:text-black transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Tumi"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Email *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    placeholder="affiliate@example.com"
                    disabled={!!editingId}
                    className={`${inputCls} disabled:bg-gray-50 disabled:text-gray-400`}
                    title={editingId ? "Email can't be changed after creation." : undefined}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Discount Code *</label>
                  {editingId ? (
                    <div className={`${inputCls} flex items-center bg-gray-50 text-gray-400 font-mono tracking-wider`}>
                      {form.discountCode}
                    </div>
                  ) : (
                    <CustomSelect
                      value={form.discountCode}
                      onChange={(val) => setForm((p) => ({ ...p, discountCode: val }))}
                      placeholder="Select a discount code…"
                      options={discounts
                        .filter((d) => !claimedCodes.has(d.code))
                        .map((d) => ({ value: d.code, label: d.code }))}
                    />
                  )}
                  {editingId && (
                    <p className="text-[11px] text-gray-400 mt-1.5">Discount code can't be changed after creation — delete and re-create to relink.</p>
                  )}
                </div>

                {formError && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="sm:col-span-2 text-xs text-red-500">
                    {formError}
                  </motion.p>
                )}

                {fallbackLink && (
                  <div className="sm:col-span-2 space-y-1.5">
                    <p className="text-xs text-gray-500">Couldn't send the invite email — share this set-password link with them directly:</p>
                    <CopyLink link={fallbackLink} />
                  </div>
                )}

                <div className="sm:col-span-2 flex justify-end gap-3">
                  <button type="button" onClick={closeForm} className="h-9 px-4 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                    {fallbackLink ? "Done" : "Cancel"}
                  </button>
                  {!fallbackLink && (
                    <button type="submit" disabled={saving} className="h-9 px-5 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-700 transition-colors disabled:opacity-50">
                      {saving ? (editingId ? "Saving…" : "Creating…") : (editingId ? "Save Changes" : "Create Affiliate")}
                    </button>
                  )}
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.08 }}
          className="bg-white rounded-xl border border-gray-200 overflow-hidden"
        >
          {fetching ? (
            <div className="py-16 text-center text-sm text-gray-400">Loading…</div>
          ) : affiliates.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm text-gray-400 mb-1">No affiliates yet</p>
              <p className="text-xs text-gray-400">Click &quot;New Affiliate&quot; to add your first one.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Name", "Code", "Orders", "Revenue", "Status", ""].map((h) => (
                    <th key={h} className={`text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide ${h === "" ? "w-16" : ""}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                <AnimatePresence initial={false}>
                  {affiliates.map((a, i) => {
                    const stats = statsByCode[a.discountCode] || { orders: 0, revenue: 0 };
                    return (
                      <motion.tr
                        key={a.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.18, delay: i * 0.04 }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-5 py-4">
                          <p className="font-semibold text-gray-900">{a.name}</p>
                          <p className="text-xs text-gray-400">{a.email}</p>
                        </td>
                        <td className="px-5 py-4 font-mono font-semibold text-gray-900 tracking-wider">{a.discountCode}</td>
                        <td className="px-5 py-4 text-gray-500">{stats.orders}</td>
                        <td className="px-5 py-4 text-gray-700">{currencyFmt.format(stats.revenue)}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${a.active ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"}`}>
                            {a.active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 justify-end">
                            <button
                              onClick={() => toggleActive(a)}
                              className="text-gray-400 hover:text-gray-700 transition-colors"
                              title={a.active ? "Deactivate" : "Activate"}
                            >
                              {a.active ? <ToggleRight className="w-5 h-5 text-green-500" /> : <ToggleLeft className="w-5 h-5" />}
                            </button>
                            <button
                              onClick={() => openEdit(a)}
                              className="text-xs text-gray-300 hover:text-gray-700 transition-colors"
                              title="Edit"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => { setConfirmDelete(a.id); setDeleteError(""); }}
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

      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-6 sm:pb-0"
          >
            <div className="absolute inset-0 bg-black/40" onClick={closeDeleteModal} />
            <motion.div
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 16, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4"
            >
              <div>
                <p className="text-sm font-semibold text-gray-900">Delete affiliate?</p>
                <p className="text-xs text-gray-500 mt-1">This action cannot be undone. Their login will stop working immediately.</p>
              </div>
              {deleteError && (
                <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{deleteError}</p>
              )}
              <div className="flex gap-2 justify-end pt-1">
                <button onClick={closeDeleteModal} className="h-10 px-5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button onClick={handleDelete} disabled={deleting} className="h-10 px-5 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50">
                  {deleting ? "Deleting…" : "Delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
