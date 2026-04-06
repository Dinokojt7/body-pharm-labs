import { NextResponse } from "next/server";

export async function POST(request) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM;
  const to = process.env.TWILIO_WHATSAPP_TO;

  if (!accountSid || !authToken || !from || !to) {
    console.warn("Twilio env vars not set — skipping WhatsApp notification");
    return NextResponse.json({ success: true, skipped: true });
  }

  try {
    const {
      orderId,
      orderNumber,
      firstName,
      lastName,
      email,
      phone,
      shippingAddress = {},
      items,
      subtotal,
      tax,
      shipping,
      memberDiscount,
      total,
      currency,
      notes,
    } = await request.json();

    const formatter = new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: currency || "ZAR",
    });

    const itemLines = (items || [])
      .map((item) => `  • ${item.name}${item.size ? ` (${item.size})` : ""} × ${item.quantity} — ${formatter.format(item.price * item.quantity)}`)
      .join("\n");

    const addressLine = [
      shippingAddress.address,
      shippingAddress.city,
      shippingAddress.postalCode,
      shippingAddress.country,
    ].filter(Boolean).join(", ");

    const lines = [
      `🛒 *New Order — Body Pharm Labs*`,
      ``,
      `Order: *${orderNumber}*`,
      ``,
      `*Customer*`,
      `Name: ${firstName} ${lastName}`,
      `Email: ${email}`,
      `Phone: ${phone}`,
      ``,
      `*Shipping Address*`,
      addressLine,
      ``,
      `*Items*`,
      itemLines,
      ``,
      `Subtotal: ${formatter.format(subtotal)}`,
      ...(memberDiscount > 0 ? [`Member Discount: −${formatter.format(memberDiscount)}`] : []),
      `Shipping: ${shipping === 0 ? "Free" : formatter.format(shipping)}`,
      `VAT (15%): ${formatter.format(tax)}`,
      `*Total: ${formatter.format(total)}*`,
      ...(notes ? [``, `Notes: ${notes}`] : []),
    ];

    const message = lines.join("\n");
    const credentials = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bodypharmlabs.com";

    const body = new URLSearchParams({ From: from, To: to, Body: message });

    // Attach PDF invoice if Firebase Admin is configured (orderId present)
    if (orderId && process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      body.append("MediaUrl0", `${siteUrl}/api/invoice/${orderId}`);
    }

    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
      },
    );

    if (!res.ok) {
      const err = await res.text();
      console.error("Twilio error:", err);
      return NextResponse.json({ success: false, error: err }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("WhatsApp notify error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
