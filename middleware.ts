import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ROUTES, PUBLIC_ROUTES } from "@/lib/constants/routes";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get("session")?.value;

  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

  // Unauthenticated user trying to access a protected page → redirect to login
  if (!isPublicRoute && !sessionToken) {
    const loginUrl = new URL(ROUTES.LOGIN, request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated user trying to access login/signup → redirect to dashboard
  if (isPublicRoute && sessionToken) {
    const dashboardUrl = new URL(ROUTES.DASHBOARD, request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - Next.js static/image files
     * - favicon
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
