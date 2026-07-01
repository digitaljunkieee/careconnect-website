import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { ROLE_HOME, type Role } from "@/lib/constants";

const ROUTE_RULES = [
  { prefix: "/admin", role: "ADMIN" },
  { prefix: "/dashboard/admin", role: "ADMIN" },
  { prefix: "/dashboard/worker", role: "WORKER" },
  { prefix: "/dashboard/facility", role: "FACILITY" }
] as const;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET
  });

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const matchedRule = ROUTE_RULES.find((rule) => pathname.startsWith(rule.prefix));

  if (
    matchedRule &&
    (token.role !== matchedRule.role ||
      (matchedRule.role === "ADMIN" && token.isAdmin !== true))
  ) {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  if (pathname === "/dashboard" && token.role) {
    const role = token.role as Role;
    return NextResponse.redirect(new URL(ROLE_HOME[role], request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"]
};
