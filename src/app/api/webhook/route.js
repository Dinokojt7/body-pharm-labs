import { NextResponse } from "next/server";
import crypto from "crypto";
import { verifyWithPaystack, applyPaymentToOrder } from "@/lib/services/payment-confirmation";

export async function POST(request) {
  const signature = request.headers.get("x-paystack-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 401 });
  }

  // Read raw body for signature verification
  const rawBody = await request.text();

  const expectedSig = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY || "")
    .update(rawBody)
    .digest("hex");

  if (expectedSig !== signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (event.event === "charge.success") {
    const { reference, metadata } = event.data;
    const orderId = metadata?.orderId;

    if (orderId) {
      try {
        // Re-verify with Paystack as the source of truth, then mark the order
        // paid. Safe to run alongside the verify page: it's idempotent.
        const verifyData = await verifyWithPaystack(reference);
        if (verifyData.status && verifyData.data?.status === "success") {
          const result = await applyPaymentToOrder(verifyData.data);
          console.log(
            `Webhook: order ${orderId}, ref ${reference}: ${result.paid ? "paid" : result.error}`,
          );
        }
      } catch (err) {
        console.error("Webhook processing error:", err);
      }
    }
  }

  // Always return 200 so Paystack stops retrying
  return NextResponse.json({ received: true });
}
