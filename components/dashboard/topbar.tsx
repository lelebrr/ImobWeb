'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Search, Moon, Sun, User, Menu, Command } from 'lucide-react'
import { Input } from '@/components/design-system/input'
import { Button } from '@/components/design-system/button'
import { useTheme } from 'next-themes'
import { useAuth } from '@/providers/auth-provider'

export function Topbar() {
  const { theme, setTheme } = useTheme()
  const { user } = useAuth()
  const [searchFocused, setSearchFocused] = React.useState(false)

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-14 sm:h-16 glass border-b px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30"
    >
      {/* Spacer for mobile hamburger */}
      <div className="w-12 lg:hidden" />

      {/* Search Area */}
      <div className="flex-1 max-w-xl relative hidden sm:block">
        <motion.div
          animate={{ scale: searchFocused ? 1.02 : 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="relative"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Busca inteligente por endereço, proprietário ou lead..."
            className="pl-10 h-10 bg-secondary/30 border-none focus-visible:ring-1 focus-visible:ring-primary shadow-inner transition-all duration-200"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          <AnimatePresence>
            {searchFocused && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <kbd className="px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground bg-muted rounded border border-border">
                  <Command className="w-3 h-3 inline" /> K
                </kbd>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Mobile search icon */}
      <Button
        variant="outline"
        size="icon"
        className="sm:hidden rounded-full bg-secondary/50 border-border/50"
      >
        <Search className="w-4 h-4" />
      </Button>

      {/* Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="rounded-full bg-secondary/50 border-border/50 w-9 h-9"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={theme}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </motion.div>
            </AnimatePresence>
          </Button>
        </motion.div>

        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full bg-secondary/50 border-border/50 relative w-9 h-9"
          >
            <Bell className="w-4 h-4" />
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"
            />
          </Button>
        </motion.div>

        {/* Profile */}
        <div className="flex items-center gap-3 pl-2 sm:pl-4 border-l border-border/50 ml-1 sm:ml-2">
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold leading-none">{user?.email?.split('@')[0] || 'Usuário'}</p>
            <p className="text-[10px] uppercase font-black tracking-widest text-primary mt-1">Plano Elite</p>
          </div>
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-blue-400 p-[2px] cursor-pointer"
          >
            <div className="w-full h-full rounded-full bg-secondary flex items-center justify-center overflow-hidden">
              <User className="w-5 h-5 text-primary" />
            </div>
          </motion.div>
        </div>
      </div>
    </motion.header>
  )
}
