// Server-only: recomputes what an order should cost from Firestore, so the
// amount charged never depends on figures the browser sent.
//
// Mirrors the checkout page maths (src/app/checkout/page.js):
//   total = subtotal − member 10% − promo % + shipping
// Both discounts are taken off the original subtotal, so BPL40 (40%) plus the
// member 10% comes to 50% off.

const MEMBER_RATE = 0.1;
const SHIPPING = 0; // checkout currently ships free

const round2 = (n) => Math.round(n * 100) / 100;

export async function priceOrder(adminDb, order) {
  if (!Array.isArray(order.items) || order.items.length === 0) {
    throw new Error("Order has no items");
  }

  let subtotal = 0;
  for (const item of order.items) {
    const qty = Number(item.quantity);
    if (!Number.isInteger(qty) || qty < 1 || qty > 1000) {
      throw new Error("Invalid quantity");
    }
    const snap = await adminDb.collection("products").doc(String(item.productId)).get();
    if (!snap.exists) throw new Error(`Product not found: ${item.name || item.productId}`);
    const product = snap.data();
    const unit = Number(
      (item.size && product.sizePrices && product.sizePrices[item.size]) || product.price,
    );
    if (!Number.isFinite(unit) || unit < 0) throw new Error("Invalid product price");
    subtotal += unit * qty;
  }
  subtotal = round2(subtotal);

  // Order creation is restricted by Firestore rules to userId == auth uid,
  // so the userId on the order is the real buyer.
  let memberDiscount = 0;
  if (order.userId) {
    const userSnap = await adminDb.collection("users").doc(order.userId).get();
    if (userSnap.exists && userSnap.data()?.membership?.active) {
      memberDiscount = subtotal * MEMBER_RATE;
    }
  }

  let promoDiscount = 0;
  if (order.discountCode) {
    const q = await adminDb
      .collection("discounts")
      .where("code", "==", String(order.discountCode).toUpperCase().trim())
      .limit(1)
      .get();
    const d = q.empty ? null : q.docs[0].data();
    const valid =
      d &&
      d.active &&
      !(d.expiresAt && d.expiresAt.toMillis() < Date.now()) &&
      !(d.maxUses != null && d.uses >= d.maxUses);
    if (!valid) throw new Error("Discount code is no longer valid");
    promoDiscount = round2(subtotal * (Number(d.value) / 100));
  }

  const total = round2(Math.max(0, subtotal - memberDiscount - promoDiscount + SHIPPING));
  return { subtotal, memberDiscount, promoDiscount, shipping: SHIPPING, total };
}
