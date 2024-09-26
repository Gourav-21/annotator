import { auth } from "@/auth"
import { NextResponse } from "next/server"
 
export default auth((req) => {
  if (!req.auth && req.nextUrl.pathname !== "/auth/login") {
    const newUrl = new URL("/auth/login", req.nextUrl.origin)
    return Response.redirect(newUrl)
  }

  return NextResponse.next()
})

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
  }