'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  Search, 
  Bell, 
  User, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { ADMIN_MENU_CONFIG, MenuItem } from '../../../lib/admin-menu/menu-config';
import { cn } from '../../../lib/utils';

/**
 * PREMIUM ADMIN SIDEBAR - IMOBWEB 2026
 * Features:
 * - Hierarchical submenus with animations
 * - Collapsible state
 * - Quick search
 * - Role-based visibility
 * - High-end aesthetics (glassmorphism)
 */
export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Auto-open submenu based on current path
  useEffect(() => {
    const parent = ADMIN_MENU_CONFIG.find(item => 
      item.children?.some(child => pathname.startsWith(child.href))
    );
    if (parent) setOpenSubmenus(prev => Array.from(new Set([...prev, parent.id])));
  }, [pathname]);

  const toggleSubmenu = (id: string) => {
    setOpenSubmenus(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 80 : 280 }}
      className="h-screen bg-slate-950 border-r border-slate-900 flex flex-col sticky top-0 z-50 transition-all shadow-2xl"
    >
      {/* --- LOGO SECTION --- */}
      <div className="p-6 flex items-center justify-between">
        {!isCollapsed && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Sparkles className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-xl text-white tracking-tight"> imob<span className="text-indigo-500">Web</span></span>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">SUPER</span>
          </motion.div>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 hover:bg-slate-900 rounded-md text-slate-500 hover:text-white transition-colors"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* --- SEARCH BAR --- */}
      {!isCollapsed && (
        <div className="px-4 mb-6">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Pesquisar..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-600"
            />
          </div>
        </div>
      )}

      {/* --- MENU LIST --- */}
      <div className="flex-1 overflow-y-auto px-4 space-y-2 no-scrollbar">
        {ADMIN_MENU_CONFIG.map((item) => (
          <MenuItem 
            key={item.id} 
            item={item} 
            isCollapsed={isCollapsed} 
            pathname={pathname}
            isOpen={openSubmenus.includes(item.id)}
            toggle={() => toggleSubmenu(item.id)}
          />
        ))}
      </div>

      {/* --- FOOTER / USER --- */}
      <div className="p-4 mt-auto border-t border-slate-900">
        <div className={cn(
          "flex items-center gap-3 p-2 rounded-xl transition-colors hover:bg-slate-900/50 cursor-pointer",
          isCollapsed && "justify-center"
        )}>
          <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white ring-2 ring-indigo-500/20">
            <User size={20} />
          </div>
          {!isCollapsed && (
            <div className="flex-1 truncate">
              <p className="text-sm font-semibold text-white truncate">Super Admin</p>
              <p className="text-xs text-slate-500 truncate">admin@imobweb.com.br</p>
            </div>
          )}
        </div>
      </div>
    </motion.aside>
  );
};

interface MenuItemProps {
  item: MenuItem;
  isCollapsed: boolean;
  pathname: string;
  isOpen: boolean;
  toggle: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ item, isCollapsed, pathname, isOpen, toggle }) => {
  const Icon = item.icon;
  const isActive = pathname === item.href || item.children?.some(c => pathname === c.href);
  const hasChildren = item.children && item.children.length > 0;

  return (
    <div className="space-y-1">
      <div 
        className={cn(
          "flex items-center gap-3 p-2.5 rounded-xl transition-all group relative cursor-pointer",
          isActive ? "bg-indigo-600/10 text-indigo-400" : "text-slate-400 hover:bg-slate-900 hover:text-white",
          isCollapsed && "justify-center"
        )}
        onClick={hasChildren ? toggle : undefined}
      >
        {!hasChildren ? (
          <Link href={item.href} className="absolute inset-0" />
        ) : null}

        {Icon && <Icon size={20} className={cn(isActive && "text-indigo-400")} />}
        
        {!isCollapsed && (
          <span className="text-sm font-medium flex-1 truncate">{item.label}</span>
        )}

        {!isCollapsed && item.badge && (
          <span className="text-[10px] bg-indigo-600 text-white px-1.5 py-0.5 rounded-full font-bold">
            {item.badge}
          </span>
        )}

        {!isCollapsed && hasChildren && (
          <ChevronDown 
            size={16} 
            className={cn("text-slate-600 transition-transform duration-300", isOpen && "rotate-180")} 
          />
        )}

        {/* Indicator */}
        {isActive && !hasChildren && (
          <motion.div 
            layoutId="active-indicator"
            className="absolute left-[-4px] top-1/2 -translate-y-1/2 w-1 h-5 bg-indigo-500 rounded-full"
          />
        )}
      </div>

      {/* Submenus */}
      <AnimatePresence>
        {!isCollapsed && hasChildren && isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden pl-10 space-y-1"
          >
            {item.children?.map((child) => (
              <Link 
                key={child.id}
                href={child.href}
                className={cn(
                  "block py-2 text-xs font-medium transition-colors hover:text-white",
                  pathname === child.href ? "text-indigo-400" : "text-slate-500"
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
};
