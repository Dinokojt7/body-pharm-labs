import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { generateInvoicePdf } from "@/lib/pdf/invoice-generator";

export async function GET(request, { params }) {
  const { orderId } = await params;

  const db = getAdminDb();
  if (!db) {
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }

  try {
    const snap = await db.collection("orders").doc(orderId).get();

    if (!snap.exists) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const order = snap.data();
    const pdfBuffer = await generateInvoicePdf(order);

    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="invoice-${order.orderNumber}.pdf"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Invoice generation error:", error);
    return NextResponse.json({ error: "Failed to generate invoice" }, { status: 500 });
  }
}
