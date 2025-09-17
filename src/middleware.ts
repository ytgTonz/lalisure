import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse, type NextRequest } from 'next/server';
import { getStaffSessionFromRequest } from '@/lib/auth/staff-auth';

const isStaffRoute = createRouteMatcher(['/admin(.*)', '/agent(.*)', '/underwriter(.*)']);
const isCustomerRoute = createRouteMatcher(['/customer(.*)']);

export default clerkMiddleware(async (auth, req) => {
  // For staff routes, perform custom session check
  if (isStaffRoute(req)) {
    const staffSession = await getStaffSessionFromRequest(req as NextRequest);

    // If there's no valid staff session, redirect to the staff login page
    if (!staffSession) {
      const staffLoginUrl = new URL('/staff/login', req.url);
      staffLoginUrl.searchParams.set('redirect_url', req.url);
      return NextResponse.redirect(staffLoginUrl);
    }

    // If a staff session exists, verify their role against the route 
    const { user } = staffSession;
    const { pathname } = req.nextUrl;

    if (pathname.startsWith('/admin') && user.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/staff/login', req.url));
    }

    if (pathname.startsWith('/agent') && user.role !== 'AGENT') {
      return NextResponse.redirect(new URL('/staff/login', req.url));
    }

    if (pathname.startsWith('/underwriter') && user.role !== 'UNDERWRITER') {
      return NextResponse.redirect(new URL('/staff/login', req.url));
    }

    return NextResponse.next();
  }

  // For customer routes, use Clerk's default protection
  if (isCustomerRoute(req)) {
    const { userId } = await auth();
    if (!userId) {
      const signInUrl = new URL('/sign-in', req.url);
      return NextResponse.redirect(signInUrl);
    }
  }

  // For all other routes, do nothing
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals, static files, and auth routes
    '/((?!_next|sign-in|sign-up|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};