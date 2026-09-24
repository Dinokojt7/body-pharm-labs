import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { isAdmin } from "@/lib/utils/admin";

const MAX_BATCH = 200;
const SEND_DELAY_MS = 300;

// Give this route room to finish a large sequential batch instead of
// getting cut off mid-send.
export const maxDuration = 300;

function buildTransporter() {
  const port = Number(process.env.SMTP_PORT) || 587;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    family: 4,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

function isTransient(err) {
  const code = err?.responseCode;
  return (code && code >= 400 && code < 500) || /temporary|try again|421|450|451|452/i.test(err?.message || "");
}

async function sendWithRetry(fn, retries = 2, backoffMs = 2000) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt >= retries || !isTransient(err)) throw err;
      await new Promise((resolve) => setTimeout(resolve, backoffMs * (attempt + 1)));
    }
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function formatAmount(amount, order) {
  const rate = order.exchangeRate || 1;
  const currency = order.currency || "ZAR";
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency }).format((amount ?? 0) * rate);
}

async function sendReminderEmail(transporter, order, siteUrl, note) {
  const firstName = order.customer?.firstName || order.firstName || "there";
  const itemRows = (order.items || []).map((item) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:13px;color:#111;">
        ${item.name}${item.size ? ` <span style="color:#9ca3af;font-size:11px;">— ${item.size}</span>` : ""}
      </td>
      <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:13px;color:#6b7280;text-align:center;">× ${item.quantity}</td>
      <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:13px;color:#111;text-align:right;font-weight:600;">${formatAmount(item.price * item.quantity, order)}</td>
    </tr>`).join("");

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#fff;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
        <tr>
          <td style="background:#000;padding:36px 32px;text-align:center;">
            <p style="margin:0 0 6px;color:rgba(255,255,255,0.5);font-size:10px;letter-spacing:0.22em;text-transform:uppercase;">Body Pharm Labs</p>
            <p style="margin:0 0 2px;color:#fff;font-size:22px;font-weight:700;">Still thinking it over?</p>
            <p style="margin:0;color:rgba(255,255,255,0.55);font-size:13px;">Hi ${firstName}, your order wasn't completed</p>
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;border-bottom:1px solid #e5e7eb;padding:14px 32px;text-align:center;">
            <p style="margin:0;color:#6b7280;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;">Order Reference</p>
            <p style="margin:4px 0 0;color:#000;font-size:18px;font-weight:700;font-family:monospace,monospace;">${order.orderNumber || ""}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <p style="margin:0 0 24px;color:#6b7280;font-size:13px;line-height:1.6;">
              Looks like your order wasn't completed — no charge was made. Here's what you were looking at, in case you'd like to pick it back up.
            </p>
            ${note ? `
            <div style="margin:0 0 24px;padding:14px 16px;background:#fdf6e3;border:1px solid #f0e0b0;border-radius:6px;">
              <p style="margin:0;color:#7a5508;font-size:13px;line-height:1.6;white-space:pre-wrap;">${escapeHtml(note)}</p>
            </div>` : ""}
            <table width="100%" cellpadding="0" cellspacing="0">
              <thead>
                <tr>
                  <th style="text-align:left;font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:#9ca3af;padding-bottom:8px;border-bottom:1px solid #e5e7eb;font-weight:600;">Item</th>
                  <th style="text-align:center;font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:#9ca3af;padding-bottom:8px;border-bottom:1px solid #e5e7eb;font-weight:600;">Qty</th>
                  <th style="text-align:right;font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:#9ca3af;padding-bottom:8px;border-bottom:1px solid #e5e7eb;font-weight:600;">Price</th>
                </tr>
              </thead>
              <tbody>${itemRows}</tbody>
              <tfoot>
                <tr>
                  <td colspan="2" style="padding-top:14px;font-weight:700;font-size:14px;color:#000;">Total</td>
                  <td style="padding-top:14px;font-weight:700;font-size:14px;color:#000;text-align:right;">${formatAmount(order.total, order)}</td>
                </tr>
              </tfoot>
            </table>
            <div style="margin-top:32px;padding-top:24px;border-top:1px solid #f3f4f6;text-align:center;">
              <a href="${siteUrl}/shop"
                 style="display:inline-block;background:#000;color:#fff;text-decoration:none;padding:12px 28px;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;">
                Continue Shopping
              </a>
              <p style="margin:16px 0 0;">
                <a href="${siteUrl}/track-order?ref=${order.orderNumber || ""}" style="color:#6b7280;font-size:12px;text-decoration:underline;">Check your order status</a>
              </p>
            </div>
            <p style="margin:24px 0 0;color:#9ca3af;font-size:11px;text-align:center;line-height:1.5;">
              Questions? <a href="mailto:info@bodypharmlabs.com" style="color:#000;text-decoration:underline;">info@bodypharmlabs.com</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  await transporter.sendMail({
    from: `"Body Pharm Labs" <${process.env.EMAIL_FROM || "info@bodypharmlabs.com"}>`,
    to: order.customer?.email || order.email,
    subject: `Still thinking it over? Your order is waiting${order.orderNumber ? ` — ${order.orderNumber}` : ""}`,
    html,
  });
}

export async function POST(request) {
  try {
    const adminAuth = getAdminAuth();
    const adminDb = getAdminDb();
    if (!adminAuth || !adminDb) {
      return NextResponse.json({ success: false, error: "Service unavailable" }, { status: 503 });
    }

    const { idToken, orderIds, note } = await request.json();
    if (!idToken) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }

    let decoded;
    try {
      decoded = await adminAuth.verifyIdToken(idToken);
    } catch {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }

    if (!isAdmin(decoded.uid)) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json({ success: false, error: "orderIds is required" }, { status: 400 });
    }
    if (orderIds.length > MAX_BATCH) {
      return NextResponse.json({ success: false, error: `Too many orders in one batch (max ${MAX_BATCH})` }, { status: 400 });
    }

    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return NextResponse.json({ success: false, error: "Email not configured" }, { status: 503 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bodypharmlabs.com";
    const transporter = buildTransporter();
    const { Timestamp } = await import("firebase-admin/firestore");

    // Sequential, paced sends — Gmail's SMTP relay throttles/rejects a burst
    // of near-simultaneous connections (421 4.3.0 "Temporary System Problem")
    // well before any documented daily quota is hit. One at a time with a
    // small gap keeps this under Gmail's radar.
    const results = [];
    for (const orderId of orderIds) {
      const snap = await adminDb.collection("orders").doc(orderId).get();
      if (!snap.exists) {
        results.push({ orderId, success: false, error: "Order not found" });
        continue;
      }
      const order = snap.data();

      if (order.paymentStatus === "paid") {
        results.push({ orderId, success: false, error: "Already paid" });
        continue;
      }
      const email = order.customer?.email || order.email;
      if (!email) {
        results.push({ orderId, success: false, error: "No email on file" });
        continue;
      }

      try {
        await sendWithRetry(() => sendReminderEmail(transporter, order, siteUrl, note));
        await snap.ref.update({ reminderSentAt: Timestamp.now() });
        results.push({ orderId, success: true });
      } catch (err) {
        results.push({ orderId, success: false, error: err.message || "Failed to send" });
      }

      await new Promise((resolve) => setTimeout(resolve, SEND_DELAY_MS));
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error("[orders/send-reminders]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
