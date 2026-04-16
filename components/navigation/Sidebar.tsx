'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MENU_CONFIG } from '@/lib/navigation/menu-config';
import { UserRole } from '@/types/navigation';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSidebarStore } from '@/hooks/use-sidebar';
import { ImageOptimized } from '@/components/performance/ImageOptimized';

interface SidebarProps {
  role: UserRole;
  logoUrl?: string;
  tenantName?: string;
}

export function Sidebar({ role, logoUrl, tenantName = 'ImobWeb' }: SidebarProps) {
  const pathname = usePathname();
  const { isCollapsed, setCollapsed, toggleCollapse } = useSidebarStore();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const sections = MENU_CONFIG[role] || [];

  // Prevent SSR flash
  useEffect(() => {
    setMounted(true);
    // Auto collapse on small displays (tablets)
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setCollapsed(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!mounted) return null;

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Main Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 80 : 260 }}
        className={cn(
          "fixed top-0 left-0 z-50 h-screen flex-col border-r bg-card text-card-foreground transition-all duration-300 ease-in-out lg:translate-x-0 hidden lg:flex", // Hidden on mobile, use Bottom Nav
          isMobileOpen ? "flex translate-x-0 !w-[260px]" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header / Logo */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b px-4">
          <Link href="/" className="flex items-center gap-3 overflow-hidden">
            {logoUrl ? (
              <ImageOptimized
                src={logoUrl}
                alt={tenantName}
                width={32}
                height={32}
                className="h-8 w-auto shrink-0"
                containerClassName=""
                priority={true}
              />
            ) : (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold font-heading">
                {tenantName.substring(0, 1).toUpperCase()}
              </div>
            )}
            {!isCollapsed && (
              <span className="font-heading text-lg font-semibold whitespace-nowrap tracking-tight">
                {tenantName}
              </span>
            )}
          </Link>
        </div>

        {/* Navigation Area */}
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="flex flex-col gap-6">
            {sections.map((section, index) => (
              <div key={index} className="flex flex-col gap-2">
                {section.title && !isCollapsed && (
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
                    {section.title}
                  </h4>
                )}
                {section.title && isCollapsed && (
                  <div className="w-full flex justify-center mb-2">
                    <div className="h-px w-8 bg-border" />
                  </div>
                )}

                <div className="flex flex-col gap-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "relative flex items-center justify-center lg:justify-start gap-3 rounded-lg px-2 py-2 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary",
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                          isCollapsed ? "justify-center" : "justify-start"
                        )}
                        title={isCollapsed ? item.title : undefined}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="activeNav"
                            className="absolute left-0 w-1 h-full bg-primary rounded-r-full"
                          />
                        )}
                        <Icon className={cn("h-5 w-5 shrink-0", isActive && "text-primary")} />

                        {!isCollapsed && (
                          <span className="flex-1 truncate">{item.title}</span>
                        )}

                        {item.badge && !isCollapsed && (
                          <span className="ml-auto flex h-5 items-center justify-center rounded-full bg-primary/20 px-2 text-[10px] font-semibold text-primary">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>
        </ScrollArea>

        {/* Footer / Toggle */}
        <div className="p-4 mt-auto border-t">
          <Button
            variant="ghost"
            size="icon"
            className="w-full flex items-center justify-center text-muted-foreground hover:text-foreground hidden lg:flex"
            onClick={toggleCollapse}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </motion.aside>

      {/* Mobile Trigger overlay inside global Topbar typically, kept here for standalone functionality if needed */}
      <div className="lg:hidden fixed bottom-4 right-4 z-50">
        <Button size="icon" className="rounded-full shadow-lg" onClick={() => setIsMobileOpen(true)}>
          <Menu />
        </Button>
      </div>
    </>
  );
}
