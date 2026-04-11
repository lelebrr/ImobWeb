"use client";

import React, { useState } from "react";
import { cn } from "@/lib/responsive/tailwind-utils";
import { Menu, X, Home, Users, Settings, Building, MapPin } from "lucide-react";
import { useResponsive } from "@/hooks/use-responsive";

export function ResponsiveSidebar({ children }: { children?: React.ReactNode }) {
  const { isMobile, isTablet, isClient } = useResponsive();
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  // Evita render mismatch durante o SSR com Layout Shifts bruscos
  if (!isClient) return null;

  // No modo Tablet (MD a LG), o navbar é nativamente miniaturizado. Desktop é Expandido.
  const isCollapsed = isTablet;

  const toggleMobileNav = () => setIsOpenMobile((prev) => !prev);

  // === VERSÃO MOBILE ===
  // No formato mobile, convertemos a sidebar em um menu Drawer lateral
  if (isMobile) {
    return (
      <>
        {/* Topbar Fixa - Ocupa Navbar no Mobile */}
        <header className="fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-md border-b z-50 flex items-center px-4 justify-between transition-all">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
              <Building className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg tracking-tight">ImobWeb</span>
          </div>
          <button 
            onClick={toggleMobileNav} 
            className="p-2 -mr-2 rounded-md hover:bg-muted"
            aria-label="Abrir menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>

        {/* Drawer Backdrop Overlay */}
        <div 
          className={cn(
            "fixed inset-0 bg-black/60 z-50 backdrop-blur-sm transition-opacity duration-300",
            isOpenMobile ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
          onClick={() => setIsOpenMobile(false)}
        />

        {/* Slider Drawer Nav */}
        <aside 
          className={cn(
            "fixed top-0 bottom-0 left-0 w-72 bg-card border-r z-50 transform transition-transform duration-300 ease-out flex flex-col",
            isOpenMobile ? "translate-x-0 shadow-2xl" : "-translate-x-full"
          )}
        >
          <div className="flex bg-muted/30 h-16 items-center justify-between px-6 border-b">
            <span className="font-bold text-[1.125rem]">Navegação</span>
            <button onClick={toggleMobileNav} className="p-2 -mr-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5"/>
            </button>
          </div>
          <nav className="p-4 flex-1 overflow-y-auto flex flex-col gap-1">
            <NavItem icon={<Home />} label="Dashboard Principal" />
            <NavItem icon={<Building />} label="Meus Imóveis" badge="14" />
            <NavItem icon={<Users />} label="Leads / CRM" />
            <NavItem icon={<MapPin />} label="Mapa de Captação" />
            
            <div className="mt-8 mb-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3">Administrativo</p>
            </div>
            <NavItem icon={<Settings />} label="Configurações" />
            {children}
          </nav>
        </aside>

        {/* Espaçador invisivel pro conteudo da tela nao grudar no topo */}
        <div className="pt-16" />
      </>
    );
  }

  // === VERSÃO TABLET E DESKTOP ===
  return (
    <aside 
      className={cn(
        "h-screen sticky top-0 bg-card border-r transition-all duration-300 ease-in-out flex flex-col z-30 shrink-0",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logos & Head */}
      <div className={cn(
        "flex h-16 items-center border-b transition-all duration-300",
        isCollapsed ? "justify-center px-0" : "justify-start px-6 gap-3"
      )}>
        <div className="w-8 h-8 rounded shrink-0 bg-primary flex items-center justify-center">
          <Building className="w-4 h-4 text-primary-foreground" />
        </div>
        {!isCollapsed && (
          <span className="font-bold text-lg overflow-hidden whitespace-nowrap animate-in fade-in">
            ImobWeb SaaS
          </span>
        )}
      </div>

      {/* Primary Links */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 flex flex-col gap-2">
        <NavItem icon={<Home />} label="Dashboard" collapsed={isCollapsed} active />
        <NavItem icon={<Building />} label="Imóveis" collapsed={isCollapsed} />
        <NavItem icon={<Users />} label="Leads" collapsed={isCollapsed} />
        <NavItem icon={<MapPin />} label="Integração de Mapa" collapsed={isCollapsed} />
        <NavItem icon={<Settings />} label="Configurações" collapsed={isCollapsed} />
        {children}
      </nav>
    </aside>
  );
}

// Subcomponente encapsulado do Navbar para simplificar o codigo base
function NavItem({ 
  icon, 
  label, 
  collapsed = false, 
  active = false,
  badge 
}: { 
  icon: React.ReactNode; 
  label: string; 
  collapsed?: boolean;
  active?: boolean;
  badge?: string;
}) {
  return (
    <button 
      className={cn(
        "group flex w-full items-center gap-3 rounded-lg transition-all duration-200 outline-none focus-visible:ring-2 relative",
        collapsed ? "justify-center p-3" : "justify-start p-3 px-4",
        active 
          ? "bg-primary/10 text-primary font-medium" 
          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
      )}
      title={collapsed ? label : undefined}
    >
      {React.cloneElement(icon as React.ReactElement<any>, { 
        className: cn(
          "w-5 h-5 shrink-0 transition-colors", 
          active ? "text-primary" : "group-hover:text-foreground"
        ) 
      })}
      
      {/* Label só aparece cheia se não colapsado */}
      {!collapsed && (
        <span className="text-sm flex-1 text-left truncate transition-all duration-300 pointer-events-none">
          {label}
        </span>
      )}
      
      {/* Mini notification badge handler */}
      {!collapsed && badge && (
        <span className="bg-primary/20 text-primary text-xs font-bold px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
      
      {/* Status Dot for colapsed menu with badges */}
      {collapsed && badge && (
        <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full animate-pulse" />
      )}
    </button>
  );
}
