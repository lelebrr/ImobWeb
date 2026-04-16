'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageSquare, 
  Search, 
  Phone, 
  Video,
  MoreVertical,
  Send,
  Paperclip,
  Smile,
  Star,
  Clock,
  CheckCheck,
  ArrowLeft,
  Bot,
  User as UserIcon,
  Filter
} from 'lucide-react'
import { Button } from '@/components/design-system/button'
import { Input } from '@/components/design-system/input'
import { Badge } from '@/components/design-system/badge'
import { cn } from '@/lib/responsive/tailwind-utils'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// Mock conversations data
const MOCK_CONVERSATIONS = [
  {
    id: '1',
    name: 'Roberto Camargo',
    avatar: 'RC',
    lastMessage: 'Gostaria de agendar uma visita na cobertura do Itaim para amanhã às 15h.',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    unread: 3,
    source: 'WhatsApp',
    status: 'online',
    aiHandled: false,
    leadScore: 95,
    messages: [
      { id: 'm1', role: 'user', content: 'Olá, vi o anúncio da cobertura no Itaim Bibi. Ainda está disponível?', time: new Date(Date.now() - 1000 * 60 * 60 * 2) },
      { id: 'm2', role: 'assistant', content: 'Olá Roberto! Sim, a Cobertura Duplex no Itaim Bibi está disponível. É um imóvel espetacular com 450m², 4 suítes e vista 360° do skyline de SP. Gostaria de saber mais detalhes ou agendar uma visita?', time: new Date(Date.now() - 1000 * 60 * 60 * 1.5) },
      { id: 'm3', role: 'user', content: 'Qual o valor? E aceita financiamento?', time: new Date(Date.now() - 1000 * 60 * 60) },
      { id: 'm4', role: 'assistant', content: 'O valor é R$ 12.500.000. Aceita negociação e sim, é possível financiamento. Posso conectar você com nosso especialista financeiro?', time: new Date(Date.now() - 1000 * 60 * 30) },
      { id: 'm5', role: 'user', content: 'Gostaria de agendar uma visita na cobertura do Itaim para amanhã às 15h.', time: new Date(Date.now() - 1000 * 60 * 5) },
    ]
  },
  {
    id: '2',
    name: 'Juliana Mendes',
    avatar: 'JM',
    lastMessage: 'Perfeito! Vou enviar os documentos para análise de crédito.',
    timestamp: new Date(Date.now() - 1000 * 60 * 23),
    unread: 0,
    source: 'Portal',
    status: 'offline',
    aiHandled: true,
    leadScore: 78,
    messages: [
      { id: 'm1', role: 'user', content: 'Vi a casa em Alphaville e tenho interesse.', time: new Date(Date.now() - 1000 * 60 * 60 * 5) },
      { id: 'm2', role: 'assistant', content: 'Juliana, que ótimo! A Residência Contemporânea em Alphaville é realmente incrível. Projeto arquitetônico premiado, 5 suítes e piscina com borda infinita. O valor é R$ 8.900.000.', time: new Date(Date.now() - 1000 * 60 * 60 * 4) },
      { id: 'm3', role: 'user', content: 'Perfeito! Vou enviar os documentos para análise de crédito.', time: new Date(Date.now() - 1000 * 60 * 23) },
    ]
  },
  {
    id: '3',
    name: 'Carlos Pereira',
    avatar: 'CP',
    lastMessage: 'A IA respondeu sobre disponibilidade do loft automaticamente.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    unread: 1,
    source: 'WhatsApp',
    status: 'online',
    aiHandled: true,
    leadScore: 62,
    messages: [
      { id: 'm1', role: 'user', content: 'O loft no Brooklin ainda está à venda?', time: new Date(Date.now() - 1000 * 60 * 60 * 3) },
      { id: 'm2', role: 'assistant', content: '🤖 Resposta automática: Sim Carlos! O Loft Industrial New York Style no Brooklin está disponível. São 110m² com pé direito duplo, tijolos aparentes e janelas amplas. Valor: R$ 1.850.000 (negociável). Posso agendar uma visita?', time: new Date(Date.now() - 1000 * 60 * 60 * 2.5) },
      { id: 'm3', role: 'user', content: 'A IA respondeu sobre disponibilidade do loft automaticamente.', time: new Date(Date.now() - 1000 * 60 * 60 * 2) },
    ]
  },
  {
    id: '4',
    name: 'Amanda Costa',
    avatar: 'AC',
    lastMessage: 'Podemos fechar o contrato na próxima semana?',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
    unread: 0,
    source: 'Site',
    status: 'offline',
    aiHandled: false,
    leadScore: 88,
    messages: [
      { id: 'm1', role: 'user', content: 'Adorei o studio na Vila Madalena! Quero alugar.', time: new Date(Date.now() - 1000 * 60 * 60 * 24) },
      { id: 'm2', role: 'assistant', content: 'Amanda, excelente escolha! O Studio Design na Vila Madalena é perfeito para quem valoriza praticidade e estilo. R$ 4.500/mês com condomínio de R$ 650. Mobiliado e com academia no prédio!', time: new Date(Date.now() - 1000 * 60 * 60 * 20) },
      { id: 'm3', role: 'user', content: 'Podemos fechar o contrato na próxima semana?', time: new Date(Date.now() - 1000 * 60 * 60 * 5) },
    ]
  },
  {
    id: '5',
    name: 'Fernando Silva',
    avatar: 'FS',
    lastMessage: 'Preciso de uma laje corporativa na Paulista para 200 funcionários.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8),
    unread: 2,
    source: 'LinkedIn',
    status: 'offline',
    aiHandled: false,
    leadScore: 71,
    messages: [
      { id: 'm1', role: 'user', content: 'Preciso de uma laje corporativa na Paulista para 200 funcionários.', time: new Date(Date.now() - 1000 * 60 * 60 * 8) },
    ]
  },
]

export default function ConversationsPage() {
  const [search, setSearch] = useState('')
  const [selectedConversation, setSelectedConversation] = useState<typeof MOCK_CONVERSATIONS[0] | null>(null)
  const [messageInput, setMessageInput] = useState('')
  const [showMobileChat, setShowMobileChat] = useState(false)

  const filteredConversations = MOCK_CONVERSATIONS.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.lastMessage.toLowerCase().includes(search.toLowerCase())
  )

  const totalUnread = MOCK_CONVERSATIONS.reduce((sum, c) => sum + c.unread, 0)

  const handleSelectConversation = (conv: typeof MOCK_CONVERSATIONS[0]) => {
    setSelectedConversation(conv)
    setShowMobileChat(true)
  }

  const handleBackToList = () => {
    setShowMobileChat(false)
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tighter">Mensagens</h1>
            {totalUnread > 0 && (
              <Badge className="bg-red-500 text-white border-none px-2 py-0.5 text-xs font-black">{totalUnread}</Badge>
            )}
          </div>
          <p className="text-muted-foreground font-medium text-sm">Todas as conversas com leads e proprietários em um só lugar.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" className="glass border-none flex-1 sm:flex-none h-10">
            <Filter className="w-4 h-4 mr-2" /> Filtrar
          </Button>
          <Button className="shadow-lg shadow-primary/20 flex-1 sm:flex-none h-10">
            <MessageSquare className="w-4 h-4 mr-2" /> Nova Conversa
          </Button>
        </div>
      </div>

      {/* Chat Layout */}
      <div className="flex-1 flex gap-0 lg:gap-6 overflow-hidden rounded-[2rem] min-h-0">
        {/* Conversation List */}
        <div className={cn(
          "w-full lg:w-[380px] xl:w-[420px] glass border-none rounded-[2rem] flex flex-col overflow-hidden shrink-0",
          showMobileChat ? "hidden lg:flex" : "flex"
        )}>
          {/* List Search */}
          <div className="p-4 border-b border-white/5 shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar conversa..."
                className="pl-10 glass border-none h-11 rounded-xl"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            {filteredConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => handleSelectConversation(conv)}
                className={cn(
                  "w-full text-left p-4 flex gap-4 transition-all border-b border-white/5 hover:bg-white/5",
                  selectedConversation?.id === conv.id && "bg-primary/5 border-l-2 border-l-primary"
                )}
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-lg">
                    {conv.avatar}
                  </div>
                  {conv.status === 'online' && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-background" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-bold text-sm truncate">{conv.name}</span>
                      {conv.aiHandled && (
                        <Bot className="w-3.5 h-3.5 text-primary shrink-0" />
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground font-medium shrink-0 ml-2">
                      {formatDistanceToNow(conv.timestamp, { addSuffix: false, locale: ptBR })}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate leading-relaxed">{conv.lastMessage}</p>
                  <div className="flex items-center justify-between mt-2">
                    <Badge variant="outline" className="glass border-none text-[9px] font-black uppercase tracking-widest px-2 py-0.5">
                      {conv.source}
                    </Badge>
                    {conv.unread > 0 && (
                      <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] font-black flex items-center justify-center">
                        {conv.unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className={cn(
          "flex-1 glass border-none rounded-[2rem] flex flex-col overflow-hidden min-w-0",
          showMobileChat ? "flex" : "hidden lg:flex"
        )}>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 sm:p-6 border-b border-white/5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4 min-w-0">
                  <button 
                    onClick={handleBackToList}
                    className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors shrink-0"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                      {selectedConversation.avatar}
                    </div>
                    {selectedConversation.status === 'online' && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-background" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm truncate">{selectedConversation.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-emerald-500 font-bold uppercase">
                        {selectedConversation.status === 'online' ? 'Online' : 'Offline'}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-bold">•</span>
                      <span className="text-[10px] text-muted-foreground font-bold uppercase">Score: {selectedConversation.leadScore}%</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="rounded-full w-9 h-9 hidden sm:flex">
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-full w-9 h-9 hidden sm:flex">
                    <Video className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-full w-9 h-9 hidden sm:flex">
                    <Star className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-full w-9 h-9">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scrollbar-hide">
                {selectedConversation.messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "flex gap-3 max-w-[90%] sm:max-w-[75%]",
                      msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                      msg.role === 'user' ? "bg-secondary" : "bg-primary/20"
                    )}>
                      {msg.role === 'user' ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4 text-primary" />}
                    </div>
                    <div className="space-y-1">
                      <div className={cn(
                        "p-4 rounded-2xl text-sm font-medium leading-relaxed",
                        msg.role === 'user'
                          ? "bg-primary text-white rounded-tr-none shadow-lg shadow-primary/10"
                          : "glass border-none rounded-tl-none"
                      )}>
                        {msg.content}
                      </div>
                      <div className={cn("flex items-center gap-1 px-1", msg.role === 'user' ? "justify-end" : "")}>
                        <Clock className="w-2.5 h-2.5 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground font-medium">
                          {formatDistanceToNow(msg.time, { addSuffix: true, locale: ptBR })}
                        </span>
                        {msg.role === 'user' && <CheckCheck className="w-3 h-3 text-blue-400 ml-1" />}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-white/5 shrink-0">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="rounded-full shrink-0 w-10 h-10 hidden sm:flex">
                    <Paperclip className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-full shrink-0 w-10 h-10 hidden sm:flex">
                    <Smile className="w-4 h-4" />
                  </Button>
                  <div className="flex-1 relative min-w-0">
                    <Input
                      placeholder="Digite sua mensagem..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && setMessageInput('')}
                      className="h-12 pr-14 glass border-none rounded-2xl shadow-inner text-sm"
                    />
                    <Button
                      size="icon"
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl"
                      disabled={!messageInput.trim()}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Empty State */
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-20 h-20 rounded-full bg-secondary/50 flex items-center justify-center mb-6">
                <MessageSquare className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-black tracking-tighter mb-2">Nenhuma conversa selecionada</h3>
              <p className="text-muted-foreground font-medium max-w-xs text-sm">
                Selecione uma conversa ao lado ou inicie uma nova para começar a atender seus leads.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
