'use client';

import { NextIntlClientProvider, AbstractIntlMessages } from 'next-intl';
import * as React from 'react';

interface Props {
  messages: AbstractIntlMessages;
  locale: string;
  children: React.ReactNode;
}

/**
 * Client-side provider for next-intl.
 * Wraps the application to provide translation context to client components.
 */
export function I18nProvider({ messages, locale, children }: Props) {
  return (
    <NextIntlClientProvider 
      locale={locale} 
      messages={messages}
      timeZone={locale === 'pt-BR' ? 'America/Sao_Paulo' : 'UTC'}
    >
      {children}
    </NextIntlClientProvider>
  );
}
