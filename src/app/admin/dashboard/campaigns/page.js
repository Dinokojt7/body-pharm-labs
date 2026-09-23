"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/lib/stores/auth-store";
import { isAdmin } from "@/lib/utils/admin";
import { adminGetMembers, adminGetAllOrders } from "@/lib/firebase/firestore";
import { groupAbandonedOrders } from "@/lib/utils/abandoned-orders";
import { sendCampaignEmail, getAllRegisteredUsers } from "@/lib/services/campaign-service";
import { ArrowLeft, Send } from "lucide-react";

const AUDIENCES = [
  { key: "members", label: "Members" },
  { key: "paid", label: "Paid Orders" },
  { key: "abandoned", label: "Abandoned Orders" },
  { key: "all_users", label: "All Registered Users" },
];

export default function CampaignsPage() {
  const router = useRouter();
  const { user, loading } = useAuthStore();

  const [members, setMembers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [fetchErrors, setFetchErrors] = useState({});
  const [fetching, setFetching] = useState(true);
  const [audience, setAudience] = useState("members");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [sending, setSending] = useState(false);
  const [results, setResults] = useState(null); // { sent, failed: [{email, error}] } | null

  useEffect(() => {
    if (!loading && !isAdmin(user?.uid)) router.replace("/admin");
  }, [user, loading, router]);

  useEffect(() => {
    if (loading || !isAdmin(user?.uid)) return;
    Promise.all([adminGetMembers(), adminGetAllOrders(), getAllRegisteredUsers()]).then(([m, o, u]) => {
      setMembers(m.members);
      setOrders(o.orders);
      setAllUsers(u.users || []);
      // Never assume success — a permission error comes back as an empty
      // array with an error message, not a thrown exception, so surface it
      // instead of silently showing "no recipients."
      setFetchErrors({ members: m.error, orders: o.error, allUsers: u.success ? null : u.error });
      setFetching(false);
    });
  }, [user, loading]);

  const recipients = useMemo(() => {
    if (audience === "members") {
      return members
        .filter((m) => m.email)
        .map((m) => ({ name: m.displayName || "", email: m.email }));
    }

    if (audience === "paid") {
      const paid = orders.filter((o) => o.paymentStatus === "paid");
      const byEmail = new Map();
      for (const o of paid) {
        const email = (o.customer?.email || o.email || "").toLowerCase();
        if (!email) continue;
        const createdMs = o.createdAt?.toMillis?.() ?? 0;
        const existing = byEmail.get(email);
        if (!existing || createdMs > existing.createdMs) {
          const name = `${o.customer?.firstName || o.firstName || ""} ${o.customer?.lastName || o.lastName || ""}`.trim();
          byEmail.set(email, { name, email, createdMs });
        }
      }
      return Array.from(byEmail.values());
    }

    if (audience === "abandoned") {
      return groupAbandonedOrders(orders).map((g) => {
        const o = g.representative;
        const name = `${o.customer?.firstName || o.firstName || ""} ${o.customer?.lastName || o.lastName || ""}`.trim();
        return { name, email: g.email };
      });
    }

    // all_users — already {uid, email, name} from the Auth-listing route
    return allUsers.filter((u) => u.email);
  }, [audience, members, orders, allUsers]);

  const handleSend = async () => {
    setConfirming(false);
    setSending(true);
    setResults(null);
    const { success, results: apiResults, error } = await sendCampaignEmail({
      subject: subject.trim(),
      message: message.trim(),
      recipients,
    });
    setSending(false);

    if (!success) {
      setResults({ sent: 0, failed: recipients.map((r) => ({ email: r.email, error: error || "Request failed" })) });
      return;
    }
    const sent = apiResults.filter((r) => r.success).length;
    const failed = apiResults.filter((r) => !r.success);
    setResults({ sent, failed });
  };

  if (loading || (!loading && !isAdmin(user?.uid))) return null;

  return (
    <>
      <div className="sticky top-20 md:top-24 z-20 bg-gray-50 border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">
          <Link href="/admin/dashboard" className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="text-sm font-semibold text-gray-900">Campaigns</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {fetching ? (
          <div className="py-16 text-center text-sm text-gray-400">Loading…</div>
        ) : (
          <>
            {/* Audience picker */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Send to</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {AUDIENCES.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => { setAudience(key); setResults(null); }}
                    className={`h-8 px-4 rounded-lg text-xs font-medium transition-colors border ${
                      audience === key
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <p className="text-xs text-gray-500 mb-2">{recipients.length} recipient{recipients.length !== 1 ? "s" : ""}</p>

              {(() => {
                const relevantError =
                  audience === "members" ? fetchErrors.members :
                  audience === "all_users" ? fetchErrors.allUsers :
                  fetchErrors.orders;
                if (!relevantError) return null;
                return (
                  <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-2">
                    Couldn't load this audience: {relevantError}. This is usually a Firestore permissions issue, not empty data — check the deployed rules.
                  </p>
                );
              })()}

              <div className="max-h-40 overflow-y-auto rounded-lg border border-gray-100 bg-gray-50 divide-y divide-gray-100">
                {recipients.length === 0 ? (
                  <p className="text-xs text-gray-400 px-3 py-3">No recipients in this audience right now.</p>
                ) : (
                  recipients.map((r) => (
                    <div key={r.email} className="px-3 py-2 flex items-center justify-between gap-3 text-xs">
                      <span className="text-gray-700 font-medium truncate">{r.name || "—"}</span>
                      <span className="text-gray-400 break-all text-right">{r.email}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Compose */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. New arrivals this week"
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm text-gray-900 focus:outline-none focus:border-gray-400 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your message — plain text, line breaks are preserved."
                  rows={8}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 focus:outline-none focus:border-gray-400 bg-white resize-y"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setConfirming(true)}
                  disabled={sending || !subject.trim() || !message.trim() || recipients.length === 0}
                  className="flex items-center gap-1.5 h-9 px-5 rounded-lg bg-gray-900 text-white text-xs font-semibold hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Send className="w-3.5 h-3.5" />
                  {sending ? "Sending…" : `Send to ${recipients.length} recipient${recipients.length !== 1 ? "s" : ""}`}
                </button>
              </div>
            </div>

            {/* Results */}
            {results && (
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <p className="text-sm font-semibold text-gray-900 mb-2">
                  {results.sent} sent{results.failed.length > 0 ? `, ${results.failed.length} failed` : ""}
                </p>
                {results.failed.length > 0 && (
                  <div className="space-y-1 mt-2">
                    {results.failed.map((f) => (
                      <p key={f.email} className="text-xs text-red-500">
                        {f.email}: {f.error}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Confirm modal */}
      <AnimatePresence>
        {confirming && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-6 sm:pb-0"
          >
            <div className="absolute inset-0 bg-black/40" onClick={() => setConfirming(false)} />
            <motion.div
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 16, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4"
            >
              <div>
                <p className="text-sm font-semibold text-gray-900">Send this email to {recipients.length} people?</p>
                <p className="text-xs text-gray-500 mt-1">This sends immediately and can't be undone. Double-check the subject and message first.</p>
              </div>
              <div className="flex gap-2 justify-end pt-1">
                <button onClick={() => setConfirming(false)} className="h-10 px-5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button onClick={handleSend} className="h-10 px-5 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-700 transition-colors">
                  Send
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
