import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from '@/lib/auth';

export default async function proxy(request: NextRequest) {
  // Better Auth uses "better-auth.session_token" cookie by default (or __Secure- prefix on Vercel)
    const session = await auth.api.getSession({
    headers: request.headers,
  });

  const isLoggedIn = !!session?.user;

  const isDashboardRoute =
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/transactions") ||
    request.nextUrl.pathname.startsWith("/subscriptions") ||
    request.nextUrl.pathname.startsWith("/insights");

  if (!isLoggedIn && isDashboardRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/transactions/:path*",
    "/subscriptions/:path*",
    "/insights/:path*",
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|robots.txt|sitemap.xml).*)'
  ],
};
