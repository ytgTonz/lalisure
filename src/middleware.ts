import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse, type NextRequest } from 'next/server';
import { getStaffSessionFromRequest } from '@/lib/auth/staff-auth';
import { getSecurityHeaders, getApiSecurityHeaders } from '@/lib/utils/security-headers';

const isStaffRoute = createRouteMatcher(['/admin(.*)', '/agent(.*)', '/underwriter(.*)']);
const isCustomerRoute = createRouteMatcher(['/customer(.*)']);

export default clerkMiddleware(async (auth, req) => {
  let response: NextResponse;

  // For staff routes, perform custom session check
  if (isStaffRoute(req)) {
    const staffSession = await getStaffSessionFromRequest(req as NextRequest);

    // If there's no valid staff session, redirect to the staff login page
    if (!staffSession) {
      const staffLoginUrl = new URL('/staff/login', req.url);
      staffLoginUrl.searchParams.set('redirect_url', req.url);
      response = NextResponse.redirect(staffLoginUrl);
    } else {
      // If a staff session exists, verify their role against the route 
      const { user } = staffSession;
      const { pathname } = req.nextUrl;

      if (pathname.startsWith('/admin') && user.role !== 'ADMIN') {
        response = NextResponse.redirect(new URL('/staff/login', req.url));
      } else if (pathname.startsWith('/agent') && user.role !== 'AGENT') {
        response = NextResponse.redirect(new URL('/staff/login', req.url));
      } else if (pathname.startsWith('/underwriter') && user.role !== 'UNDERWRITER') {
        response = NextResponse.redirect(new URL('/staff/login', req.url));
      } else {
        response = NextResponse.next();
      }
    }
  } else if (isCustomerRoute(req)) {
    // For customer routes, use Clerk's default protection
    const { userId } = await auth();
    if (!userId) {
      const signInUrl = new URL('/sign-in', req.url);
      response = NextResponse.redirect(signInUrl);
    } else {
      response = NextResponse.next();
    }
  } else {
    // For all other routes
    response = NextResponse.next();
  }

  // Apply security headers to all responses
  const isApiRoute = req.nextUrl.pathname.startsWith('/api');
  const securityHeaders = isApiRoute ? getApiSecurityHeaders() : getSecurityHeaders();
  
  for (const [key, value] of Object.entries(securityHeaders)) {
    if (value) {
      response.headers.set(key, value);
    }
  }

  return response;
});

export const config = {
  matcher: [
    // Skip Next.js internals, static files, and auth routes
    '/((?!_next|sign-in|sign-up|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};