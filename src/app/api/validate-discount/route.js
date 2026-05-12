import { NextResponse } from "next/server";
import { validateDiscount } from "@/lib/firebase/firestore";

export async function POST(req) {
  try {
    const { code, subtotal } = await req.json();
    if (!code) return NextResponse.json({ valid: false, error: "No code provided." });

    const { discount, error } = await validateDiscount(code);
    if (error || !discount) {
      return NextResponse.json({ valid: false, error: error || "Invalid code." });
    }

    const amount = parseFloat(((subtotal || 0) * (discount.value / 100)).toFixed(2));
    return NextResponse.json({ valid: true, code: discount.code, value: discount.value, amount });
  } catch {
    return NextResponse.json({ valid: false, error: "Could not validate code." });
  }
}
