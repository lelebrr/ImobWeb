'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
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
  X,
  DollarSign,
  FileText,
  ShieldCheck,
  Brain,
  Store,
  ShoppingBag,
  Target,
  Globe,
  Bell
} from 'lucide-react'
import { cn } from '@/lib/responsive/tailwind-utils'
import { useAuth } from '@/providers/auth-provider'

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Home, label: 'Imóveis', href: '/properties' },
  { icon: Users, label: 'Leads', href: '/leads' },
  { icon: MessageSquare, label: 'Mensagens', href: '/conversations' },
  { icon: CalendarDays, label: 'Agenda', href: '/schedule' },
  { icon: DollarSign, label: 'ImobPay', href: '/finance' },
  { icon: FileText, label: 'Contratos', href: '/contracts' },
  { icon: ShieldCheck, label: 'Garantia de Vida', href: '/proof-of-life' },
  { icon: Brain, label: 'Insights AI', href: '/insights' },
  { icon: Store, label: 'Franquias', href: '/franchise' },
  { icon: ShoppingBag, label: 'Marketplace', href: '/marketplace' },
  { icon: BarChart3, label: 'Analytics', href: '/analytics' },
  { icon: Zap, label: 'Automações', href: '/integrations' },
  { icon: Settings, label: 'Configurações', href: '/settings' },
]

const sidebarVariants = {
  open: { x: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 30 } },
  closed: { x: -288, transition: { type: 'spring' as const, stiffness: 300, damping: 30 } }
}

const overlayVariants = {
  open: { opacity: 1 },
  closed: { opacity: 0 }
}

const navItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.03, type: 'spring' as const, stiffness: 300, damping: 25 }
  })
}

export function Sidebar() {
  const pathname = usePathname()
  const { signOut } = useAuth()
  const [collapsed, setCollapsed] = React.useState(false)
  const [mobileOpen, setMobileOpen] = React.useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
      window.location.href = '/login'
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
      window.location.href = '/login'
    }
  }

  const isActive = (href: string) => pathname === href

  return (
    <>
      {/* MOBILE: Hamburger Button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3.5 left-4 z-50 w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20"
        aria-label="Abrir menu"
      >
        <Menu className="w-5 h-5" />
      </motion.button>

      {/* MOBILE: Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            variants={overlayVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* MOBILE: Slide-in Sidebar */}
      <motion.aside
        variants={sidebarVariants}
        initial="closed"
        animate={mobileOpen ? "open" : "closed"}
        className="lg:hidden fixed inset-y-0 left-0 z-[70] w-72 bg-background border-r border-border/50 flex flex-col"
      >
        {/* Close button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors z-10"
          aria-label="Fechar menu"
        >
          <X className="w-5 h-5" />
        </motion.button>

        {/* Mobile sidebar content */}
        <div className="h-16 flex items-center px-6 gap-3 border-b border-border/50 shrink-0">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          <span className="font-black text-xl tracking-tighter text-gradient">imobWeb</span>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-hide">
          {menuItems.map((item, i) => {
            const active = isActive(item.href)
            return (
              <motion.div
                key={item.href}
                custom={i}
                variants={navItemVariants}
                initial="hidden"
                animate="visible"
              >
                <Link href={item.href} onClick={() => setMobileOpen(false)}>
                  <div className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative",
                    active
                      ? "bg-primary text-white shadow-lg shadow-primary/20"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}>
                    <item.icon className={cn("w-5 h-5 shrink-0", active ? "text-white" : "group-hover:text-primary")} />
                    <span className="font-semibold text-sm truncate">{item.label}</span>
                    {active && (
                      <motion.div
                        layoutId="mobile-active-indicator"
                        className="absolute right-2 w-1.5 h-1.5 bg-white rounded-full"
                      />
                    )}
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </nav>

        <div className="p-4 border-t border-border/50 shrink-0">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-3 py-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span className="text-sm font-semibold">Sair</span>
          </motion.button>
        </div>
      </motion.aside>

      {/* DESKTOP: Fixed Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 80 : undefined }}
        className={cn(
          "hidden lg:flex h-screen sticky top-0 border-r border-border/50 flex-col bg-background/80 backdrop-blur-xl transition-all duration-300 shrink-0",
          collapsed ? "w-20" : "w-[clamp(14rem,15vw,18rem)]"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 gap-3 border-b border-border/50 shrink-0">
          <motion.div
            whileHover={{ rotate: 15, scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0 shadow-lg shadow-primary/20 cursor-pointer"
          >
            <Zap className="w-5 h-5 text-white fill-white" />
          </motion.div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="font-black text-xl tracking-tighter text-gradient overflow-hidden whitespace-nowrap"
              >
                imobWeb
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-hide">
          {menuItems.map((item, i) => {
            const active = isActive(item.href)
            return (
              <motion.div
                key={item.href}
                custom={i}
                variants={navItemVariants}
                initial="hidden"
                animate="visible"
              >
                <Link href={item.href}>
                  <motion.div
                    whileHover={{ x: active ? 0 : 4 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative",
                      active
                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                  >
                    <item.icon className={cn("w-5 h-5 shrink-0", active ? "text-white" : "group-hover:text-primary")} />
                    <AnimatePresence>
                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          className="font-semibold text-base truncate overflow-hidden whitespace-nowrap"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {active && !collapsed && (
                      <motion.div
                        layoutId="desktop-active-indicator"
                        className="absolute right-2 w-1.5 h-1.5 bg-white rounded-full"
                      />
                    )}
                  </motion.div>
                </Link>
              </motion.div>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border/50 space-y-2 shrink-0">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center gap-3 w-full px-3 py-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <motion.div
              animate={{ rotate: collapsed ? 180 : 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <ChevronLeft className="w-5 h-5 shrink-0" />
            </motion.div>
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="text-sm font-medium overflow-hidden whitespace-nowrap"
                >
                  Recolher
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02, backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-3 py-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="text-sm font-semibold overflow-hidden whitespace-nowrap"
                >
                  Sair
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.aside>
    </>
  )
}
