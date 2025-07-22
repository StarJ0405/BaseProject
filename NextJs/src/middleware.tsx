import { NextRequest, NextResponse } from "next/server";
import { getDeviceType } from "./shared/utils/Functions";

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|assets|resources).*)",
  ],
};

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get("host") || "";

  const userAgent = req.headers.get("user-agent");
  const deviceType = getDeviceType(userAgent);
  const subdomain = hostname.split(".")[0];
  const mains = (process.env.NEXT_MAIN_DOMAIN || "").split(",");
  if (
    subdomain === "www" ||
    mains.some((main) => main?.split(".")?.[0] === subdomain)
  ) {
    return NextResponse.rewrite(
      new URL(`/$main/${deviceType}${url.pathname}${url.search}`, req.url)
    );
  }

  return NextResponse.rewrite(
    new URL(`/${subdomain}/${deviceType}${url.pathname}${url.search}`, req.url)
  );
}
