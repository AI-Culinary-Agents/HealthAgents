import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const protectedRoutes = ['/', '/profile', '/dashboard'];

export async function middleware(req: NextRequest) {
	console.log('--- Middleware Start ---');
	console.log('Middleware invoked for:', req.nextUrl.pathname);
	console.log('Request method:', req.method);
	console.log('Request headers:', JSON.stringify([...req.headers]));

	// Exclude static assets, authentication, and sign-up routes from the middleware
	if (
		req.nextUrl.pathname.startsWith('/_next') ||
		req.nextUrl.pathname.startsWith('/api/auth') ||
		req.nextUrl.pathname.startsWith('/api/register') ||
		req.nextUrl.pathname === '/signup'
	) {
		console.log('Excluded route, continuing request');
		console.log('--- Middleware End ---');
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
			console.log('No token found, redirecting to /signup');
			const url = new URL('/signup', req.url);
			console.log('--- Middleware End ---');
			return NextResponse.redirect(url);
		}

		// Optionally, check if the token contains the required user ID
		if (!token.id) {
			console.log('Token does not contain user ID, redirecting to /signup');
			const url = new URL('/signup', req.url);
			console.log('--- Middleware End ---');
			return NextResponse.redirect(url);
		}
	}

	// If the user is authenticated or the route is not protected, allow the request to continue
	console.log('Request allowed to continue');
	console.log('--- Middleware End ---');
	return NextResponse.next();
}

export const config = {
	matcher: ['/', '/profile/:path*', '/dashboard/:path*'],
};
