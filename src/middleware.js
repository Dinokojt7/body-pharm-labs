import { NextResponse } from "next/server";

const ADMIN_BYPASS = ["/admin", "/_next", "/api", "/favicon", "/icons", "/images", "/manifest"];

async function fetchMaintenanceMode() {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/settings/site?key=${apiKey}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(2000) });
  if (!res.ok) return false;
  const data = await res.json();
  return data?.fields?.maintenanceMode?.booleanValue === true;
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Admin always gets through
  if (ADMIN_BYPASS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  try {
    const isOn = await fetchMaintenanceMode();

    // /maintenance is only live when the flag is on — otherwise send to /
    if (pathname === "/maintenance") {
      return isOn ? NextResponse.next() : NextResponse.redirect(new URL("/", request.url));
    }

    // All other routes redirect to maintenance when flag is on
    if (isOn) {
      return NextResponse.redirect(new URL("/maintenance", request.url));
    }
  } catch {
    // Fail open — if Firestore is unreachable, serve normally
    if (pathname === "/maintenance") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
