'use client';

import { useState, useRef, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { locales, localeNames, localeFlags, type Locale } from '@/i18n/config';
import { useRouter } from 'next/navigation';

export default function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const changeLocale = (newLocale: Locale) => {
    // Set cookie for locale preference
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000`;
    // Refresh the page to apply the new locale
    router.refresh();
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors duration-300 rounded-md hover:bg-gray-700/50"
        aria-label="Change language"
      >
        <span className="text-lg">{localeFlags[locale]}</span>
        <span className="hidden sm:inline">{localeNames[locale]}</span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-50">
          {locales.map((loc) => (
            <button
              key={loc}
              onClick={() => changeLocale(loc)}
              className={`w-full flex items-center gap-2 px-4 py-2 text-sm text-left hover:bg-gray-700 transition-colors ${
                locale === loc ? 'text-indigo-400 bg-gray-700/50' : 'text-gray-300'
              }`}
            >
              <span className="text-lg">{localeFlags[loc]}</span>
              <span>{localeNames[loc]}</span>
              {locale === loc && (
                <svg
                  className="w-4 h-4 ml-auto"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

