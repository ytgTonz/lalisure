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

    // Get user role from auth user object
    const { userId } = await auth();
    if (!userId) return;

    // Role-based route protection will be handled by RoleGuard components in pages
    // Middleware just ensures authentication is required for protected routes
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