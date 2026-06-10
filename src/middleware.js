import { NextResponse } from "next/server";

// Routes that always bypass the maintenance check
const BYPASS = ["/admin", "/maintenance", "/_next", "/api", "/favicon", "/icons", "/images", "/manifest"];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (BYPASS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  try {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    const firestoreUrl =
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/settings/site?key=${apiKey}`;

    const res = await fetch(firestoreUrl, { signal: AbortSignal.timeout(2000) });

    if (res.ok) {
      const data = await res.json();
      if (data?.fields?.maintenanceMode?.booleanValue === true) {
        return NextResponse.redirect(new URL("/maintenance", request.url));
      }
    }
  } catch {
    // Fail open — if Firestore is unreachable, don't block visitors
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
