import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
	// Check for session cookie directly to avoid Edge Runtime eval issues
	const sessionCookie = request.cookies.get("better-auth.session_token");
	const isHomePage = request.nextUrl.pathname === "/";
	const isDashboardPage = request.nextUrl.pathname.startsWith("/dashboard");

	// Redirect authenticated users from home to dashboard
	if (sessionCookie && isHomePage) {
		return NextResponse.redirect(new URL("/dashboard", request.url));
	}

	// Redirect unauthenticated users from dashboard to home
	if (!sessionCookie && isDashboardPage) {
		return NextResponse.redirect(new URL("/", request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/", "/dashboard/:path*"], // Match root and all dashboard routes
};
