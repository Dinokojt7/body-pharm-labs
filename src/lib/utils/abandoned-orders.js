// Shared "abandoned order" definition — no field or webhook marks an order as
// abandoned; it's derived: never paid, and old enough that the customer isn't
// just mid-payment right now. Used by both the Orders admin page (reminder
// sends) and the Campaigns page (an audience to email).
export const ABANDONED_THRESHOLD_MS = 2 * 60 * 60 * 1000; // 2 hours

// Groups by customer email since a repeat-abandoner creates a fresh order doc
// every attempt — the most recent order per email is the "representative"
// (drives display, reminder status, and which order id gets emailed/marked).
export function groupAbandonedOrders(orders, thresholdMs = ABANDONED_THRESHOLD_MS) {
  const cutoff = Date.now() - thresholdMs;
  const candidates = orders.filter((o) => {
    if (o.paymentStatus === "paid") return false;
    const createdMs = o.createdAt?.toMillis?.() ?? new Date(o.createdAt ?? 0).getTime();
    return createdMs > 0 && createdMs < cutoff;
  });

  const byEmail = new Map();
  for (const o of candidates) {
    const email = (o.customer?.email || o.email || "").toLowerCase();
    if (!email) continue;
    if (!byEmail.has(email)) byEmail.set(email, []);
    byEmail.get(email).push(o);
  }

  return Array.from(byEmail.entries())
    .map(([email, ordersForEmail]) => {
      const sorted = ordersForEmail
        .slice()
        .sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
      return { email, representative: sorted[0], orders: sorted };
    })
    .sort((a, b) => (b.representative.createdAt?.toMillis?.() ?? 0) - (a.representative.createdAt?.toMillis?.() ?? 0));
}
