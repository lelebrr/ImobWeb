import { Locale } from './settings';

/**
 * Simple in-memory cache for AI translations to avoid redundant costs and latency.
 * In a production environment, this should persist in Redis or LocalStorage.
 */
class AITranslationCache {
  private cache: Map<string, string> = new Map();

  private generateKey(text: string, locale: Locale): string {
    return `${locale}:${text.substring(0, 50)}`;
  }

  get(text: string, locale: Locale): string | undefined {
    return this.cache.get(this.generateKey(text, locale));
  }

  set(text: string, locale: Locale, translated: string): void {
    this.cache.set(this.generateKey(text, locale), translated);
  }

  clear(): void {
    this.cache.clear();
  }
}

export const aiTranslationCache = new AITranslationCache();
