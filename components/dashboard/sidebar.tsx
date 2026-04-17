'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  LayoutDashboard, 
  Home, 
  Users, 
  MessageSquare, 
  BarChart3, 
  Settings, 
  Zap, 
  ChevronLeft, 
  LogOut,
  CalendarDays,
  Menu,
  X
} from 'lucide-react'
import { cn } from '@/lib/responsive/tailwind-utils'
import { useAuth } from '@/providers/auth-provider'

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Home, label: 'Imóveis', href: '/properties' },
  { icon: Users, label: 'Leads', href: '/leads' },
  { icon: MessageSquare, label: 'Mensagens', href: '/conversations' },
  { icon: CalendarDays, label: 'Agenda', href: '/schedule' },
  { icon: BarChart3, label: 'Analytics', href: '/analytics' },
  { icon: Zap, label: 'Automações', href: '/integrations' },
  { icon: Settings, label: 'Configurações', href: '/settings' },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { signOut } = useAuth()
  const [collapsed, setCollapsed] = React.useState(false)
  const [mobileOpen, setMobileOpen] = React.useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
      // Redirecionamento forçado para limpar cache e estado
      window.location.href = '/login'
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
      window.location.href = '/login' // Tentar redirecionar mesmo se falhar
    }
  }

  return (
    <>
      {/* ======== MOBILE: Hamburger Button (only visible on < lg) ======== */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3.5 left-4 z-50 w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20"
        aria-label="Abrir menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* ======== MOBILE: Overlay ======== */}
      {mobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ======== MOBILE: Slide-in Sidebar ======== */}
      <aside className={cn(
        "lg:hidden fixed inset-y-0 left-0 z-[70] w-72 bg-background border-r border-border/50 flex flex-col transition-transform duration-300 ease-in-out",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Close button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors z-10"
          aria-label="Fechar menu"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Mobile sidebar content */}
        <div className="h-16 flex items-center px-6 gap-3 border-b border-border/50 shrink-0">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          <span className="font-black text-xl tracking-tighter text-gradient">imobWeb</span>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-hide">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
                <div className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative",
                  isActive 
                    ? "bg-primary text-white shadow-lg shadow-primary/20" 
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}>
                  <item.icon className={cn("w-5 h-5 shrink-0", isActive ? "text-white" : "group-hover:text-primary")} />
                  <span className="font-semibold text-sm truncate">{item.label}</span>
                  {isActive && (
                    <div className="absolute right-2 w-1.5 h-1.5 bg-white rounded-full" />
                  )}
                </div>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-border/50 shrink-0">
          <button 
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-3 py-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span className="text-sm font-semibold">Sair</span>
          </button>
        </div>
      </aside>

      {/* ======== DESKTOP: Fixed Sidebar ======== */}
      <aside className={cn(
        "hidden lg:flex h-screen sticky top-0 border-r border-border/50 flex-col bg-background/80 backdrop-blur-xl transition-all duration-300 shrink-0",
        collapsed ? "w-20" : "w-[clamp(14rem,15vw,18rem)]"
      )}>
        {/* Logo */}
        <div className="h-16 flex items-center px-6 gap-3 border-b border-border/50 shrink-0">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          {!collapsed && (
            <span className="font-black text-xl tracking-tighter text-gradient">imobWeb</span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-hide">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <div className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative",
                  isActive 
                    ? "bg-primary text-white shadow-lg shadow-primary/20" 
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}>
                  <item.icon className={cn("w-5 h-5 shrink-0", isActive ? "text-white" : "group-hover:text-primary")} />
                  {!collapsed && <span className="font-semibold text-base truncate">{item.label}</span>}
                  {isActive && !collapsed && (
                    <div className="absolute right-2 w-1.5 h-1.5 bg-white rounded-full" />
                  )}
                </div>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border/50 space-y-2 shrink-0">
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center gap-3 w-full px-3 py-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className={cn("w-5 h-5 transition-transform shrink-0", collapsed && "rotate-180")} />
            {!collapsed && <span className="text-sm font-medium">Recolher</span>}
          </button>
          
          <button 
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-3 py-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!collapsed && <span className="text-sm font-semibold">Sair</span>}
          </button>
        </div>
      </aside>
    </>
  )
}
