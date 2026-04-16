'use client';

import { useEffect } from 'react';

/**
 * PWA HANDLER - IMOBWEB 2026
 * Responsibilities:
 * - Service Worker Registration
 * - Offline status management
 * - Installation prompt logic (optional)
 */
export function PWAHandler() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('SW registered: ', registration);
          })
          .catch((registrationError) => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }

    // Handle offline status
    const handleOnline = () => {
      document.body.classList.remove('is-offline');
      console.log('App is online');
    };

    const handleOffline = () => {
      document.body.classList.add('is-offline');
      console.log('App is offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return null;
}
