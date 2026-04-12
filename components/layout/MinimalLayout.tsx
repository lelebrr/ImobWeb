'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { Topbar } from '@/components/navigation/Topbar';
import { BottomNavMobile } from '@/components/navigation/BottomNavMobile';

export function MinimalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const ownerUser = {
    name: 'Proprietário',
    email: 'acesso@imobweb.com',
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-muted/20">
      <Topbar user={ownerUser} />

      <main className="flex-1 overflow-auto relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="h-full"
          >
            <div className="container mx-auto p-4 md:p-6 pb-24 lg:pb-6 max-w-4xl">
              {children}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* For owners on mobile, bottom nav is easier to use than a sidebar */}
      <BottomNavMobile role="OWNER" />
    </div>
  );
}
