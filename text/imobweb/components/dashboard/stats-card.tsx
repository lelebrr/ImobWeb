'use client'

import React from 'react'
import { Card, CardContent } from '@/components/design-system/card'
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/responsive/tailwind-utils'

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  change?: {
    value: string
    positive: boolean
  }
  description?: string
  color?: 'blue' | 'purple' | 'green' | 'amber' | 'red'
}

export function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  change, 
  description,
  color = 'blue'
}: StatsCardProps) {
  
  const colorMap = {
    blue: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
    purple: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30',
    green: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30',
    amber: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30',
    red: 'text-red-600 bg-red-100 dark:bg-red-900/30',
  }

  return (
    <Card className="glass overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">{title}</p>
            <h3 className="text-3xl font-black tracking-tighter">{value}</h3>
          </div>
          <div className={cn("p-2.5 rounded-xl transition-colors group-hover:bg-primary group-hover:text-white", colorMap[color])}>
            <Icon className="w-5 h-5 flex-shrink-0" />
          </div>
        </div>
        
        <div className="mt-4 flex flex-col gap-1">
          {change && (
            <div className={cn(
              "flex items-center gap-1 text-sm font-bold",
              change.positive ? "text-emerald-500" : "text-red-500"
            )}>
              {change.positive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {change.value}
              <span className="text-muted-foreground font-medium ml-1">vs mês anterior</span>
            </div>
          )}
          {description && (
             <p className="text-xs text-muted-foreground font-medium italic">{description}</p>
          )}
        </div>

        {/* Shine Effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </CardContent>
    </Card>
  )
}
