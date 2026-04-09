"use client";

/**
 * BottomNav Component - ImobWeb 2026
 * 
 * Navegação inteligente otimizada para corretores em campo.
 * Design premium com micro-interações, safe-area aware e glassmorphism.
 */

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Home, 
  Search, 
  MessageSquare, 
  Users, 
  Menu, 
  Camera 
} from "lucide-react";
import { cn } from "@/lib/utils";

// Itens de navegação focados no corretor
const navItems = [
  { id: "home", label: "Início", icon: Home, path: "/dashboard" },
  { id: "imoveis", label: "Imóveis", icon: Search, path: "/imoveis" },
  { id: "campo", label: "Campo", icon: Camera, path: "/campo", primary: true }, // Botão de destaque para visitas
  { id: "whats", label: "Conversas", icon: MessageSquare, path: "/whatsapp" },
  { id: "leads", label: "Leads", icon: Users, path: "/leads" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pb-[env(safe-area-inset-bottom)] bg-background/80 backdrop-blur-xl border-t border-border/40 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] md:hidden">
      <div className="flex items-center justify-around h-16 px-2 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.path);
          
          if (item.primary) {
            return (
              <button
                key={item.id}
                onClick={() => router.push(item.path)}
                className="relative -top-5 flex flex-col items-center justify-center"
              >
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className="w-14 h-14 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg shadow-primary/30 border-4 border-background"
                >
                  <item.icon size={24} strokeWidth={2.5} />
                </motion.div>
                <span className="text-[10px] font-medium mt-1 text-primary">Campo</span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => router.push(item.path)}
              className="relative flex flex-col items-center justify-center flex-1 h-full pt-1"
            >
              <motion.div
                initial={false}
                animate={{ 
                  scale: isActive ? 1.1 : 1,
                  color: isActive ? "var(--primary)" : "var(--muted-foreground)"
                }}
                className="relative"
              >
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_var(--primary)]"
                  />
                )}
              </motion.div>
              <span 
                className={cn(
                  "text-[10px] mt-1 font-medium transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

/**
 * Nota Técnica:
 * 1. env(safe-area-inset-bottom) garante que a barra não fique atrás da "pílula" do iOS/Android.
 * 2. Glassmorphism (backdrop-blur) permite ver levemente o conteúdo rolando por baixo.
 * 3. layoutId do Framer Motion cria animações suaves de transição entre itens.
 */
