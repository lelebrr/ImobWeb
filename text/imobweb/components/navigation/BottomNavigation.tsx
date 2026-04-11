"use client";
import React from "react";
import { useResponsive } from "@/text/imobweb/hooks/use-responsive";
import { Home, Search, Building2, Settings, Users } from "lucide-react";
import { cn } from "@/text/imobweb/lib/responsive/tailwind-utils";

export function BottomNavigation() {
  const { isMobile, isClient } = useResponsive();

  // Só deve ser renderizado puramente no Frontend quando for uma tela Mobile
  if (!isClient || !isMobile) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-background/95 backdrop-blur-xl border-t z-50 flex items-center justify-between px-2 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
      <NavItem icon={<Home />} label="Início" active />
      <NavItem icon={<Search />} label="Busca" />
      <NavItem icon={<Building2 />} label="Imóveis" />
      <NavItem icon={<Users />} label="Leads" />
      <NavItem icon={<Settings />} label="Config" />
    </nav>
  );
}

function NavItem({ icon, label, active = false }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <button className={cn(
      "flex flex-col items-center justify-center flex-1 h-full gap-1.5 transition-all duration-200 outline-none select-none",
      active ? "text-primary scale-105" : "text-muted-foreground hover:text-foreground active:scale-95"
    )}>
      <div className={cn("relative", active && "after:absolute after:-bottom-3 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-primary after:rounded-full")}>
         {React.cloneElement(icon as React.ReactElement, { className: "w-5 h-5" })}
      </div>
      <span className="text-[10px] font-semibold tracking-wider">{label}</span>
    </button>
  );
}
