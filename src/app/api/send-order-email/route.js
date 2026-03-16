import { NextResponse } from "next/server";

export async function POST(request) {
  if (!process.env.RESEND_API_KEY) {
    // Email not configured — fail silently so checkout still completes
    return NextResponse.json({ success: true, skipped: true });
  }

  try {
    const { orderNumber, email, firstName, items, total, currency } =
      await request.json();

    const formatter = new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: currency || "ZAR",
    });

    const itemRows = (items || [])
      .map(
        (item) =>
          `<tr>
            <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;font-size:13px;">${item.name}${item.size ? ` — ${item.size}` : ""}</td>
            <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;font-size:13px;text-align:center;">× ${item.quantity}</td>
            <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;font-size:13px;text-align:right;">${formatter.format(item.price * item.quantity)}</td>
          </tr>`,
      )
      .join("");

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f9fafb;margin:0;padding:40px 16px;">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
    <div style="background:#000;padding:32px;text-align:center;">
      <p style="color:#fff;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;margin:0 0 8px;">Order Confirmed</p>
      <p style="color:#fff;font-size:22px;font-weight:700;margin:0;">Thank you, ${firstName}!</p>
    </div>
    <div style="padding:32px;">
      <p style="color:#6b7280;font-size:13px;margin:0 0 24px;">
        Your order <strong style="color:#000;font-family:monospace;">${orderNumber}</strong> has been received and payment confirmed. We'll update you when your order ships.
      </p>
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr>
            <th style="text-align:left;font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:#9ca3af;padding-bottom:8px;border-bottom:1px solid #e5e7eb;">Item</th>
            <th style="text-align:center;font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:#9ca3af;padding-bottom:8px;border-bottom:1px solid #e5e7eb;">Qty</th>
            <th style="text-align:right;font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:#9ca3af;padding-bottom:8px;border-bottom:1px solid #e5e7eb;">Price</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding-top:12px;font-weight:700;font-size:14px;">Total</td>
            <td style="padding-top:12px;font-weight:700;font-size:14px;text-align:right;">${formatter.format(total)}</td>
          </tr>
        </tfoot>
      </table>

      <div style="margin-top:32px;padding-top:24px;border-top:1px solid #f3f4f6;text-align:center;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/track-order?ref=${orderNumber}" style="display:inline-block;background:#000;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:12px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;">
          Track Your Order
        </a>
      </div>

      <p style="color:#9ca3af;font-size:11px;text-align:center;margin-top:24px;">
        Questions? Reply to this email or contact us at sales@bodypharmlabs.com
      </p>
    </div>
  </div>
</body>
</html>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "orders@bodypharmlabs.com",
        to: email,
        subject: `Order Confirmed — ${orderNumber} | Body Pharm Labz`,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Resend error:", err);
      return NextResponse.json({ success: false, error: err }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email send error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
