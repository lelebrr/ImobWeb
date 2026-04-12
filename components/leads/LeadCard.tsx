'use client'

import React from 'react'
import { Phone, Mail, MessageSquare, Calendar, MoreVertical, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/design-system/badge'
import { Button } from '@/components/design-system/button'
import { cn } from '@/lib/responsive/tailwind-utils'

export type LeadStatus = 'NOVO' | 'CONTATADO' | 'INTERESSADO' | 'AGUARDANDO' | 'PERDIDO' | 'CONVERTIDO' | 'ARQUIVADO'

interface LeadCardProps {
  lead: {
    id: string
    name: string
    email?: string
    phone?: string
    whatsapp?: string
    status: LeadStatus
    source: string
    budget?: number
    propertyInterest?: string
    createdAt: string
  }
}

const statusConfig: Record<LeadStatus, { label: string, color: string }> = {
  NOVO: { label: 'Novo', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  CONTATADO: { label: 'Contatado', color: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' },
  INTERESSADO: { label: 'Interessado', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  AGUARDANDO: { label: 'Aguardando', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  PERDIDO: { label: 'Perdido', color: 'bg-red-500/20 text-red-500 border-red-500/30' },
  CONVERTIDO: { label: 'Convertido', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  ARQUIVADO: { label: 'Arquivado', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
}

export function LeadCard({ lead }: LeadCardProps) {
  const status = statusConfig[lead.status]

  return (
    <div className="glass border-none group hover:bg-white/10 transition-all duration-300 rounded-3xl p-5 relative overflow-hidden">
      {/* Glow Effect */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />
      
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="flex gap-4 items-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center font-black text-primary text-xl shadow-inner uppercase">
            {lead.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-bold text-lg leading-tight">{lead.name}</h3>
            <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5 mt-1">
              <Calendar className="w-3 h-3" /> Recebido em {new Date(lead.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <Badge className={cn("text-[10px] font-black uppercase tracking-widest border px-2.5 py-1", status.color)}>
           {status.label}
        </Badge>
      </div>

      <div className="space-y-4 relative z-10">
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Origem</span>
            <p className="text-sm font-bold truncate">{lead.source}</p>
          </div>
          <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Interesse</span>
            <p className="text-sm font-bold truncate h-5">{lead.propertyInterest || 'Geral'}</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex -space-x-2">
            <Button variant="outline" size="icon" className="w-10 h-10 rounded-full glass border-none hover:bg-primary/20 group/btn">
              <Phone className="w-4 h-4 text-muted-foreground group-hover/btn:text-primary transition-colors" />
            </Button>
            <Button variant="outline" size="icon" className="w-10 h-10 rounded-full glass border-none hover:bg-primary/20 group/btn">
              <Mail className="w-4 h-4 text-muted-foreground group-hover/btn:text-primary transition-colors" />
            </Button>
            <Button variant="outline" size="icon" className="w-10 h-10 rounded-full glass border-none hover:bg-primary/20 group/btn">
              <MessageSquare className="w-4 h-4 text-muted-foreground group-hover/btn:text-primary transition-colors" />
            </Button>
          </div>
          
          <Button size="sm" className="rounded-full px-5 font-black text-[11px] uppercase tracking-tighter shadow-lg shadow-primary/20">
            Ver Detalhes <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
