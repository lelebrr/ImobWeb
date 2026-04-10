'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'; // Assuming standard shadcn path
import { Button } from '@/components/ui/button';
import { Globe, Checks } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { locales, localeLabels, Locale } from '@/lib/i18n/settings';

/**
 * Premium Language Switcher Component
 * Uses framer-motion for smooth transitions and follows imobWeb design system.
 */
export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = React.useTransition();

  function onSelectLocale(nextLocale: string) {
    startTransition(() => {
      // Replace the current locale in the path
      const pathSegments = pathname.split('/');
      pathSegments[1] = nextLocale;
      const nextPathname = pathSegments.join('/') || '/';
      
      router.replace(nextPathname);
    });
  }

  const flags: Record<Locale, string> = {
    'pt-BR': '🇧🇷',
    'en-US': '🇺🇸',
    'en-GB': '🇬🇧',
    'es-ES': '🇪🇸',
    'es-LA': '🌎'
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center gap-2 px-3 hover:bg-white/10 transition-colors duration-200"
          disabled={isPending}
        >
          <motion.div
            initial={{ rotate: 0 }}
            whileHover={{ rotate: 180 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          >
            <Globe className="h-4 w-4 text-primary" />
          </motion.div>
          <span className="text-sm font-medium uppercase">{locale.split('-')[0]}</span>
          <span className="text-xs opacity-50">{flags[locale]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px] border-white/10 bg-black/90 backdrop-blur-xl">
        <AnimatePresence>
          {locales.map((l) => (
            <DropdownMenuItem
              key={l}
              onClick={() => onSelectLocale(l)}
              className="flex items-center justify-between cursor-pointer focus:bg-primary/20"
            >
              <div className="flex items-center gap-3">
                <span>{flags[l]}</span>
                <span className={l === locale ? 'font-bold text-primary' : ''}>
                  {localeLabels[l]}
                </span>
              </div>
              {l === locale && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  <Checks className="h-4 w-4 text-primary" />
                </motion.div>
              )}
            </DropdownMenuItem>
          ))}
        </AnimatePresence>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
