'use client';

import * as React from 'react';
import { useLocale } from 'next-intl';
import { Locale } from './settings';
import { aiTranslationCache } from './ai-cache';

/**
 * Hook for intelligent on-the-fly translation.
 * Combines local cache with the AI Translation API endpoint.
 */
export function useAITranslation() {
  const currentLocale = useLocale() as Locale;
  const [isTranslating, setIsTranslating] = React.useState(false);

  const translate = React.useCallback(async (
    text: string, 
    targetLocale?: Locale,
    sourceLocale: Locale = 'pt-BR'
  ): Promise<string> => {
    const target = targetLocale || currentLocale;
    
    // Check cache first
    const cached = aiTranslationCache.get(text, target);
    if (cached) return cached;

    setIsTranslating(true);
    try {
      const response = await fetch('/api/i18n/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          targetLocale: target,
          sourceLocale,
        }),
      });

      if (!response.ok) throw new Error('Translation API failed');

      const data = await response.json();
      const result = data.translated;

      // Save to cache
      aiTranslationCache.set(text, target, result);
      
      return result;
    } catch (error) {
      console.error('AI Translation error:', error);
      return text; // Fallback to original text
    } finally {
      setIsTranslating(false);
    }
  }, [currentLocale]);

  return { translate, isTranslating };
}
