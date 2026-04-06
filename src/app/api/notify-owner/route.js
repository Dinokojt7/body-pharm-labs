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
    const { orderNumber, firstName, lastName, items, total, currency } = await request.json();

    const formatter = new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: currency || "ZAR",
    });

    const itemLines = (items || [])
      .map((item) => `  • ${item.name}${item.size ? ` (${item.size})` : ""} × ${item.quantity}`)
      .join("\n");

    const message = [
      `🛒 *New Order — Body Pharm Labs*`,
      ``,
      `Order: *${orderNumber}*`,
      `Customer: ${firstName} ${lastName}`,
      ``,
      `*Items:*`,
      itemLines,
      ``,
      `*Total: ${formatter.format(total)}*`,
    ].join("\n");

    const credentials = Buffer.from(`${accountSid}:${authToken}`).toString("base64");

    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ From: from, To: to, Body: message }).toString(),
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
