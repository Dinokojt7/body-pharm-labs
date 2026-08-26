"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuthStore } from "@/lib/stores/auth-store";
import { isAdmin } from "@/lib/utils/admin";
import { adminGetMembers } from "@/lib/firebase/firestore";
import AdminHeader from "@/components/layout/AdminHeader";
import { ArrowLeft } from "lucide-react";

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" });
}

export default function MembersPage() {
  const router = useRouter();
  const { user, loading } = useAuthStore();

  const [members, setMembers] = useState([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !isAdmin(user?.uid)) router.replace("/admin");
  }, [user, loading, router]);

  useEffect(() => {
    if (loading || !isAdmin(user?.uid)) return;
    adminGetMembers().then(({ members }) => {
      setMembers(members);
      setFetching(false);
    });
  }, [user, loading]);

  if (loading || (!loading && !isAdmin(user?.uid))) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />

      {/* Sticky sub-header — pinned right below AdminHeader; only the member
          list below scrolls underneath it. */}
      <div className="sticky top-20 md:top-24 z-20 bg-gray-50 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">
          <Link href="/admin/dashboard" className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-sm font-semibold text-gray-900">Members</h1>
            <p className="text-xs text-gray-400 mt-0.5">{members.length} total · 10% lifetime discount</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.08 }}
          className="bg-white rounded-xl border border-gray-200 overflow-hidden"
        >
          {fetching ? (
            <div className="py-16 text-center text-sm text-gray-400">Loading…</div>
          ) : members.length === 0 ? (
            <div className="py-16 text-center text-sm text-gray-400">No members yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["Name", "Email", "Phone", "Joined"].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {members.map((m) => (
                    <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4 font-semibold text-gray-900 whitespace-nowrap">{m.displayName || "—"}</td>
                      <td className="px-5 py-4 text-gray-500 whitespace-nowrap">{m.email || "—"}</td>
                      <td className="px-5 py-4 text-gray-500 whitespace-nowrap">{m.phoneNumber || "—"}</td>
                      <td className="px-5 py-4 text-gray-700 whitespace-nowrap">{formatDate(m.membership?.joinedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
