import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/pricing',
  '/api/stripe/webhook',
  '/api/webhooks/clerk',
  '/api/auth/webhook',
  '/sign-in(.*)',
  '/sign-up(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  // Bypass auth for Playwright E2E tests
  const isPlaywrightTest =
    process.env.PLAYWRIGHT_TEST_MODE === 'true' ||
    req.cookies.get('__session')?.value === 'PLAYWRIGHT_TEST_SESSION';

  if (isPlaywrightTest) {
    // Allow test requests through without authentication
    return;
  }

  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
