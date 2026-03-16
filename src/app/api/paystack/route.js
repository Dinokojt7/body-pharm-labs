import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { amount, email, metadata, currency, reference } = body;

    const response = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // kobo / cents — must be integer
          email,
          metadata,
          currency: currency || "ZAR",
          ...(reference && { reference }),
          callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/verify`,
        }),
      },
    );

    const data = await response.json();

    if (data.status) {
      return NextResponse.json({
        success: true,
        authorization_url: data.data.authorization_url,
        reference: data.data.reference,
      });
    } else {
      return NextResponse.json(
        { success: false, error: data.message },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("Paystack initialization error:", error);
    return NextResponse.json(
      { success: false, error: "Payment initialization failed" },
      { status: 500 },
    );
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const reference = searchParams.get("reference");

  if (!reference) {
    return NextResponse.json(
      { success: false, error: "Reference required" },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      },
    );

    const data = await response.json();

    if (data.status && data.data.status === "success") {
      return NextResponse.json({
        success: true,
        data: data.data,
      });
    } else {
      return NextResponse.json(
        { success: false, error: "Payment verification failed" },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("Paystack verification error:", error);
    return NextResponse.json(
      { success: false, error: "Verification failed" },
      { status: 500 },
    );
  }
}
