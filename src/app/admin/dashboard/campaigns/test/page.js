"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/lib/stores/auth-store";
import { isAdmin } from "@/lib/utils/admin";
import { sendCampaignEmail } from "@/lib/services/campaign-service";
import { uploadCampaignImage } from "@/lib/firebase/storage";
import { ArrowLeft, Send, Image as ImageIcon, X, Loader2 } from "lucide-react";

const MAX_IMAGES = 6;
const TEST_RECIPIENT = { name: "Jacob", email: "jacobdinoko@gmail.com" };

// Debug-only page — not linked from the sidebar, reached by typing the URL
// directly. Drives the exact same sendCampaignEmail()/send route as the real
// Campaigns page, just hardcoded to one recipient, so we can isolate whether
// a failure is about the recipient count or something else. Dumps the raw
// API response in full so it can be copy-pasted back for diagnosis.
export default function CampaignsTestPage() {
  const router = useRouter();
  const { user, loading } = useAuthStore();

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [images, setImages] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [sending, setSending] = useState(false);
  const [rawResponse, setRawResponse] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!loading && !isAdmin(user?.uid)) router.replace("/admin");
  }, [user, loading, router]);

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (images.length >= MAX_IMAGES) {
      setUploadError(`You can attach up to ${MAX_IMAGES} images.`);
      return;
    }

    setUploadingImage(true);
    setUploadError("");
    const { url, error } = await uploadCampaignImage(file);
    setUploadingImage(false);

    if (error) {
      setUploadError(error);
      return;
    }
    setImages((prev) => [...prev, url]);
  };

  const removeImage = (url) => {
    setImages((prev) => prev.filter((u) => u !== url));
  };

  const handleSend = async () => {
    setConfirming(false);
    setSending(true);
    setRawResponse(null);
    const response = await sendCampaignEmail({
      subject: subject.trim(),
      message: message.trim(),
      recipients: [TEST_RECIPIENT],
      images,
    });
    setSending(false);
    setRawResponse(response);
  };

  if (loading || (!loading && !isAdmin(user?.uid))) return null;

  return (
    <>
      <div className="sticky top-20 md:top-24 z-20 bg-gray-50 border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">
          <Link href="/admin/dashboard/campaigns" className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="text-sm font-semibold text-gray-900">Campaigns — Test Send</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Fixed recipient (no audience picker) */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Send to</p>
          <div className="px-3 py-2 rounded-lg border border-gray-100 bg-gray-50 flex items-center justify-between gap-3 text-xs">
            <span className="text-gray-700 font-medium">{TEST_RECIPIENT.name}</span>
            <span className="text-gray-400">{TEST_RECIPIENT.email}</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-2">Hardcoded for this test page — always sends to this one address only.</p>
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

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Images (optional) — {images.length}/{MAX_IMAGES}
            </label>

            {images.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-3">
                {images.map((url) => (
                  <div key={url} className="relative w-20 h-20 rounded-lg border border-gray-200 bg-gray-50 overflow-hidden shrink-0">
                    <Image src={url} alt="" fill className="object-cover" unoptimized />
                    <button
                      type="button"
                      onClick={() => removeImage(url)}
                      className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm hover:bg-red-50 z-10"
                    >
                      <X className="w-3 h-3 text-gray-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImage || images.length >= MAX_IMAGES}
              className="flex items-center gap-1.5 h-9 px-4 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {uploadingImage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImageIcon className="w-3.5 h-3.5" />}
              {uploadingImage ? "Uploading…" : "Add image"}
            </button>
            {uploadError && <p className="text-xs text-red-500 mt-2">{uploadError}</p>}
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setConfirming(true)}
              disabled={sending || !subject.trim() || !message.trim()}
              className="flex items-center gap-1.5 h-9 px-5 rounded-lg bg-gray-900 text-white text-xs font-semibold hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="w-3.5 h-3.5" />
              {sending ? "Sending…" : "Send test"}
            </button>
          </div>
        </div>

        {/* Raw response — the whole point of this page */}
        {rawResponse && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Raw API response</p>
            <pre className="text-[11px] text-gray-700 bg-gray-50 border border-gray-100 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap break-all">
{JSON.stringify(rawResponse, null, 2)}
            </pre>
          </div>
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
                <p className="text-sm font-semibold text-gray-900">Send this test email to {TEST_RECIPIENT.email}?</p>
                <p className="text-xs text-gray-500 mt-1">This sends a real email immediately.</p>
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
