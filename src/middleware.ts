import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher([
  '/customer(.*)',
  '/admin(.*)',
  '/agent(.*)', 
  '/underwriter(.*)',
]);

const isAdminRoute = createRouteMatcher(['/admin(.*)']);
const isAgentRoute = createRouteMatcher(['/agent(.*)']);
const isUnderwriterRoute = createRouteMatcher(['/underwriter(.*)']);
const isCustomerRoute = createRouteMatcher(['/customer(.*)']);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();

    // Get user role from auth
    const { sessionClaims } = await auth();
    const userRole = sessionClaims?.metadata?.role as string;

    // Role-based route protection
    if (isAdminRoute(req) && userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL(`/${userRole?.toLowerCase() || 'customer'}/dashboard`, req.url));
    }
    
    if (isAgentRoute(req) && userRole !== 'AGENT') {
      return NextResponse.redirect(new URL(`/${userRole?.toLowerCase() || 'customer'}/dashboard`, req.url));
    }
    
    if (isUnderwriterRoute(req) && userRole !== 'UNDERWRITER') {
      return NextResponse.redirect(new URL(`/${userRole?.toLowerCase() || 'customer'}/dashboard`, req.url));
    }
    
    if (isCustomerRoute(req) && userRole && userRole !== 'CUSTOMER') {
      return NextResponse.redirect(new URL(`/${userRole.toLowerCase()}/dashboard`, req.url));
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals, static files, and auth routes
    '/((?!_next|sign-in|sign-up|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};