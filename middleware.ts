import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
    const { data: session } = await auth.api.getSession({
        headers: request.headers,
    });

    // Protected routes that require authentication
    const protectedPaths = ["/dashboard", "/admin"];
    const isProtectedRoute = protectedPaths.some((path) =>
        request.nextUrl.pathname.startsWith(path)
    );

    // If trying to access protected route without session, redirect to sign-in
    if (isProtectedRoute && !session) {
        const signInUrl = new URL("/sign-in", request.url);
        signInUrl.searchParams.set("callbackUrl", request.url);
        return NextResponse.redirect(signInUrl);
    }

    // If authenticated and trying to access auth pages, redirect to dashboard
    const authPaths = ["/sign-in", "/sign-up"];
    const isAuthRoute = authPaths.some((path) =>
        request.nextUrl.pathname.startsWith(path)
    );

    if (isAuthRoute && session) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};