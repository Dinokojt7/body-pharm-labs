import { NextResponse } from "next/server";

const MEMBERSHIP_FEE = 199; // ZAR

export async function POST(request) {
  try {
    const { email, userId } = await request.json();

    if (!email || !userId) {
      return NextResponse.json(
        { success: false, error: "Email and userId required" },
        { status: 400 }
      );
    }

    const reference = `MEMBER-${userId}-${Date.now()}`;

    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: MEMBERSHIP_FEE * 100, // kobo/cents — must be integer
        email,
        currency: "ZAR",
        reference,
        metadata: { type: "membership", userId },
        callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/membership/verify`,
      }),
    });

    const data = await response.json();

    if (data.status) {
      return NextResponse.json({
        success: true,
        authorization_url: data.data.authorization_url,
      });
    }

    return NextResponse.json(
      { success: false, error: data.message },
      { status: 400 }
    );
  } catch (error) {
    console.error("Membership payment error:", error);
    return NextResponse.json(
      { success: false, error: "Payment initialization failed" },
      { status: 500 }
    );
  }
}
