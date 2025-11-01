import { NextRequest, NextResponse } from "next/server";
export async function middleware(request:NextRequest){
  const token=request.cookies.get('auth-token');
  if(request.nextUrl.pathname.startsWith("/message")||request.nextUrl.pathname.startsWith("/issues")){
    if(!token){
      const loginUrl=new URL("/Auth/Login", request.url)
      loginUrl.searchParams.set("returnUrl", request.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }
  }
  return NextResponse.next()
}
export const config={
    matcher:["/issues", "/message"],
  }