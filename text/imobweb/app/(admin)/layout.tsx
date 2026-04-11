import React from "react";
import { ResponsiveSidebar } from "@/text/imobweb/components/navigation/ResponsiveSidebar";
import { FluidContainer } from "@/text/imobweb/components/responsive/FluidContainer";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Reutilizando a arquitetura core sem retrabalho */}
      <ResponsiveSidebar />
      
      {/* 
        O Admin requer exibição densa de dados (Tabelas de Log, Usuários complexos). 
        Usamos max-width 'full'. As tabelas receberão overflow-x-auto, 
        impedindo que quebrem a tela no mobile.
      */}
      <main className="flex-1 w-full min-w-0 overflow-x-hidden pt-fluid-6 pb-fluid-10">
        <FluidContainer maxWidth="full" className="flex flex-col gap-fluid-6">
          {children}
        </FluidContainer>
      </main>
    </div>
  );
}
