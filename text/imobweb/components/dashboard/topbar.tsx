'use client'

import React from 'react'
import { Bell, Search, Moon, Sun, User } from 'lucide-react'
import { Input } from '@/components/design-system/input'
import { Button } from '@/components/design-system/button'
import { useTheme } from 'next-themes'
import { useAuth } from '@/providers/auth-provider'

export function Topbar() {
  const { theme, setTheme } = useTheme()
  const { user } = useAuth()

  return (
    <header className="h-16 glass border-b px-8 flex items-center justify-between sticky top-0 z-30">
      {/* Search Area */}
      <div className="flex-1 max-w-xl relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="Busca inteligente por endereço, proprietário ou lead..." 
          className="pl-10 h-10 bg-secondary/30 border-none focus-visible:ring-1 focus-visible:ring-primary shadow-inner"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="rounded-full bg-secondary/50 border-border/50"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>

        <Button 
          variant="outline" 
          size="icon" 
          className="rounded-full bg-secondary/50 border-border/50 relative"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900" />
        </Button>

        {/* Profile */}
        <div className="flex items-center gap-3 pl-4 border-l border-border/50 ml-2">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold leading-none">{user?.email?.split('@')[0] || 'Usuário'}</p>
            <p className="text-[10px] uppercase font-black tracking-widest text-primary mt-1">Plano Elite</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-blue-400 p-[2px]">
            <div className="w-full h-full rounded-full bg-secondary flex items-center justify-center overflow-hidden">
               <User className="w-5 h-5 text-primary" />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
