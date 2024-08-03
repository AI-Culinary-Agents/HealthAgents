import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const protectedRoutes = ['/', '/profile', '/dashboard'];

export async function middleware(req: NextRequest) {
	console.log('Middleware invoked for:', req.nextUrl.pathname);

	// Exclude static assets, authentication, and sign-up routes from the middleware
	if (
		req.nextUrl.pathname.startsWith('/_next') ||
		req.nextUrl.pathname.startsWith('/api/auth') ||
		req.nextUrl.pathname === '/signup'
	) {
		return NextResponse.next();
	}

	// Check if the current route is protected
	const isProtectedRoute = protectedRoutes.some((route) =>
		req.nextUrl.pathname.startsWith(route)
	);

	if (isProtectedRoute) {
		// Get the token from the request
		const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

		console.log('Token:', token);

		// If the user is not authenticated, redirect to the sign-up page
		if (!token) {
			const url = new URL('/signup', req.url);
			return NextResponse.redirect(url);
		}
	}

	// If the user is authenticated or the route is not protected, allow the request to continue
	return NextResponse.next();
}

export const config = {
	matcher: ['/', '/profile/:path*', '/dashboard/:path*'],
};
