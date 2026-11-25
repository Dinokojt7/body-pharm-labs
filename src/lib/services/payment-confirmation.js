// Server-only: the single place an order is marked paid (or failed).
// Called from the verify endpoint (GET /api/paystack) and the Paystack
// webhook. Customers can no longer change order status from the browser
// (see firestore.rules), so this is the only path to "paid".
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";

const PAYABLE = ["pending", "pending_payment", "payment_failed"];

export async function verifyWithPaystack(reference) {
  const res = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } },
  );
  return res.json();
}

// tx: the `data` object of a Paystack verify response.
// Returns { paid: boolean, error?: string }.
export async function applyPaymentToOrder(tx) {
  const orderId = tx?.metadata?.orderId;
  if (!orderId) return { paid: false, error: "No order on this payment" };

  const adminDb = getAdminDb();
  if (!adminDb) throw new Error("Firebase Admin not configured");

  const orderRef = adminDb.collection("orders").doc(String(orderId));
  const succeeded = tx.status === "success";

  return adminDb.runTransaction(async (t) => {
    const snap = await t.get(orderRef);
    if (!snap.exists) return { paid: false, error: "Order not found" };
    const order = snap.data();

    // Already confirmed (e.g. webhook beat the redirect): nothing to do.
    if (order.paymentStatus === "paid") {
      return order.paystackReference === tx.reference
        ? { paid: true }
        : { paid: false, error: "Order already paid with a different payment" };
    }

    if (!succeeded) {
      if (order.status === "pending" || order.status === "pending_payment") {
        t.update(orderRef, {
          paymentStatus: "payment_failed",
          status: "payment_failed",
          statusHistory: FieldValue.arrayUnion({
            status: "payment_failed",
            timestamp: new Date(),
            note: "Payment failed",
          }),
          updatedAt: new Date(),
        });
      }
      return { paid: false, error: "Payment was not completed" };
    }

    if (!PAYABLE.includes(order.status)) {
      return { paid: false, error: "Order is not awaiting payment" };
    }

    // expectedAmount is set by our server when the payment is started, so it
    // can't be lowered by the customer.
    const expectedCents = Math.round(Number(tx.metadata.expectedAmount) * 100);
    if (!Number.isFinite(expectedCents) || tx.amount !== expectedCents || tx.currency !== "ZAR") {
      console.error(
        `Payment mismatch on order ${orderId}: paid ${tx.amount} ${tx.currency}, expected ${expectedCents} ZAR`,
      );
      t.update(orderRef, {
        paymentStatus: "amount_mismatch",
        statusHistory: FieldValue.arrayUnion({
          status: "amount_mismatch",
          timestamp: new Date(),
          note: `Paid ${tx.amount / 100} ${tx.currency}, expected ${expectedCents / 100} ZAR — check before fulfilling`,
        }),
        updatedAt: new Date(),
      });
      return { paid: false, error: "Payment amount did not match the order" };
    }

    // Count the discount use here: customers can't write to discounts, so
    // the old browser-side increment never actually landed. (Read before any
    // write: Firestore transactions require it.)
    const dq = order.discountCode
      ? await t.get(
          adminDb
            .collection("discounts")
            .where("code", "==", String(order.discountCode).toUpperCase().trim())
            .limit(1),
        )
      : null;

    const paidAt = tx.paid_at || new Date().toISOString();
    t.update(orderRef, {
      paymentStatus: "paid",
      status: "processing",
      paystackReference: tx.reference,
      paidAt,
      statusHistory: FieldValue.arrayUnion({
        status: "paid",
        timestamp: new Date(),
        note: "Payment confirmed",
      }),
      updatedAt: new Date(),
    });

    if (dq && !dq.empty) t.update(dq.docs[0].ref, { uses: FieldValue.increment(1) });

    return { paid: true };
  });
}
