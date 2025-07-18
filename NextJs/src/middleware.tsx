import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|assets).*)"],
};

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get("host") || ""; // 실제 도메인으로 변경하세요

  // 서브도메인 추출 (예: 'tenant1.example.com' -> 'tenant1')
  const subdomain = hostname.split(".")[0];
  const mains = (process.env.NEXT_MAIN_DOMAIN || "").split(",");
  if (
    subdomain === "www" ||
    mains.some((main) => main?.split(".")?.[0] === subdomain)
  ) {
    return NextResponse.rewrite(new URL(`/main${url.pathname}`, req.url));
  }

  // 다른 서브도메인 (예: tenant1.example.com) 처리
  // tenant1.example.com/settings -> /[subdomain]/settings
  return NextResponse.rewrite(new URL(`/${subdomain}${url.pathname}`, req.url));
}
