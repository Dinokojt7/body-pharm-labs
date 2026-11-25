import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { priceOrder } from "@/lib/services/order-pricing";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, metadata, reference } = body;

    // The amount is never taken from the browser: load the order and price it
    // from Firestore (products, membership, discount code).
    const orderId = metadata?.orderId;
    if (!orderId) {
      return NextResponse.json({ success: false, error: "Order required" }, { status: 400 });
    }
    const adminDb = getAdminDb();
    if (!adminDb) {
      console.error("Paystack init: Firebase Admin not configured");
      return NextResponse.json(
        { success: false, error: "Payment initialization failed" },
        { status: 500 },
      );
    }
    const orderSnap = await adminDb.collection("orders").doc(String(orderId)).get();
    if (!orderSnap.exists) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }
    const order = orderSnap.data();
    if (order.status !== "pending_payment") {
      return NextResponse.json(
        { success: false, error: "Order is not awaiting payment" },
        { status: 409 },
      );
    }

    let priced;
    try {
      priced = await priceOrder(adminDb, order);
    } catch (err) {
      return NextResponse.json({ success: false, error: err.message }, { status: 409 });
    }

    // If what the customer saw differs from the real price, stop rather than
    // charge an amount they didn't agree to.
    if (Math.abs(Number(order.total) - priced.total) > 0.01) {
      console.warn(
        `Paystack init: total mismatch on order ${orderId}: client ${order.total}, server ${priced.total}`,
      );
      return NextResponse.json(
        { success: false, error: "Prices have changed. Please refresh your cart and try again." },
        { status: 409 },
      );
    }
    const amount = priced.total;

    const response = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // kobo / cents — must be integer
          email: order.customer?.email || email,
          metadata: { ...metadata, orderId, expectedAmount: amount },
          currency: "ZAR",
          ...(reference && { reference }),
          callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/verify`,
        }),
      },
    );

    const data = await response.json();

    if (data.status) {
      return NextResponse.json({
        success: true,
        authorization_url: data.data.authorization_url,
        reference: data.data.reference,
      });
    } else {
      return NextResponse.json(
        { success: false, error: data.message },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("Paystack initialization error:", error);
    return NextResponse.json(
      { success: false, error: "Payment initialization failed" },
      { status: 500 },
    );
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const reference = searchParams.get("reference");

  if (!reference) {
    return NextResponse.json(
      { success: false, error: "Reference required" },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      },
    );

    const data = await response.json();

    if (data.status && data.data.status === "success") {
      return NextResponse.json({
        success: true,
        data: data.data,
      });
    } else {
      return NextResponse.json(
        { success: false, error: "Payment verification failed" },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("Paystack verification error:", error);
    return NextResponse.json(
      { success: false, error: "Verification failed" },
      { status: 500 },
    );
  }
}
