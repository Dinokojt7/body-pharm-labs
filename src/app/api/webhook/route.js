import { NextResponse } from "next/server";
import crypto from "crypto";

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
        // Dynamic import to avoid server-side Firebase client-SDK issues
        // Use REST API to update Firestore since this is server-side
        // We use the Paystack verification as the source of truth
        // The client already updates on success — this webhook acts as backup
        const verifyRes = await fetch(
          `https://api.paystack.co/transaction/verify/${reference}`,
          {
            headers: {
              Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            },
          },
        );
        const verifyData = await verifyRes.json();

        if (verifyData.status && verifyData.data.status === "success") {
          // Log confirmed payment — client-side already updated Firestore
          console.log(`Webhook: Payment confirmed for order ${orderId}, ref ${reference}`);
        }
      } catch (err) {
        console.error("Webhook processing error:", err);
      }
    }
  }

  // Always return 200 so Paystack stops retrying
  return NextResponse.json({ received: true });
}
