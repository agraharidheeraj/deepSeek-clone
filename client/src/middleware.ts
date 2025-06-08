import { NextResponse, NextRequest } from "next/server";

const publicRoute = new Set(["/sign-in", "/sign-up"]);
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const userToken = req.cookies.get("auth_token");

  // //check if user has a token and trying to access the public route like signup signin
  // if (publicRoute.has(pathname) && userToken) {
  //   return NextResponse.redirect(new URL("/", req.url));
  // }

  // if (publicRoute.has(pathname)) {
  //   return NextResponse.next();
  // }

  // if (!userToken) {
  //   return NextResponse.redirect(new URL("/sign-in", req.url));
  // }

  // return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  // matcher: ["/sign-in", "/sign-up", "/", "/chat/:path*"],
};
