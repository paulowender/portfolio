'use client';

import { NextIntlClientProvider, AbstractIntlMessages } from 'next-intl';
import { ReactNode } from 'react';

interface I18nProviderProps {
  children: ReactNode;
  locale: string;
  messages: AbstractIntlMessages;
}

export default function I18nProvider({ children, locale, messages }: I18nProviderProps) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone="America/Sao_Paulo">
      {children}
    </NextIntlClientProvider>
  );
}

