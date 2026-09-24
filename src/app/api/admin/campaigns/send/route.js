import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { getAdminAuth } from "@/lib/firebase/admin";
import { isAdmin } from "@/lib/utils/admin";

const MAX_RECIPIENTS = 500;
const MAX_IMAGES = 6;
const SEND_DELAY_MS = 300;

// Give this route room to finish a large sequential batch instead of
// getting cut off mid-send (500 recipients × ~0.3-1s each can take minutes).
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

async function sendCampaignEmail(transporter, { name, email }, subject, message, images = []) {
  const firstName = name?.split(" ")[0] || "there";
  const imageBlocks = images.map((url) => `
            <div style="margin:0 0 16px;">
              <img src="${url}" alt="" width="456" style="display:block;width:100%;max-width:456px;height:auto;border-radius:6px;" />
            </div>`).join("");

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
            <p style="margin:0;color:rgba(255,255,255,0.5);font-size:10px;letter-spacing:0.22em;text-transform:uppercase;">Body Pharm Labs</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <p style="margin:0 0 20px;color:#111;font-size:14px;">Hi ${escapeHtml(firstName)},</p>
            <p style="margin:0 0 ${images.length ? "20" : "0"}px;color:#374151;font-size:13px;line-height:1.7;white-space:pre-wrap;">${escapeHtml(message)}</p>
            ${imageBlocks}
            <p style="margin:32px 0 0;color:#9ca3af;font-size:11px;text-align:center;line-height:1.5;">
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
    to: email,
    subject,
    html,
  });
}

export async function POST(request) {
  try {
    const adminAuth = getAdminAuth();
    if (!adminAuth) {
      return NextResponse.json({ success: false, error: "Service unavailable" }, { status: 503 });
    }

    const { idToken, subject, message, recipients, images } = await request.json();
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

    if (!subject?.trim() || !message?.trim()) {
      return NextResponse.json({ success: false, error: "Subject and message are required" }, { status: 400 });
    }
    if (!Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json({ success: false, error: "recipients is required" }, { status: 400 });
    }
    if (recipients.length > MAX_RECIPIENTS) {
      return NextResponse.json({ success: false, error: `Too many recipients in one send (max ${MAX_RECIPIENTS})` }, { status: 400 });
    }

    const safeImages = Array.isArray(images)
      ? images.filter((url) => typeof url === "string" && /^https?:\/\//.test(url)).slice(0, MAX_IMAGES)
      : [];

    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return NextResponse.json({ success: false, error: "Email not configured" }, { status: 503 });
    }

    const transporter = buildTransporter();

    // Sequential, paced sends — Gmail's SMTP relay throttles/rejects a burst
    // of near-simultaneous connections (421 4.3.0 "Temporary System Problem")
    // well before any documented daily quota is hit. One at a time with a
    // small gap keeps this under Gmail's radar.
    const results = [];
    for (const recipient of recipients) {
      if (!recipient?.email) {
        results.push({ email: recipient?.email || "", success: false, error: "Missing email" });
        continue;
      }
      try {
        await sendWithRetry(() => sendCampaignEmail(transporter, recipient, subject.trim(), message.trim(), safeImages));
        results.push({ email: recipient.email, success: true });
      } catch (err) {
        results.push({ email: recipient.email, success: false, error: err.message || "Failed to send" });
      }
      await new Promise((resolve) => setTimeout(resolve, SEND_DELAY_MS));
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error("[campaigns/send]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
