import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { locales, localePrefix } from './navigation';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: 'fr',
  localePrefix,
  localeDetection: false,
});

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Get the city from Vercel's Edge network headers
  const city = req.headers.get('x-vercel-ip-city')?.toLowerCase() || '';

  // 2. Define our Lévis/South Shore target cities
  const levisCities = [
    'levis', 
    'lévis', 
    'charny', 
    'saint-nicolas', 
    'dosquet', 
    'saint-romuald', 
    'saint-étienne-de-lauzon'
  ];

  // 3. Geo-redirection for Lévis
  // Check for root '/' or root locale homepages like '/fr' or '/en'
  const isHomePage = pathname === '/' || pathname === '/fr' || pathname === '/en';
  
  if (isHomePage && levisCities.includes(city)) {
    // Determine the locale to keep the user in the right language
    const locale = pathname.startsWith('/en') ? 'en' : 'fr';
    const levisUrl = new URL(`/${locale}/levis`, req.url);
    return NextResponse.redirect(levisUrl);
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|static|sitemap.xml|robots.txt|.*\\..*).*)']
};
