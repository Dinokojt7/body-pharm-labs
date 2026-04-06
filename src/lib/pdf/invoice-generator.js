import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

const BLACK = rgb(0, 0, 0);
const DARK_GRAY = rgb(0.25, 0.25, 0.25);
const MID_GRAY = rgb(0.55, 0.55, 0.55);
const LIGHT_GRAY = rgb(0.85, 0.85, 0.85);
const GOLD = rgb(0.72, 0.54, 0.16); // #b8892a

function formatCurrency(amount, currency = "ZAR") {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency,
  }).format(amount);
}

export async function generateInvoicePdf(order) {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595, 842]); // A4
  const { width, height } = page.getSize();

  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const regular = await doc.embedFont(StandardFonts.Helvetica);

  const margin = 48;
  let y = height - margin;

  // ── Header bar ──────────────────────────────────────────────────────────────
  page.drawRectangle({ x: 0, y: height - 90, width, height: 90, color: BLACK });

  page.drawText("BODY PHARM LABS", {
    x: margin,
    y: height - 38,
    size: 14,
    font: bold,
    color: rgb(1, 1, 1),
  });

  page.drawText("Leader In The Peptide Industry", {
    x: margin,
    y: height - 56,
    size: 8,
    font: regular,
    color: rgb(1, 1, 1, 0.55),
  });

  page.drawText("TAX INVOICE", {
    x: width - margin - bold.widthOfTextAtSize("TAX INVOICE", 14),
    y: height - 38,
    size: 14,
    font: bold,
    color: GOLD,
  });

  page.drawText("bodypharmlabs.com", {
    x: width - margin - regular.widthOfTextAtSize("bodypharmlabs.com", 8),
    y: height - 56,
    size: 8,
    font: regular,
    color: rgb(1, 1, 1, 0.55),
  });

  y = height - 90 - 28;

  // ── Gold rule ────────────────────────────────────────────────────────────────
  page.drawRectangle({ x: margin, y: y - 2, width: width - margin * 2, height: 1.5, color: GOLD });
  y -= 20;

  // ── Order meta row ───────────────────────────────────────────────────────────
  const metaItems = [
    ["Order Number", order.orderNumber],
    ["Date", new Date(order.paidAt || Date.now()).toLocaleDateString("en-ZA", { day: "2-digit", month: "long", year: "numeric" })],
    ["Status", "PAID"],
  ];

  metaItems.forEach(([label, value], i) => {
    const colX = margin + i * 170;
    page.drawText(label.toUpperCase(), { x: colX, y, size: 7, font: regular, color: MID_GRAY });
    page.drawText(value, { x: colX, y: y - 14, size: 10, font: bold, color: label === "Status" ? GOLD : BLACK });
  });

  y -= 44;
  page.drawRectangle({ x: margin, y, width: width - margin * 2, height: 0.5, color: LIGHT_GRAY });
  y -= 24;

  // ── Bill to / Ship to ────────────────────────────────────────────────────────
  const col1 = margin;
  const col2 = margin + 240;

  page.drawText("BILL TO / SHIP TO", { x: col1, y, size: 7, font: regular, color: MID_GRAY });
  page.drawText("CONTACT", { x: col2, y, size: 7, font: regular, color: MID_GRAY });
  y -= 14;

  const { customer = {}, shippingAddress = {} } = order;
  const fullName = `${customer.firstName || ""} ${customer.lastName || ""}`.trim();

  const addressLines = [
    fullName,
    shippingAddress.address,
    [shippingAddress.city, shippingAddress.postalCode].filter(Boolean).join(", "),
    shippingAddress.country,
  ].filter(Boolean);

  const contactLines = [
    customer.email,
    customer.phone,
  ].filter(Boolean);

  addressLines.forEach((line) => {
    page.drawText(line, { x: col1, y, size: 9, font: line === fullName ? bold : regular, color: BLACK });
    y -= 13;
  });

  const contactStartY = y + addressLines.length * 13 - 14;
  contactLines.forEach((line, i) => {
    page.drawText(line, {
      x: col2,
      y: contactStartY - i * 13,
      size: 9,
      font: regular,
      color: DARK_GRAY,
    });
  });

  y -= 20;
  page.drawRectangle({ x: margin, y, width: width - margin * 2, height: 0.5, color: LIGHT_GRAY });
  y -= 18;

  // ── Items table header ───────────────────────────────────────────────────────
  page.drawRectangle({ x: margin, y: y - 4, width: width - margin * 2, height: 20, color: rgb(0.95, 0.95, 0.95) });

  const cols = { item: margin + 6, qty: 360, unit: 420, total: width - margin - 6 };

  page.drawText("ITEM", { x: cols.item, y: y + 2, size: 7, font: bold, color: DARK_GRAY });
  page.drawText("QTY", { x: cols.qty, y: y + 2, size: 7, font: bold, color: DARK_GRAY });
  page.drawText("UNIT PRICE", { x: cols.unit, y: y + 2, size: 7, font: bold, color: DARK_GRAY });
  page.drawText("TOTAL", {
    x: cols.total - bold.widthOfTextAtSize("TOTAL", 7),
    y: y + 2,
    size: 7,
    font: bold,
    color: DARK_GRAY,
  });

  y -= 18;

  // ── Items ────────────────────────────────────────────────────────────────────
  (order.items || []).forEach((item, i) => {
    if (i % 2 === 1) {
      page.drawRectangle({ x: margin, y: y - 4, width: width - margin * 2, height: 18, color: rgb(0.98, 0.98, 0.98) });
    }

    const itemName = item.size ? `${item.name} — ${item.size}` : item.name;
    const lineTotal = item.price * item.quantity;

    page.drawText(itemName, { x: cols.item, y: y + 2, size: 9, font: regular, color: BLACK });
    page.drawText(String(item.quantity), { x: cols.qty, y: y + 2, size: 9, font: regular, color: DARK_GRAY });
    page.drawText(formatCurrency(item.price, order.currency), { x: cols.unit, y: y + 2, size: 9, font: regular, color: DARK_GRAY });
    const lineTotalStr = formatCurrency(lineTotal, order.currency);
    page.drawText(lineTotalStr, {
      x: cols.total - regular.widthOfTextAtSize(lineTotalStr, 9),
      y: y + 2,
      size: 9,
      font: regular,
      color: BLACK,
    });

    y -= 18;
  });

  y -= 8;
  page.drawRectangle({ x: margin, y, width: width - margin * 2, height: 0.5, color: LIGHT_GRAY });
  y -= 16;

  // ── Totals ───────────────────────────────────────────────────────────────────
  const totalsX = width - margin - 180;
  const valueX = width - margin;

  const totalsRows = [
    ["Subtotal", order.subtotal],
    ...(order.memberDiscount > 0 ? [["Member Discount (10%)", -order.memberDiscount]] : []),
    ["Shipping", order.shipping === 0 ? null : order.shipping],
    ["VAT (15%)", order.tax],
  ];

  totalsRows.forEach(([label, amount]) => {
    const valStr = amount === null ? "Free" : formatCurrency(amount, order.currency);
    page.drawText(label, { x: totalsX, y, size: 9, font: regular, color: DARK_GRAY });
    page.drawText(valStr, {
      x: valueX - regular.widthOfTextAtSize(valStr, 9),
      y,
      size: 9,
      font: regular,
      color: DARK_GRAY,
    });
    y -= 14;
  });

  y -= 4;
  page.drawRectangle({ x: totalsX, y, width: 180, height: 0.5, color: BLACK });
  y -= 14;

  const totalStr = formatCurrency(order.total, order.currency);
  page.drawText("TOTAL", { x: totalsX, y, size: 10, font: bold, color: BLACK });
  page.drawText(totalStr, {
    x: valueX - bold.widthOfTextAtSize(totalStr, 10),
    y,
    size: 10,
    font: bold,
    color: BLACK,
  });

  // ── Notes ────────────────────────────────────────────────────────────────────
  if (order.notes) {
    y -= 32;
    page.drawText("NOTES", { x: margin, y, size: 7, font: regular, color: MID_GRAY });
    y -= 13;
    page.drawText(order.notes, { x: margin, y, size: 9, font: regular, color: DARK_GRAY });
  }

  // ── Footer ───────────────────────────────────────────────────────────────────
  const footerY = 36;
  page.drawRectangle({ x: 0, y: footerY - 4, width, height: 0.5, color: LIGHT_GRAY });
  page.drawText("All products are for research and laboratory use only.  ·  sales@bodypharmlabs.com", {
    x: margin,
    y: footerY - 18,
    size: 7,
    font: regular,
    color: MID_GRAY,
  });

  const bytes = await doc.save();
  return Buffer.from(bytes);
}
