import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const CANONICAL_HOST = "www.policyradar.co.kr";
const APEX_HOST = "policyradar.co.kr";

export async function proxy(request: NextRequest) {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = forwardedHost || request.headers.get("host") || "";

  if (host === APEX_HOST) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.host = CANONICAL_HOST;
    redirectUrl.protocol = "https";
    redirectUrl.port = "";
    return NextResponse.redirect(redirectUrl, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map)$).*)",
  ],
};
