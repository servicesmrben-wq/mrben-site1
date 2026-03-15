import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => {
  const currentLocale = locale || 'fr';
  return {
    locale: currentLocale,
    messages: (await import(`../app/lib/messages/${currentLocale}.json`)).default
  };
});