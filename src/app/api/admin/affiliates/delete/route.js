import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { isAdmin } from "@/lib/utils/admin";

export async function POST(request) {
  try {
    const adminAuth = getAdminAuth();
    const adminDb = getAdminDb();
    if (!adminAuth || !adminDb) {
      return NextResponse.json({ success: false, error: "Service unavailable" }, { status: 503 });
    }

    const { idToken, uid } = await request.json();
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

    if (!uid) {
      return NextResponse.json({ success: false, error: "Missing affiliate id." }, { status: 400 });
    }

    // Delete the Firestore doc first — this cuts off data access immediately
    // via security rules even if the Auth deletion below fails, so failure
    // mode fails safe rather than leaving a code "squatted" with no login.
    await adminDb.collection("affiliates").doc(uid).delete();

    try {
      await adminAuth.deleteUser(uid);
    } catch (err) {
      if (err.code !== "auth/user-not-found") throw err;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[affiliates/delete]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
