"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/lib/stores/auth-store";
import { isAdmin } from "@/lib/utils/admin";
import {
  getCategories,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
} from "@/lib/firebase/firestore";
import AdminHeader from "@/components/layout/AdminHeader";
import { Plus, Pencil, Trash2, AlertTriangle, Check, X } from "lucide-react";

export default function CategoriesPage() {
  const router = useRouter();
  const { user, loading } = useAuthStore();

  const [categories, setCategories] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [savingId, setSavingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    if (!loading && !isAdmin(user?.uid)) router.replace("/admin");
  }, [user, loading, router]);

  useEffect(() => {
    if (loading || !isAdmin(user?.uid)) return;
    load();
  }, [loading, user]);

  const load = async () => {
    setFetching(true);
    const { categories: data } = await getCategories();
    setCategories(data);
    setFetching(false);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) { setAddError("Name is required."); return; }
    if (categories.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      setAddError("A category with that name already exists."); return;
    }
    setAdding(true);
    setAddError("");
    const { error } = await adminCreateCategory(name);
    if (error) { setAddError(error); setAdding(false); return; }
    setNewName("");
    setAdding(false);
    load();
  };

  const handleToggle = async (cat) => {
    setTogglingId(cat.id);
    await adminUpdateCategory(cat.id, { active: !cat.active });
    setCategories((prev) => prev.map((c) => c.id === cat.id ? { ...c, active: !c.active } : c));
    setTogglingId(null);
  };

  const startEdit = (cat) => {
    setEditingId(cat.id);
    setEditName(cat.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  const handleSaveEdit = async (cat) => {
    const name = editName.trim();
    if (!name) return;
    if (name === cat.name) { cancelEdit(); return; }
    if (categories.some((c) => c.id !== cat.id && c.name.toLowerCase() === name.toLowerCase())) return;
    setSavingId(cat.id);
    await adminUpdateCategory(cat.id, { name });
    setCategories((prev) => prev.map((c) => c.id === cat.id ? { ...c, name } : c));
    setSavingId(null);
    cancelEdit();
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    await adminDeleteCategory(confirmDelete.id);
    setCategories((prev) => prev.filter((c) => c.id !== confirmDelete.id));
    setConfirmDelete(null);
  };

  if (loading || (!loading && !isAdmin(user?.uid))) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader backHref="/admin/dashboard" />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Categories</h1>
            <p className="text-xs text-gray-400 mt-0.5">{categories.length} total</p>
          </div>
        </div>

        {/* Add new */}
        <form onSubmit={handleAdd} className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex gap-2">
          <div className="flex-1">
            <input
              type="text"
              value={newName}
              onChange={(e) => { setNewName(e.target.value); setAddError(""); }}
              placeholder="New category name…"
              className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm text-gray-900 focus:outline-none focus:border-gray-400 bg-white"
            />
            {addError && <p className="text-xs text-red-500 mt-1.5">{addError}</p>}
          </div>
          <button
            type="submit"
            disabled={adding}
            className="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-gray-900 text-white text-xs font-semibold hover:bg-gray-700 transition-colors disabled:opacity-50 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            Add
          </button>
        </form>

        {/* List */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {fetching ? (
            <div className="py-16 text-center text-sm text-gray-400">Loading…</div>
          ) : categories.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm text-gray-400 mb-1">No categories yet</p>
              <p className="text-xs text-gray-400">Add one above to get started.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              <AnimatePresence initial={false}>
                {categories.map((cat) => (
                  <motion.li
                    key={cat.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.18 }}
                    className="flex items-center gap-3 px-4 py-3"
                  >
                    {/* Active toggle */}
                    <button
                      onClick={() => handleToggle(cat)}
                      disabled={togglingId === cat.id}
                      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-50 ${
                        cat.active ? "bg-gray-900" : "bg-gray-200"
                      }`}
                    >
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200 ${cat.active ? "translate-x-4" : "translate-x-0.5"}`} />
                    </button>

                    {/* Name / edit input */}
                    {editingId === cat.id ? (
                      <input
                        autoFocus
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") handleSaveEdit(cat); if (e.key === "Escape") cancelEdit(); }}
                        className="flex-1 h-8 px-2 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:border-gray-500"
                      />
                    ) : (
                      <span className={`flex-1 text-sm font-medium ${cat.active ? "text-gray-900" : "text-gray-400 line-through"}`}>
                        {cat.name}
                      </span>
                    )}

                    {/* Status badge */}
                    {editingId !== cat.id && (
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${cat.active ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                        {cat.active ? "Active" : "Inactive"}
                      </span>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      {editingId === cat.id ? (
                        <>
                          <button
                            onClick={() => handleSaveEdit(cat)}
                            disabled={savingId === cat.id}
                            className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-colors disabled:opacity-40"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(cat)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setConfirmDelete(cat)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </div>
      </div>

      {/* Delete confirm modal */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
          >
            <div className="absolute inset-0 bg-black/40" onClick={() => setConfirmDelete(null)} />
            <motion.div
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 12, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Delete category?</p>
                  <p className="text-xs text-gray-500 mt-1">
                    <span className="font-medium text-gray-700">"{confirmDelete.name}"</span> will be permanently removed. Products using this category won't be affected.
                  </p>
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-1">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="h-9 px-4 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="h-9 px-4 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
