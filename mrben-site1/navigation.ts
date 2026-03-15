import { createNavigation } from 'next-intl/navigation';

export const locales = ['en', 'fr'] as const;
export const localePrefix = 'as-needed';
export const defaultLocale = 'fr';

export const { Link, redirect, usePathname, useRouter } = createNavigation({ locales, localePrefix, defaultLocale });