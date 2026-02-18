import createMiddleware from 'next-intl/middleware';
import { locales, localePrefix } from './navigation';

export default createMiddleware({
  locales,
  defaultLocale: 'fr', // This should match the defaultLocale in next.config.js
  localePrefix,
  localeDetection: false,
});

export const config = {
  // Match all pathnames except for
  // - /api (API routes)
  // - /_next (Next.js internals)
  // - /_vercel (Vercel internals)
  // - /static (static files)
  // - /sitemap.xml
  // - /robots.txt
  // - all files (e.g. favicon.ico, logo.png, etc.)
  matcher: ['/((?!api|_next|_vercel|static|sitemap.xml|robots.txt|.*\\..*).*)']
};