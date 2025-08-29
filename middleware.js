import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  
  // Get the token from the request
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET 
  });

  // Protected routes that require authentication
  const protectedRoutes = [
    '/create',
    '/profile',
    '/settings',
    '/bookmarks',
    '/liked',
    '/following',
    '/followers'
  ];

  // Admin only routes
  const adminRoutes = [
    '/admin'
  ];

  // Author only routes (can create stories) - removed /create to allow all authenticated users
  const authorRoutes = [
    // '/create' - moved to regular protected routes
  ];

  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/home',
    '/login',
    '/register',
    '/trending',
    '/categories',
    '/story',
    '/user',
    '/api'
  ];

  // Check if current path is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );

  const isAdminRoute = adminRoutes.some(route => 
    pathname.startsWith(route)
  );

  const isAuthorRoute = authorRoutes.some(route => 
    pathname.startsWith(route)
  );

  const isPublicRoute = publicRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Allow public routes
  if (isPublicRoute && !isProtectedRoute) {
    return NextResponse.next();
  }

  // If accessing protected route without authentication
  if (isProtectedRoute && !token) {
    const url = req.nextUrl.clone();
    url.pathname = '/home';
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  // If accessing admin route without admin role
  if (isAdminRoute && token?.role !== 'admin') {
    const url = req.nextUrl.clone();
    url.pathname = '/home';
    return NextResponse.redirect(url);
  }

  // If accessing author route without author/admin role
  if (isAuthorRoute && !['author', 'admin'].includes(token?.role)) {
    const url = req.nextUrl.clone();
    url.pathname = '/home';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
