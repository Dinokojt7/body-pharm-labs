"use client";

import { motion, AnimatePresence } from "framer-motion";

/**
 * Custom confirm dialog — replaces window.confirm / window.alert.
 * Centered, rectangular, ~1/3 screen height, white container, black/20 border.
 * backdrop: white/30 overlay, no blur.
 */
export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
  onConfirm,
  onCancel,
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay — white/30, no blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-9998 bg-white/30"
            onClick={onCancel}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-9999 mx-auto max-w-sm"
          >
            <div
              className="bg-white border border-black/20 rounded-lg overflow-hidden flex flex-col"
              style={{ minHeight: "33vh" }}
            >
              {/* Body */}
              <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 text-center gap-3">
                <h2 className="text-base font-semibold text-black leading-snug">{title}</h2>
                {description && (
                  <p className="text-xs text-gray-500 leading-relaxed max-w-xs">{description}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex border-t border-gray-100">
                <button
                  onClick={onCancel}
                  className="flex-1 h-12 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors border-r border-gray-100"
                >
                  {cancelLabel}
                </button>
                <button
                  onClick={onConfirm}
                  className={`flex-1 h-12 text-sm font-semibold transition-colors ${
                    danger
                      ? "text-red-600 hover:bg-red-50"
                      : "text-black hover:bg-gray-50"
                  }`}
                >
                  {confirmLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
