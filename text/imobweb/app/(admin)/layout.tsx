import React from 'react';
import { AdminSidebar } from '../../components/admin/navigation/AdminSidebar';

/**
 * SUPER ADMIN LAYOUT - IMOBWEB 2026
 * Wraps all admin routes with the premium sidebar and global admin context.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-950">
      {/* --- SIDEBAR --- */}
      <AdminSidebar />

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Header Placeholder (Global Admin Search / Profile) */}
        <header className="h-16 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-8">
          <div className="flex-1 max-w-xl hidden md:block">
             {/* Global admin-level search could go here */}
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end mr-2">
              <span className="text-xs font-bold text-indigo-400">STATUS DO SISTEMA</span>
              <span className="text-[10px] text-emerald-500 font-mono animate-pulse">● OPERACIONAL</span>
            </div>
            {/* Additional header controls */}
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar">
          {children}
        </div>
      </main>
    </div>
  );
}
