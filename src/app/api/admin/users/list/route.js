import { NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase/admin";
import { isAdmin } from "@/lib/utils/admin";

// Reads straight from Firebase Authentication (not the Firestore `users`
// collection) — a real login account exists here even when its Firestore
// profile doc was never created (e.g. they never finished the "complete
// your profile" step). This is the actual, complete "every registered
// person" list.
export async function POST(request) {
  try {
    const adminAuth = getAdminAuth();
    if (!adminAuth) {
      return NextResponse.json({ success: false, error: "Service unavailable" }, { status: 503 });
    }

    const { idToken } = await request.json();
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

    const users = [];
    let pageToken;
    do {
      const result = await adminAuth.listUsers(1000, pageToken);
      for (const u of result.users) {
        if (u.disabled || !u.email) continue;
        users.push({ uid: u.uid, email: u.email, name: u.displayName || "" });
      }
      pageToken = result.pageToken;
    } while (pageToken);

    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error("[admin/users/list]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
