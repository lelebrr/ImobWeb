'use client'

import React from 'react'
import { X, Phone, Mail, MessageSquare, History, Tag, User, MapPin } from 'lucide-react'
import { Button } from '@/components/design-system/button'
import { Badge } from '@/components/design-system/badge'
import { InboxPreview } from './InboxPreview'

interface LeadSlideOverProps {
  isOpen: boolean
  onClose: () => void
  lead: any // Tipagem real viria do Prisma
}

const MOCK_MESSAGES = [
  { id: '1', role: 'assistant' as const, content: 'Olá! Vi que você se interessou pela Cobertura no Itaim. Gostaria de agendar uma visita para este sábado?', timestamp: '2026-04-11T14:30:00Z', status: 'read' as const },
  { id: '2', role: 'user' as const, content: 'Oi! Sim, tenho interesse. No sábado às 10h seria possível?', timestamp: '2026-04-11T14:35:00Z' },
  { id: '3', role: 'assistant' as const, content: 'Perfeito! Já confirmei com o proprietário. Te enviei o endereço no seu WhatsApp. Posso ajudar com mais alguma informação?', timestamp: '2026-04-11T14:36:00Z', status: 'delivered' as const }
]

export function LeadSlideOver({ isOpen, onClose, lead }: LeadSlideOverProps) {
  if (!isOpen || !lead) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="absolute inset-y-0 right-0 flex max-w-full">
        <div className="w-screen max-w-4xl transform transition duration-500 ease-in-out">
          <div className="flex h-full flex-col bg-slate-900/90 backdrop-blur-3xl shadow-2xl border-l border-white/5">
            {/* Top Bar */}
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h2 className="text-xl font-black tracking-tighter">Detalhes do Lead</h2>
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-white/10">
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Content Container */}
            <div className="flex-1 overflow-y-auto p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
                
                {/* Profile Info */}
                <div className="space-y-8">
                  <div className="flex flex-col items-center p-8 bg-white/5 rounded-3xl border border-white/5 text-center">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary-foreground flex items-center justify-center text-4xl font-black mb-4 shadow-2xl">
                      {lead.name.charAt(0)}
                    </div>
                    <h3 className="text-2xl font-black">{lead.name}</h3>
                    <p className="text-muted-foreground font-medium mb-4">{lead.email}</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-none font-bold uppercase tracking-widest text-[10px]">Verificado</Badge>
                      <Badge className="bg-primary/20 text-primary border-none font-bold uppercase tracking-widest text-[10px]">{lead.source}</Badge>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-1">Informações de Contato</h4>
                    <div className="grid grid-cols-1 gap-3">
                       <Button variant="outline" className="w-full justify-start h-14 glass border-none rounded-2xl group">
                          <Phone className="w-4 h-4 mr-3 text-muted-foreground group-hover:text-primary" />
                          <span className="font-bold">{lead.phone || 'Não informado'}</span>
                       </Button>
                       <Button variant="outline" className="w-full justify-start h-14 glass border-none rounded-2xl group">
                          <Mail className="w-4 h-4 mr-3 text-muted-foreground group-hover:text-primary" />
                          <span className="font-bold">{lead.email || 'Não informado'}</span>
                       </Button>
                       <Button variant="outline" className="w-full justify-start h-14 glass border-none rounded-2xl group">
                          <MessageSquare className="w-4 h-4 mr-3 text-muted-foreground group-hover:text-primary" />
                          <span className="font-bold">Chat WhatsApp Ativo</span>
                       </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-1">Imóvel de Interesse</h4>
                    <div className="p-5 bg-white/5 rounded-3xl border border-white/5 flex gap-4 items-center">
                       <div className="w-16 h-16 rounded-2xl bg-muted overflow-hidden">
                          <img src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=200" alt="Imovel" className="w-full h-full object-cover" />
                       </div>
                       <div>
                          <p className="font-black text-sm leading-tight">{lead.propertyInterest}</p>
                          <p className="text-muted-foreground text-[10px] font-bold mt-1 uppercase flex items-center gap-1">
                             <MapPin className="w-3 h-3" /> Itaim Bibi, SP
                          </p>
                       </div>
                    </div>
                  </div>
                </div>

                {/* Interactions / Inbox Preview */}
                <div className="flex flex-col">
                  <h4 className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-1 mb-4 flex items-center gap-2">
                    <History className="w-4 h-4" /> Histórico de Interações IA
                  </h4>
                  <InboxPreview leadName={lead.name} messages={MOCK_MESSAGES} />
                </div>

              </div>
            </div>
            
            {/* Footer Actions */}
            <div className="p-6 border-t border-white/5 bg-white/5 flex gap-3">
               <Button variant="outline" className="glass border-none h-14 px-8 rounded-2xl font-black uppercase text-[10px] tracking-widest">Descartar Lead</Button>
               <Button className="flex-1 h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20">Avançar para Visita</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
