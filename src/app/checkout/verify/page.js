"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, XCircle } from "lucide-react";

import { useCartStore } from "@/lib/stores/cart-store";
import { updateOrderPayment, getOrderById } from "@/lib/firebase/firestore";

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyPageInner />
    </Suspense>
  );
}

function VerifyPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const clearCart = useCartStore((s) => s.clearCart);

  const [error, setError] = useState("");

  useEffect(() => {
    const reference = searchParams.get("reference") || searchParams.get("trxref");

    if (!reference) {
      setError("No payment reference found.");
      return;
    }

    (async () => {
      try {
        // Verify server-side
        const res = await fetch(`/api/paystack?reference=${reference}`);
        const data = await res.json();

        const meta = data.data?.metadata || {};
        const orderId = meta.orderId;
        const orderNumber = meta.orderNumber;

        if (!orderId || !orderNumber) {
          setError("Order reference missing from payment. Contact support.");
          return;
        }

        if (data.success) {
          // Mark order paid
          await updateOrderPayment(orderId, {
            status: "paid",
            paystackReference: reference,
            paidAt: new Date().toISOString(),
          });

          // Send confirmation email (fire-and-forget)
          getOrderById(orderId).then(({ order }) => {
            if (!order) return;
            fetch("/api/send-order-email", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderNumber: order.orderNumber,
                email: order.customer?.email,
                firstName: order.customer?.firstName,
                items: order.items,
                total: order.total,
                currency: order.currency,
              }),
            }).catch(() => {});
          });

          clearCart();
          router.replace(`/checkout/success?order=${orderNumber}`);
        } else {
          // Payment not successful — mark failed
          await updateOrderPayment(orderId, { status: "payment_failed" }).catch(() => {});
          setError("Payment was not completed. You can try again from your account.");
        }
      } catch {
        setError("Something went wrong verifying your payment. Please contact support.");
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-6 h-6 text-red-500" />
          </div>
          <p className="text-sm font-semibold text-black mb-2">Payment Verification Failed</p>
          <p className="text-xs text-gray-500 mb-6">{error}</p>
          <a
            href="/account"
            className="inline-flex items-center justify-center h-10 px-6 rounded bg-black text-white text-xs font-semibold tracking-widest uppercase hover:bg-gray-800 transition-colors"
          >
            Go to Account
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400 mx-auto mb-4" />
        <p className="text-sm text-gray-500">Verifying your payment…</p>
      </div>
    </main>
  );
}
