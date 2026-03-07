import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { locales, localePrefix } from './navigation';

// Lévis coordinates (center)
const LEVIS_LAT = 46.8033;
const LEVIS_LON = -71.1779;
const RADIUS_KM = 75;

// Haversine formula to calculate distance between two coordinates
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: 'fr',
  localePrefix,
  localeDetection: false,
});

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Get location data from Vercel Edge headers
  const city = req.headers.get('x-vercel-ip-city')?.toLowerCase() || '';
  const lat = parseFloat(req.headers.get('x-vercel-ip-latitude') || '0');
  const lon = parseFloat(req.headers.get('x-vercel-ip-longitude') || '0');

  // 2. Define "Must-Redirect" city list (backup for coordinates)
  const levisCities = [
    'levis', 'lévis', 'charny', 'saint-nicolas', 'dosquet', 
    'saint-romuald', 'saint-étienne-de-lauzon'
  ];

  // 3. Geo-redirection logic
  const isHomePage = pathname === '/' || pathname === '/fr' || pathname === '/en';
  
  if (isHomePage) {
    const distance = getDistance(lat, lon, LEVIS_LAT, LEVIS_LON);
    const isWithinRadius = lat !== 0 && lon !== 0 && distance <= RADIUS_KM;
    const isTargetCity = levisCities.includes(city);

    if (isWithinRadius || isTargetCity) {
      const locale = pathname.startsWith('/en') ? 'en' : 'fr';
      const levisUrl = new URL(`/${locale}/levis`, req.url);
      return NextResponse.redirect(levisUrl);
    }
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|static|sitemap.xml|robots.txt|.*\\..*).*)']
};
