import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { generateInvoicePdf } from "@/lib/pdf/invoice-generator";

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

export async function POST(request) {
  try {
    const {
      orderNumber, email, firstName, lastName, phone,
      shippingAddress, items, subtotal, tax, shipping,
      memberDiscount, total, currency, notes, paidAt,
    } = await request.json();

    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn("SMTP env vars not set — skipping order email");
      return NextResponse.json({ success: true, skipped: true });
    }

    const fmt = new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: currency || "ZAR",
    });

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bodypharmlabs.com";

    // ── PDF attachment ────────────────────────────────────────────────────────
    let pdfAttachment = null;
    try {
      const pdfBuffer = await generateInvoicePdf({
        orderNumber, items, subtotal, tax, shipping,
        memberDiscount, total, currency, firstName, lastName,
        shippingAddress, notes, paidAt,
      });
      pdfAttachment = {
        filename: `invoice-${orderNumber}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      };
    } catch (pdfErr) {
      console.warn("PDF generation failed, sending email without attachment:", pdfErr.message);
    }

    const attachments = pdfAttachment ? [pdfAttachment] : [];
    const transporter = buildTransporter();

    // ── Customer confirmation ─────────────────────────────────────────────────
    const itemRows = (items || []).map((item) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:13px;color:#111;">
          ${item.name}${item.size ? ` <span style="color:#9ca3af;font-size:11px;">— ${item.size}</span>` : ""}
        </td>
        <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:13px;color:#6b7280;text-align:center;">× ${item.quantity}</td>
        <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:13px;color:#111;text-align:right;font-weight:600;">${fmt.format(item.price * item.quantity)}</td>
      </tr>`).join("");

    const customerHtml = `
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
            <p style="margin:0 0 2px;color:#fff;font-size:22px;font-weight:700;">Order Confirmed</p>
            <p style="margin:0;color:rgba(255,255,255,0.55);font-size:13px;">Thank you, ${firstName}!</p>
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;border-bottom:1px solid #e5e7eb;padding:14px 32px;text-align:center;">
            <p style="margin:0;color:#6b7280;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;">Order Reference</p>
            <p style="margin:4px 0 0;color:#000;font-size:18px;font-weight:700;font-family:monospace,monospace;">${orderNumber}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <p style="margin:0 0 24px;color:#6b7280;font-size:13px;line-height:1.6;">
              Your order has been received and payment confirmed. We&rsquo;ll notify you when your order ships.
            </p>
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
                  <td colspan="2" style="padding-top:14px;font-size:12px;color:#6b7280;">Shipping</td>
                  <td style="padding-top:14px;font-size:12px;color:#6b7280;text-align:right;">${shipping === 0 ? "Free" : fmt.format(shipping)}</td>
                </tr>
                <tr>
                  <td colspan="2" style="padding-top:6px;font-size:12px;color:#6b7280;">VAT (15%)</td>
                  <td style="padding-top:6px;font-size:12px;color:#6b7280;text-align:right;">${fmt.format(tax)}</td>
                </tr>
                ${memberDiscount > 0 ? `<tr>
                  <td colspan="2" style="padding-top:6px;font-size:12px;color:#6b7280;">Member Discount</td>
                  <td style="padding-top:6px;font-size:12px;color:#6b7280;text-align:right;">−${fmt.format(memberDiscount)}</td>
                </tr>` : ""}
                <tr>
                  <td colspan="2" style="padding-top:12px;border-top:1px solid #e5e7eb;font-weight:700;font-size:14px;color:#000;">Total</td>
                  <td style="padding-top:12px;border-top:1px solid #e5e7eb;font-weight:700;font-size:14px;color:#000;text-align:right;">${fmt.format(total)}</td>
                </tr>
              </tfoot>
            </table>
            <div style="margin-top:32px;padding-top:24px;border-top:1px solid #f3f4f6;text-align:center;">
              <a href="${siteUrl}/track-order?ref=${orderNumber}"
                 style="display:inline-block;background:#000;color:#fff;text-decoration:none;padding:12px 28px;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;">
                Track Your Order
              </a>
            </div>
            <p style="margin:24px 0 0;color:#9ca3af;font-size:11px;text-align:center;line-height:1.5;">
              Questions? <a href="mailto:sales@bodypharmlabs.com" style="color:#000;text-decoration:underline;">sales@bodypharmlabs.com</a>
            </p>
            <p style="margin:8px 0 0;color:#d1d5db;font-size:10px;text-align:center;">
              All products are for research and laboratory use only.
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
      subject: `Order Confirmed — ${orderNumber} | Body Pharm Labs`,
      html: customerHtml,
      attachments,
    });

    // ── Owner notification ────────────────────────────────────────────────────
    const ownerEmail = process.env.CONTACT_EMAIL;
    if (ownerEmail) {
      const ownerItemRows = (items || []).map((item) => `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;font-size:13px;color:#111;">${item.name}${item.size ? ` — ${item.size}` : ""}</td>
          <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;font-size:13px;color:#6b7280;text-align:center;">× ${item.quantity}</td>
          <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;font-size:13px;color:#111;text-align:right;font-weight:600;">${fmt.format(item.price * item.quantity)}</td>
        </tr>`).join("");

      const addrLine = shippingAddress
        ? [shippingAddress.address, shippingAddress.city, shippingAddress.postalCode, shippingAddress.country].filter(Boolean).join(", ")
        : "";

      const ownerHtml = `
<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#fff;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
        <tr><td style="background:#000;padding:28px 32px;">
          <p style="margin:0;color:rgba(255,255,255,0.5);font-size:10px;letter-spacing:0.2em;text-transform:uppercase;">Body Pharm Labs</p>
          <p style="margin:6px 0 0;color:#fff;font-size:20px;font-weight:700;">New Order Received</p>
          <p style="margin:4px 0 0;color:rgba(255,255,255,0.55);font-size:13px;font-family:monospace;">${orderNumber}</p>
        </td></tr>
        <tr><td style="padding:28px 32px;">
          <p style="margin:0 0 4px;font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.1em;">Customer</p>
          <p style="margin:0 0 2px;font-size:14px;font-weight:600;color:#111;">${firstName} ${lastName || ""}</p>
          <p style="margin:0 0 2px;font-size:13px;color:#6b7280;">${email}</p>
          ${phone ? `<p style="margin:0 0 0;font-size:13px;color:#6b7280;">${phone}</p>` : ""}
          ${addrLine ? `
          <p style="margin:16px 0 4px;font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.1em;">Ship To</p>
          <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.5;">${addrLine}</p>` : ""}
          <p style="margin:20px 0 8px;font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.1em;">Items</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">${ownerItemRows}</table>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="font-size:12px;color:#6b7280;padding-top:6px;">Shipping</td>
                <td style="font-size:12px;color:#6b7280;text-align:right;padding-top:6px;">${shipping === 0 ? "Free" : fmt.format(shipping)}</td></tr>
            <tr><td style="font-size:12px;color:#6b7280;padding-top:4px;">VAT (15%)</td>
                <td style="font-size:12px;color:#6b7280;text-align:right;padding-top:4px;">${fmt.format(tax)}</td></tr>
            ${memberDiscount > 0 ? `<tr><td style="font-size:12px;color:#6b7280;padding-top:4px;">Member Discount</td>
                <td style="font-size:12px;color:#6b7280;text-align:right;padding-top:4px;">−${fmt.format(memberDiscount)}</td></tr>` : ""}
            <tr><td style="font-size:14px;font-weight:700;color:#000;padding-top:10px;border-top:1px solid #e5e7eb;">Total</td>
                <td style="font-size:14px;font-weight:700;color:#000;text-align:right;padding-top:10px;border-top:1px solid #e5e7eb;">${fmt.format(total)}</td></tr>
          </table>
          ${notes ? `<p style="margin:16px 0 4px;font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.1em;">Notes</p>
          <p style="margin:0;font-size:13px;color:#6b7280;font-style:italic;">${notes}</p>` : ""}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

      await transporter.sendMail({
        from: `"Body Pharm Labs" <${process.env.EMAIL_FROM || "info@bodypharmlabs.com"}>`,
        to: ownerEmail,
        subject: `New Order — ${orderNumber} | Body Pharm Labs`,
        html: ownerHtml,
        attachments,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[send-order-email]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
