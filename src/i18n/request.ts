import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';
import { defaultLocale, locales, type Locale } from './config';

export default getRequestConfig(async () => {
  // Try to get locale from cookie first
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get('NEXT_LOCALE')?.value;

  // Then try Accept-Language header
  const headersList = await headers();
  const acceptLanguage = headersList.get('accept-language');

  let locale: Locale = defaultLocale;

  if (localeCookie && locales.includes(localeCookie as Locale)) {
    locale = localeCookie as Locale;
  } else if (acceptLanguage) {
    // Parse Accept-Language header
    const preferredLocale = acceptLanguage
      .split(',')
      .map((lang) => lang.split(';')[0].trim())
      .find((lang) => {
        // Check for exact match
        if (locales.includes(lang as Locale)) return true;
        // Check for partial match (e.g., 'pt' matches 'pt-BR')
        const baseLang = lang.split('-')[0];
        return locales.some((l) => l.startsWith(baseLang));
      });

    if (preferredLocale) {
      // Find the matching locale
      const matchedLocale = locales.find(
        (l) => l === preferredLocale || l.startsWith(preferredLocale.split('-')[0])
      );
      if (matchedLocale) {
        locale = matchedLocale;
      }
    }
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});

