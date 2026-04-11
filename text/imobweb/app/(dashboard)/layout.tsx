import React from "react";
import { ResponsiveSidebar } from "@/components/navigation/ResponsiveSidebar";
import { ResponsiveHeader } from "@/components/navigation/ResponsiveHeader";
import { BottomNavigation } from "@/components/navigation/BottomNavigation";
import { FluidContainer } from "@/components/responsive/FluidContainer";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-muted/10">
      <ResponsiveSidebar />
      
      <main className="flex-1 flex flex-col w-full h-full min-h-screen overflow-x-hidden transition-all duration-300 pb-[calc(env(safe-area-inset-bottom)+4.5rem)] md:pb-fluid-10">
        
        {/* Agora o layout conta com o Responsive Header (Busca, Notificações, Perfil) fixo no Topo */}
        <ResponsiveHeader />

        <FluidContainer maxWidth="2xl" className="flex-1 flex flex-col w-full gap-fluid-6 pt-fluid-6">
          {children}
        </FluidContainer>
      </main>

      <BottomNavigation />
    </div>
  );
}
