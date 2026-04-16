import React from "react";
import { ResponsiveSidebar } from "@/components/navigation/ResponsiveSidebar";
import { FluidContainer } from "@/components/responsive/FluidContainer";

export default function PartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <ResponsiveSidebar />
      
      {/* 
        Layout para parceiros/franchises geralmente requer UI envolta num Box 
        para sensação de App "isolado". 
      */}
      <main className="flex-1 w-full bg-secondary/30 overflow-x-hidden pt-fluid-6 pb-fluid-10">
        <FluidContainer maxWidth="2xl">
          <div className="bg-card w-full min-h-[85vh] rounded-2xl border shadow-sm p-fluid-4 md:p-fluid-8 lg:p-fluid-10">
            {children}
          </div>
        </FluidContainer>
      </main>
    </div>
  );
}
