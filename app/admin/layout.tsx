'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  Menu,
  X,
  Sparkles,
  User,
  LogOut,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useAuth, useHasRole } from '@/providers/auth-provider';
import { UserRole } from '@prisma/client';
import { ADMIN_MENU_CONFIG, type MenuItem } from '@/lib/admin-menu/menu-config';
import { cn } from '@/lib/utils';
import { useResponsive } from '@/hooks/use-responsive';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useAuth();
  const isAdmin = useHasRole(UserRole.PLATFORM_MASTER) || useHasRole(UserRole.ADMIN);
  const pathname = usePathname();
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);

  React.useEffect(() => {
    const parent = ADMIN_MENU_CONFIG.find((item) =>
      item.children?.some((child) => pathname.startsWith(child.href))
    );
    if (parent) {
      setOpenSubmenus((prev) => Array.from(new Set([...prev, parent.id])));
    }
  }, [pathname]);

  const toggleSubmenu = (id: string) => {
    setOpenSubmenus((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-5"
        >
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Zap className="w-7 h-7 text-white" />
            </div>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 animate-ping opacity-20" />
          </div>
          <div className="text-center">
            <p className="text-white font-semibold text-sm">Carregando painel</p>
            <p className="text-slate-500 text-xs mt-1">Inicializando módulos...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-sm"
        >
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-red-500/20 to-red-600/10 flex items-center justify-center mx-auto mb-6 border border-red-500/20">
            <ShieldCheck className="w-10 h-10 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Acesso Restrito</h1>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            Você não tem permissão para acessar o painel administrativo. Entre em contato com o suporte.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl text-sm font-semibold hover:shadow-lg hover:shadow-indigo-500/25 transition-all active:scale-95"
          >
            Voltar ao Dashboard
          </Link>
        </motion.div>
      </div>
    );
  }

  // --- MOBILE LAYOUT ---
  if (isMobile) {
    return (
      <div className="min-h-screen bg-[#0a0a0f]">
        <header className="fixed top-0 left-0 right-0 h-14 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5 z-50 flex items-center px-4 justify-between">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 -mr-2 rounded-xl hover:bg-white/5 transition-colors"
          >
            <Menu className="w-5 h-5 text-slate-300" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm text-white tracking-tight">
              Admin<span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Panel</span>
            </span>
          </div>
          <div className="w-9" />
        </header>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 z-50 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {mobileOpen && (
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 bottom-0 left-0 w-[280px] bg-[#0c0c14] z-50 flex flex-col border-r border-white/5"
            >
              <div className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <Zap className="text-white w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-base text-white tracking-tight block">
                      imob<span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Web</span>
                    </span>
                    <span className="text-[9px] bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-widest">
                      SUPER ADMIN
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 hover:bg-white/5 rounded-xl text-slate-500 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="px-4 mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Pesquisar..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/5 border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/30 transition-all placeholder:text-slate-600"
                  />
                </div>
              </div>

              <nav className="flex-1 overflow-y-auto px-3 space-y-0.5 pb-4">
                {ADMIN_MENU_CONFIG.map((item) => (
                  <SidebarItem
                    key={item.id}
                    item={item}
                    isCollapsed={false}
                    pathname={pathname}
                    isOpen={openSubmenus.includes(item.id)}
                    toggle={() => toggleSubmenu(item.id)}
                    onNavigate={() => setMobileOpen(false)}
                  />
                ))}
              </nav>

              <div className="p-4 border-t border-white/5">
                <div className="flex items-center gap-3 p-2">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shrink-0">
                    <User size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{user?.name || 'Admin'}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                  </div>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        <main className="pt-14 min-h-screen">{children}</main>
      </div>
    );
  }

  // --- TABLET / DESKTOP LAYOUT ---
  const sidebarCollapsed = isTablet || isCollapsed;

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">
      <motion.aside
        animate={{ width: sidebarCollapsed ? 72 : 272 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="h-screen bg-[#0c0c14] border-r border-white/5 flex flex-col sticky top-0 z-40 shrink-0"
      >
        {/* Logo */}
        <div className={cn("flex items-center border-b border-white/5", sidebarCollapsed ? "justify-center p-4" : "justify-between p-5")}>
          {!sidebarCollapsed ? (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Zap className="text-white w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-base text-white tracking-tight block leading-tight">
                  imob<span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Web</span>
                </span>
                <span className="text-[9px] bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-widest">
                  SUPER ADMIN
                </span>
              </div>
            </div>
          ) : (
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Zap className="text-white w-5 h-5" />
            </div>
          )}
          {isDesktop && !sidebarCollapsed && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 hover:bg-white/5 rounded-xl text-slate-500 hover:text-white transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
          )}
          {isDesktop && sidebarCollapsed && (
            <button
              onClick={() => setIsCollapsed(false)}
              className="absolute -right-3 top-7 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-500 transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          )}
        </div>

        {/* Search */}
        {!sidebarCollapsed && (
          <div className="px-4 py-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Pesquisar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/30 transition-all placeholder:text-slate-600"
              />
            </div>
          </div>
        )}

        {/* Menu */}
        <div className="flex-1 overflow-y-auto px-3 space-y-0.5 py-2 custom-scrollbar">
          {!sidebarCollapsed && (
            <p className="px-3 pt-2 pb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
              Navegação
            </p>
          )}
          {ADMIN_MENU_CONFIG.map((item) => (
            <SidebarItem
              key={item.id}
              item={item}
              isCollapsed={sidebarCollapsed}
              pathname={pathname}
              isOpen={openSubmenus.includes(item.id)}
              toggle={() => toggleSubmenu(item.id)}
            />
          ))}
        </div>

        {/* User Footer */}
        <div className="p-3 border-t border-white/5">
          <div
            className={cn(
              'flex items-center gap-3 p-2.5 rounded-xl transition-all cursor-pointer group',
              sidebarCollapsed && 'justify-center',
              'hover:bg-white/5'
            )}
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-indigo-500/20">
              <User size={16} />
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate group-hover:text-indigo-300 transition-colors">
                  {user?.name || 'Super Admin'}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {user?.email || 'admin@imobweb.com.br'}
                </p>
              </div>
            )}
          </div>

          <AnimatePresence>
            {showUserMenu && !sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, y: 4, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.98 }}
                className="mt-2 bg-[#12121a] rounded-xl border border-white/5 overflow-hidden shadow-xl shadow-black/20"
              >
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    signOut();
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut size={16} />
                  <span>Sair da conta</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>

      <main className="flex-1 min-w-0 min-h-screen overflow-x-hidden">{children}</main>
    </div>
  );
}

// --- SidebarItem ---
interface SidebarItemProps {
  item: MenuItem;
  isCollapsed: boolean;
  pathname: string;
  isOpen: boolean;
  toggle: () => void;
  onNavigate?: () => void;
}

function SidebarItem({ item, isCollapsed, pathname, isOpen, toggle, onNavigate }: SidebarItemProps) {
  const Icon = item.icon;
  const isActive =
    pathname === item.href ||
    pathname.startsWith(item.href + '/') ||
    item.children?.some((c) => pathname === c.href || pathname.startsWith(c.href + '/'));
  const hasChildren = item.children && item.children.length > 0;

  const handleClick = () => {
    if (hasChildren) {
      toggle();
    } else {
      onNavigate?.();
    }
  };

  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer relative group',
          isCollapsed && 'justify-center px-0',
          isActive
            ? 'bg-indigo-500/10 text-indigo-400 shadow-sm shadow-indigo-500/5'
            : 'text-slate-400 hover:bg-white/5 hover:text-white'
        )}
        onClick={handleClick}
        title={isCollapsed ? item.label : undefined}
      >
        {!hasChildren ? (
          <Link href={item.href} className="absolute inset-0" onClick={onNavigate} />
        ) : null}

        {Icon && (
          <Icon
            size={18}
            className={cn(
              'shrink-0 transition-colors',
              isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'
            )}
          />
        )}

        {!isCollapsed && (
          <span className={cn(
            'text-[13px] font-medium flex-1 truncate transition-colors',
            isActive && 'font-semibold'
          )}>
            {item.label}
          </span>
        )}

        {!isCollapsed && item.badge && (
          <span className="text-[10px] bg-indigo-500 text-white px-1.5 py-0.5 rounded-md font-bold shrink-0 shadow-sm shadow-indigo-500/20">
            {item.badge}
          </span>
        )}

        {!isCollapsed && item.isNew && (
          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded-md font-bold shrink-0 border border-emerald-500/20">
            NEW
          </span>
        )}

        {!isCollapsed && hasChildren && (
          <ChevronDown
            size={14}
            className={cn(
              'text-slate-600 transition-transform duration-300 shrink-0',
              isOpen && 'rotate-180'
            )}
          />
        )}

        {isActive && !hasChildren && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-gradient-to-b from-indigo-400 to-purple-500 rounded-r-full" />
        )}
      </div>

      <AnimatePresence>
        {!isCollapsed && hasChildren && isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden pl-4 py-1"
          >
            {item.children?.map((child) => (
              <Link
                key={child.id}
                href={child.href}
                onClick={onNavigate}
                className={cn(
                  'block py-2 px-4 text-[12px] font-medium rounded-lg transition-all my-0.5',
                  pathname === child.href || pathname.startsWith(child.href + '/')
                    ? 'text-indigo-400 bg-indigo-500/10'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                )}
              >
                {child.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
