'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, X, Send, Sparkles, Loader2, Zap, ArrowRight, User, Bot } from 'lucide-react'
import { Button } from '@/components/design-system/button'
import { Input } from '@/components/design-system/input'
import { Badge } from '@/components/design-system/badge'
import { useAI } from '@/providers/ai-provider'
import { cn } from '@/lib/utils'

export function AICopilot() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<any[]>([
    { 
      role: 'assistant', 
      content: 'Olá! Sou o assistente inteligente da imobWeb. Como posso ajudar você a gerenciar seus imóveis hoje?' 
    }
  ])
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
    const { chatWithCopilot, isReady } = useAI()

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    const handleSend = async () => {
        if (!input.trim() || isLoading) return

        const userMessage = { role: 'user', content: input }
        setMessages(prev => [...prev, userMessage])
        setInput('')
        setIsLoading(true)

        try {
            // Usando o Copilot especializado para suporte ao Broker
            const response = await chatWithCopilot(messages, input)
            setMessages(prev => [...prev, { role: 'assistant', content: response }])
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Desculpe, tive um problema técnico ao processar sua solicitação. Verifique sua conexão ou tente novamente em instantes.' 
      }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mb-4 w-[380px] h-[550px] glass border-none rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden bg-background/80 backdrop-blur-2xl"
          >
            {/* Chat Header */}
            <div className="p-6 bg-primary/10 border-b border-primary/10 flex items-center justify-between relative overflow-hidden">
               <div className="hero-glow -left-10 -top-10 opacity-20" />
               <div className="flex items-center gap-3 relative z-10">
                  <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                    <Sparkles className="w-6 h-6 text-white fill-white" />
                  </div>
                  <div>
                    <h3 className="font-black tracking-tighter leading-none">imobWeb Copilot</h3>
                    <div className="flex items-center gap-1.5 mt-1">
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                       <p className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">Online Agora</p>
                    </div>
                  </div>
               </div>
               <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsOpen(false)}
                className="rounded-full hover:bg-primary/5 text-muted-foreground"
               >
                 <X className="w-5 h-5" />
               </Button>
            </div>

            {/* Messages Area */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-primary/10"
            >
               {messages.map((msg, i) => (
                 <motion.div
                   key={i}
                   initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   className={cn(
                     "flex gap-3 max-w-[85%]",
                     msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                   )}
                 >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                      msg.role === 'user' ? "bg-secondary" : "bg-primary/20"
                    )}>
                       {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-primary" />}
                    </div>
                    <div className={cn(
                      "p-4 rounded-2xl text-sm font-medium leading-relaxed",
                      msg.role === 'user' 
                        ? "bg-primary text-white rounded-tr-none shadow-lg shadow-primary/10" 
                        : "glass border-none rounded-tl-none"
                    )}>
                      {msg.content}
                    </div>
                 </motion.div>
               ))}
               {isLoading && (
                 <div className="flex gap-3 mr-auto max-w-[85%]">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                       <Loader2 className="w-4 h-4 text-primary animate-spin" />
                    </div>
                    <div className="p-4 glass border-none rounded-2xl rounded-tl-none">
                       <div className="flex gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" />
                          <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:0.2s]" />
                          <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:0.4s]" />
                       </div>
                    </div>
                 </div>
               )}
            </div>

            {/* Suggestion Chips */}
            <div className="px-6 py-2 flex gap-2 overflow-x-auto no-scrollbar">
                {[
                  'Como converter leads?',
                  'Análise do mercado hoje',
                  'Gerar descrição IA'
                ].map((s) => (
                  <button 
                    key={s} 
                    onClick={() => setInput(s)}
                    className="whitespace-nowrap px-3 py-1.5 rounded-full glass border-none text-[11px] font-black uppercase tracking-tight hover:bg-primary/5 transition-colors"
                  >
                    {s}
                  </button>
                ))}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-background/50 border-t border-border/50">
               <div className="relative group">
                  <Input 
                    placeholder="Sua pergunta para a IA..." 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    className="h-14 pr-14 glass border-none rounded-2xl shadow-inner text-sm font-medium focus-visible:ring-1 focus-visible:ring-primary/20"
                  />
                  <Button 
                    size="icon"
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl shadow-lg transition-transform active:scale-95"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Launcher Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-2xl transition-all duration-500",
          isOpen 
            ? "bg-secondary text-foreground rotate-90" 
            : "bg-primary text-white hover:shadow-primary/40"
        )}
      >
        {isOpen ? <X className="w-8 h-8" /> : <Sparkles className="w-8 h-8 fill-current" />}
        {!isOpen && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-background flex items-center justify-center">
             <span className="text-[10px] font-black text-white">1</span>
          </div>
        )}
      </motion.button>
    </div>
  )
}
