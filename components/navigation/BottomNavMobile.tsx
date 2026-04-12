'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { MENU_CONFIG } from '@/lib/navigation/menu-config';
import { UserRole, NavItem } from '@/types/navigation';
import { Menu, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BottomNavMobileProps {
  role: UserRole;
  onQuickAction?: () => void;
  onOpenMenu?: () => void;
}

export function BottomNavMobile({ role, onQuickAction, onOpenMenu }: BottomNavMobileProps) {
  const pathname = usePathname();
  
  // Extract up to 4 primary navigation items for the bottom bar from the first section
  const sections = MENU_CONFIG[role] || [];
  const allItems = sections.flatMap(sec => sec.items);
  const primaryItems = allItems.slice(0, 4); 

  return (
    <>
      {/* Floating Action Button (FAB) for mobile quick actions */}
      <div className="fixed bottom-20 right-4 z-50 lg:hidden">
        <Button 
          size="icon" 
          className="h-14 w-14 rounded-full shadow-xl bg-primary hover:bg-primary/90 transition-transform active:scale-95"
          onClick={onQuickAction}
        >
          <Plus className="h-6 w-6 text-primary-foreground" />
        </Button>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 z-40 w-full border-t bg-background/95 backdrop-blur-md pb-safe lg:hidden border-border/40 shadow-t">
        <nav className="flex justify-around items-center h-16 px-2">
          {primaryItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex flex-col items-center justify-center w-full h-full space-y-1 text-xs font-medium transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="mobileActiveTab"
                    className="absolute top-0 w-12 h-1 bg-primary rounded-b-full shadow-[0_0_8px_rgba(var(--primary),0.5)]"
                  />
                )}
                <Icon className={cn("h-5 w-5 mb-0.5 transition-transform", isActive && "scale-110")} />
                <span className="truncate max-w-[80px]">{item.title}</span>
              </Link>
            );
          })}
          
          <button
            onClick={onOpenMenu}
            className="flex flex-col items-center justify-center w-full h-full space-y-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <Menu className="h-5 w-5 mb-0.5" />
            <span>Menu</span>
          </button>
        </nav>
      </div>
    </>
  );
}
