import { authMiddleware } from '@clerk/nextjs';

export default authMiddleware({
  publicRoutes: [
    '/',
    '/pricing',
    '/api/stripe/webhook',
    '/api/webhooks/clerk',
  ],
  ignoredRoutes: ['/api/auth/webhook'],
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
