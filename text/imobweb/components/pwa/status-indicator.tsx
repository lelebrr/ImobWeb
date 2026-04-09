'use client';

import { useEffect, useState } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

interface NetworkStatus {
  isOnline: boolean;
  wasOffline: boolean;
}

export function PWAStatusIndicator() {
  const [status, setStatus] = useState<NetworkStatus>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    wasOffline: false,
  });

  useEffect(() => {
    const handleOnline = () => setStatus({ isOnline: true, wasOffline: true });
    const handleOffline = () => setStatus({ isOnline: false, wasOffline: false });

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (status.isOnline) {
    if (!status.wasOffline) return null;
    return (
      <div
        style={{
          position: 'fixed',
          top: 16,
          right: 16,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 16px',
          background: '#48bb78',
          color: 'white',
          borderRadius: 20,
          fontSize: 13,
          fontWeight: 500,
          boxShadow: '0 4px 12px rgba(72, 187, 120, 0.3)',
        }}
      >
        <Wifi size={16} />
        <span>Conectado</span>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 16px',
        background: '#e53e3e',
        color: 'white',
        borderRadius: 20,
        fontSize: 13,
        fontWeight: 500,
        boxShadow: '0 4px 12px rgba(229, 62, 62, 0.3)',
      }}
    >
      <WifiOff size={16} />
      <span>Offline</span>
    </div>
  );
}

export default PWAStatusIndicator;