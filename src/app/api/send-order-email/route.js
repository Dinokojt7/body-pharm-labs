import { NextResponse } from "next/server";

export async function POST(request) {
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ success: true, skipped: true });
  }

  try {
    const { orderNumber, email, firstName, items, total, currency } = await request.json();

    const formatter = new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: currency || "ZAR",
    });

    const itemRows = (items || [])
      .map(
        (item) =>
          `<tr>
            <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:13px;color:#111;">
              ${item.name}${item.size ? ` <span style="color:#9ca3af;font-size:11px;">— ${item.size}</span>` : ""}
            </td>
            <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:13px;color:#6b7280;text-align:center;">× ${item.quantity}</td>
            <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:13px;color:#111;text-align:right;font-weight:600;">${formatter.format(item.price * item.quantity)}</td>
          </tr>`,
      )
      .join("");

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bodypharmlabs.com";

    const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#fff;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">

        <!-- Header -->
        <tr>
          <td style="background:#000;padding:36px 32px;text-align:center;">
            <p style="margin:0 0 6px;color:rgba(255,255,255,0.5);font-size:10px;letter-spacing:0.22em;text-transform:uppercase;">Body Pharm Labz</p>
            <p style="margin:0 0 2px;color:#fff;font-size:22px;font-weight:700;letter-spacing:-0.01em;">Order Confirmed</p>
            <p style="margin:0;color:rgba(255,255,255,0.55);font-size:13px;">Thank you, ${firstName}!</p>
          </td>
        </tr>

        <!-- Order number banner -->
        <tr>
          <td style="background:#f9fafb;border-bottom:1px solid #e5e7eb;padding:14px 32px;text-align:center;">
            <p style="margin:0;color:#6b7280;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;">Order Reference</p>
            <p style="margin:4px 0 0;color:#000;font-size:18px;font-weight:700;font-family:monospace,monospace;">${orderNumber}</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            <p style="margin:0 0 24px;color:#6b7280;font-size:13px;line-height:1.6;">
              Your order has been received and payment confirmed. We&rsquo;ll notify you when your order ships.
            </p>

            <!-- Items table -->
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
                  <td style="padding-top:14px;font-weight:700;font-size:14px;color:#000;text-align:right;">${formatter.format(total)}</td>
                </tr>
              </tfoot>
            </table>

            <!-- CTA -->
            <div style="margin-top:32px;padding-top:24px;border-top:1px solid #f3f4f6;text-align:center;">
              <a href="${siteUrl}/track-order?ref=${orderNumber}"
                 style="display:inline-block;background:#000;color:#fff;text-decoration:none;padding:12px 28px;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;">
                Track Your Order
              </a>
            </div>

            <!-- Footer note -->
            <p style="margin:24px 0 0;color:#9ca3af;font-size:11px;text-align:center;line-height:1.5;">
              Questions? Contact us at
              <a href="mailto:sales@bodypharmlabs.com" style="color:#000;text-decoration:underline;">sales@bodypharmlabs.com</a>
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
