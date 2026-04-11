'use client';

import React from 'react';
import { Sidebar } from '@/components/navigation/Sidebar';
import { Topbar } from '@/components/navigation/Topbar';
import { BottomNavMobile } from '@/components/navigation/BottomNavMobile';
import { UserRole } from '@/types/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

import { useSidebarStore } from '@/hooks/use-sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  role?: UserRole;
  user?: {
    name: string;
    email: string;
    avatarUrl?: string;
  };
  tenantName?: string;
  logoUrl?: string;
}

export function DashboardLayout({
  children,
  role = 'MANAGER',
  user = { name: 'João Silva', email: 'joao@imobiliaria.com' },
  tenantName = 'ImobWeb',
  logoUrl
}: DashboardLayoutProps) {
  const pathname = usePathname();
  const { isCollapsed } = useSidebarStore();

  const handleQuickAction = () => {
    // Integrate with Command Palette / KBar later
    console.log("Quick Action Triggered");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar - Desktop Only */}
      <Sidebar role={role} tenantName={tenantName} logoUrl={logoUrl} />

      <div 
        className={cn(
          "flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out lg:pl-0",
          isCollapsed ? "lg:ml-[80px]" : "lg:ml-[260px]"
        )}
      >
        <Topbar user={user} onQuickAction={handleQuickAction} />

        <main className="flex-1 overflow-auto relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="h-full"
            >
              <div className="container mx-auto p-4 md:p-6 pb-24 lg:pb-6 max-w-7xl">
                {children}
              </div>
            </motion.div>
          </AnimatePresence>
        </main>
        
        {/* Mobile Bottom Navigation */}
        <BottomNavMobile role={role} onQuickAction={handleQuickAction} />
      </div>
    </div>
  );
}
