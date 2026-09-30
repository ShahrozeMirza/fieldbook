import { NextResponse, type NextRequest } from "next/server";

// Optimistic check only: is there a session cookie at all? Pages and server
// actions verify the session against the database (see src/lib/auth.ts).
const SESSION_COOKIE = "fieldbook_session";

export default function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  if (pathname === "/login") return NextResponse.next();

  if (!req.cookies.has(SESSION_COOKIE)) {
    const url = new URL("/login", req.nextUrl);
    if (pathname !== "/") url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  // Everything except Next's static assets and public files.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|ico)$).*)"],
};
