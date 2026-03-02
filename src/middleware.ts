import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/api/webhooks(.*)',
  '/api/trpc(.*)',
  '/api/upload-cv',
]);

const isOnboardingRoute = createRouteMatcher(['/onboarding']);

export default clerkMiddleware(async (auth, request) => {
  const { userId, sessionClaims } = await auth();

  // If user is logged in and visits landing or sign-in, redirect to dashboard
  if (userId && isPublicRoute(request)) {
    const path = request.nextUrl.pathname;
    if (path === '/' || path.startsWith('/sign-in')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return;
  }

  // Allow public routes through
  if (isPublicRoute(request)) {
    return;
  }

  // Redirect unauthenticated users to sign-in
  if (!userId) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  // Read onboarding status from JWT session claims (no API call)
  const metadata = sessionClaims.metadata as { onboardingCompleted?: boolean } | undefined;
  const onboardingCompleted = metadata?.onboardingCompleted === true;

  // Not onboarded → redirect to /onboarding
  if (!onboardingCompleted && !isOnboardingRoute(request)) {
    return NextResponse.redirect(new URL('/onboarding', request.url));
  }

  // Already onboarded → don't let them back to /onboarding
  if (onboardingCompleted && isOnboardingRoute(request)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
