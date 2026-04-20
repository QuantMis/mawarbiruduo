import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Allow access to the login page without authentication
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  // Protect all /admin/* and /api/admin/* routes
  if (!req.auth) {
    // API routes return JSON 401 instead of redirecting
    if (pathname.startsWith("/api/admin")) {
      return NextResponse.json(
        { error: "Tidak dibenarkan" },
        { status: 401 },
      );
    }

    const loginUrl = new URL("/admin/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
