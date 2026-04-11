'use client'

import React from 'react'
import { Send, Bot, User, CheckCheck, Clock } from 'lucide-react'
import { Badge } from '@/components/design-system/badge'
import { cn } from '@/lib/responsive/tailwind-utils'

interface Message {
  id: string
  role: 'assistant' | 'user'
  content: string
  timestamp: string
  status?: 'sent' | 'delivered' | 'read'
}

interface InboxPreviewProps {
  leadName: string
  messages: Message[]
}

export function InboxPreview({ leadName, messages }: InboxPreviewProps) {
  return (
    <div className="flex flex-col h-[600px] glass rounded-3xl border-none overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
            {leadName.charAt(0)}
          </div>
          <div>
            <h3 className="font-bold text-lg leading-tight">{leadName}</h3>
            <p className="text-xs text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> IA Respondendo Online
            </p>
          </div>
        </div>
        <Badge variant="outline" className="glass border-none font-bold text-[10px] tracking-widest uppercase py-1 px-3">
           WhatsApp Sync
        </Badge>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
        {messages.map((msg) => (
          <div 
            key={msg.id}
            className={cn(
              "flex flex-col max-w-[80%] animate-in fade-in slide-in-from-bottom-2 duration-500",
              msg.role === 'assistant' ? "mr-auto" : "ml-auto items-end"
            )}
          >
            <div className={cn(
              "p-4 rounded-2xl text-sm font-medium leading-relaxed shadow-sm",
              msg.role === 'assistant' 
                ? "bg-white/10 text-foreground rounded-tl-none border border-white/5" 
                : "bg-primary text-white rounded-tr-none"
            )}>
               {msg.role === 'assistant' && (
                 <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1">
                      <Bot className="w-3 h-3" /> Assistente IA
                    </span>
                 </div>
               )}
               {msg.content}
            </div>
            <div className="mt-1.5 flex items-center gap-1.5 px-1">
              <span className="text-[10px] font-bold text-muted-foreground opacity-60">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              {msg.role === 'user' && (
                 <CheckCheck className="w-3 h-3 text-emerald-400" />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input Preview (ReadOnly for now as it's a preview) */}
      <div className="p-6 bg-white/5 border-t border-white/5 relative">
        <div className="flex gap-2">
           <div className="flex-1 glass border-none rounded-2xl p-4 text-sm text-muted-foreground italic flex items-center">
              Aguardando próxima interação do lead ou intervenção manual...
           </div>
           <button className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 transition-all">
              <Send className="w-6 h-6" />
           </button>
        </div>
        <p className="text-[10px] text-center mt-3 text-muted-foreground font-medium uppercase tracking-[0.2em]">
           Modo Híbrido: IA + Humano
        </p>
      </div>
    </div>
  )
}
