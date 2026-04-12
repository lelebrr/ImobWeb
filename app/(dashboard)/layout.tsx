import React from 'react'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Topbar } from '@/components/dashboard/topbar'

/**
 * DashboardLayout
 * Shell principal para as páginas administrativas e operacionais
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-dashboard-gradient">
      {/* Sidebar Fixa (Desktop) */}
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar Fixa */}
        <Topbar />

        {/* Área de Conteúdo Scrollável */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 relative scrollbar-hide">
          {/* Decorative Backglows */}
          <div className="hero-glow top-0 right-1/4" />
          <div className="hero-glow bottom-0 left-1/4 scale-150 opacity-30" />
          
          <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
