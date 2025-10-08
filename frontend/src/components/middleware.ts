import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
    const COOKIE_NAME = "auth_token";
    const isAuthed = Boolean(req.cookies.get(COOKIE_NAME)?.value);

    if ((req.nextUrl.pathname.startsWith("/groups") || 
         req.nextUrl.pathname.startsWith("/sets") || 
         req.nextUrl.pathname.startsWith("/study")) && !isAuthed) {
        const url = new URL("/auth/login", req.url);
        url.searchParams.set("next", req.nextUrl.pathname + req.nextUrl.search);
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [],
};