'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Home, 
  Users, 
  MessageSquare, 
  BarChart3, 
  Settings, 
  Zap, 
  ChevronLeft, 
  LogOut 
} from 'lucide-react'
import { cn } from '@/lib/responsive/tailwind-utils'
import { Button } from '@/components/design-system/button'

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Home, label: 'Imóveis', href: '/properties' },
  { icon: Users, label: 'Leads', href: '/leads' },
  { icon: MessageSquare, label: 'Mensagens', href: '/conversations' },
  { icon: BarChart3, label: 'Relatórios', href: '/analytics' },
  { icon: Zap, label: 'Automações', href: '/integrations' },
  { icon: Settings, label: 'Configurações', href: '/settings' },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = React.useState(false)

  return (
    <aside className={cn(
      "glass border-r h-full transition-all duration-300 flex flex-col z-40 sticky top-0",
      collapsed ? "w-20" : "w-64"
    )}>
      {/* Header Logo */}
      <div className="h-16 flex items-center px-6 gap-3 border-b border-border/50">
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
                <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "group-hover:text-primary")} />
                {!collapsed && <span className="font-semibold text-sm">{item.label}</span>}
                
                {isActive && !collapsed && (
                   <div className="absolute right-2 w-1.5 h-1.5 bg-white rounded-full" />
                )}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border/50 space-y-2">
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 w-full px-3 py-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className={cn("w-5 h-5 transition-transform", collapsed && "rotate-180")} />
          {!collapsed && <span className="text-sm font-medium">Recolher</span>}
        </button>
        
        <button className="flex items-center gap-3 w-full px-3 py-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors">
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="text-sm font-semibold">Sair</span>}
        </button>
      </div>
    </aside>
  )
}
