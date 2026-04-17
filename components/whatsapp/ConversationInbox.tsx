"use client";

import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Search,
  Phone,
  Video,
  MoreVertical,
  Send,
  Bot,
  User,
  Filter,
  Clock,
  CheckCheck,
  ArrowRight,
  AlertCircle,
  TrendingUp,
  Eye,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/design-system/button";
import { Input } from "@/components/design-system/input";
import { Badge } from "@/components/design-system/badge";
import { cn } from "@/lib/responsive/tailwind-utils";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ConversationMessage {
  id: string;
  role: "assistant" | "user";
  content: string;
  timestamp: Date;
  status?: "sent" | "delivered" | "read";
}

interface Conversation {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  lastMessage: string;
  timestamp: Date;
  unread: number;
  status: "online" | "offline";
  aiHandled: boolean;
  leadScore: number;
  flowType: "LEAD_QUALIFICATION" | "PROPERTY_UPDATE" | "VISIT_CONFIRMATION";
  messages: ConversationMessage[];
  property?: {
    title: string;
    address: string;
  };
}

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: "1",
    name: "Roberto Camargo",
    avatar: "RC",
    phone: "+5511999999999",
    lastMessage:
      "Gostaria de agendar uma visita na cobertura do Itaim para amanhã às 15h.",
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    unread: 2,
    status: "online",
    aiHandled: true,
    leadScore: 92,
    flowType: "LEAD_QUALIFICATION",
    messages: [
      {
        id: "m1",
        role: "user",
        content:
          "Olá, vi o anúncio da cobertura no Itaim Bibi. Ainda está disponível?",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      },
      {
        id: "m2",
        role: "assistant",
        content:
          "Olá Roberto! Sim, a Cobertura Duplex no Itaim Bibi está disponível. É um imóvel espetacular com 450m², 4 suítes e vista 360° do skyline de SP. Gostaria de saber mais detalhes ou agendar uma visita?",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.5),
      },
      {
        id: "m3",
        role: "user",
        content: "Qual o valor? E aceita financiamento?",
        timestamp: new Date(Date.now() - 1000 * 60 * 60),
      },
      {
        id: "m4",
        role: "assistant",
        content:
          "O valor é R$ 12.500.000. Aceita financiamento bancário. Posso conectar você com nosso especialista financeiro?",
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
      },
      {
        id: "m5",
        role: "user",
        content:
          "Gostaria de agendar uma visita na cobertura do Itaim para amanhã às 15h.",
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
      },
    ],
    property: {
      title: "Cobertura Duplex Itaim Bibi",
      address: "Rua Amauri, 450 - Itaim Bibi, SP",
    },
  },
  {
    id: "2",
    name: "Mariana Santos",
    avatar: "MS",
    phone: "+5511988888888",
    lastMessage: "Obrigada! Vou verificar e te aviso.",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    unread: 0,
    status: "offline",
    aiHandled: true,
    leadScore: 78,
    flowType: "LEAD_QUALIFICATION",
    messages: [
      {
        id: "m1",
        role: "assistant",
        content:
          "Olá Mariana! Vi seu interesse no apartamento na Vila Madalena. Em que posso ajudar?",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
      },
      {
        id: "m2",
        role: "user",
        content: "Tem garagem? Porque tenho carro.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      },
      {
        id: "m3",
        role: "assistant",
        content:
          "Sim! O imóvel possui 2 vagas de garagem inclusas. Ótimo para você! Posso agendar uma visita?",
        timestamp: new Date(Date.now() - 1000 * 60 * 60),
      },
      {
        id: "m4",
        role: "user",
        content: "Obrigada! Vou verificar e te aviso.",
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
      },
    ],
  },
];

export function ConversationInbox() {
  const [conversations, setConversations] =
    useState<Conversation[]>(MOCK_CONVERSATIONS);
  const [selectedId, setSelectedId] = useState<string>(
    MOCK_CONVERSATIONS[0].id,
  );
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "ai" | "human">("all");
  const [newMessage, setNewMessage] = useState("");

  const selected = conversations.find((c) => c.id === selectedId);

  const filtered = conversations.filter((c) => {
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()))
      return false;
    if (filter === "ai" && !c.aiHandled) return false;
    if (filter === "human" && c.aiHandled) return false;
    return true;
  });

  const stats = {
    total: conversations.length,
    aiHandled: conversations.filter((c) => c.aiHandled).length,
    needAttention: conversations.filter((c) => c.unread > 0 && !c.aiHandled)
      .length,
    visitScheduled: conversations.filter((c) =>
      c.lastMessage.includes("visita"),
    ).length,
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== selectedId) return c;
        return {
          ...c,
          messages: [
            ...c.messages,
            {
              id: "m" + Date.now(),
              role: "assistant",
              content: newMessage,
              timestamp: new Date(),
            },
          ],
          lastMessage: newMessage,
          timestamp: new Date(),
        };
      }),
    );
    setNewMessage("");
  };

  return (
    <div className="grid grid-cols-12 gap-6 h-[80vh]">
      {/* Lista de Conversas */}
      <div className="col-span-4 glass rounded-3xl border-none overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-lg">Conversas</h2>
            <Badge
              variant="outline"
              className="ml-auto glass border-none text-xs"
            >
              {stats.total} ativas
            </Badge>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar conversa..."
              className="pl-9 bg-white/5 border-white/10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={filter === "all" ? "default" : "ghost"}
              onClick={() => setFilter("all")}
              className="text-xs"
            >
              Todas
            </Button>
            <Button
              size="sm"
              variant={filter === "ai" ? "default" : "ghost"}
              onClick={() => setFilter("ai")}
              className="text-xs"
            >
              <Bot className="w-3 h-3 mr-1" /> IA
            </Button>
            <Button
              size="sm"
              variant={filter === "human" ? "default" : "ghost"}
              onClick={() => setFilter("human")}
              className="text-xs"
            >
              <User className="w-3 h-3 mr-1" /> Humanos
            </Button>
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filtered.map((conv) => (
            <div
              key={conv.id}
              onClick={() => setSelectedId(conv.id)}
              className={cn(
                "p-4 border-b border-white/5 cursor-pointer transition-colors",
                selectedId === conv.id ? "bg-primary/10" : "hover:bg-white/5",
              )}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-sm">
                  {conv.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm truncate">{conv.name}</h4>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(conv.timestamp, {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {conv.lastMessage}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    {conv.aiHandled ? (
                      <Badge
                        variant="outline"
                        className="text-[10px] py-0 px-1"
                      >
                        <Bot className="w-2 h-2 mr-1" /> IA
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-[10px] py-0 px-1 bg-amber-500/20"
                      >
                        <User className="w-2 h-2 mr-1" /> Humano
                      </Badge>
                    )}
                    {conv.unread > 0 && (
                      <span className="w-5 h-5 rounded-full bg-primary text-[10px] flex items-center justify-center">
                        {conv.unread}
                      </span>
                    )}
                    <span
                      className={cn(
                        "text-[10px] font-bold",
                        conv.leadScore >= 80
                          ? "text-green-400"
                          : conv.leadScore >= 60
                            ? "text-yellow-400"
                            : "text-red-400",
                      )}
                    >
                      {conv.leadScore}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="col-span-8 glass rounded-3xl border-none overflow-hidden flex flex-col">
        {selected ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                  {selected.avatar}
                </div>
                <div>
                  <h3 className="font-bold">{selected.name}</h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    {selected.aiHandled && (
                      <Bot className="w-3 h-3 text-green-400" />
                    )}
                    {selected.status === "online" ? (
                      <span className="text-green-400">Online</span>
                    ) : (
                      <span>Offline</span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Score</p>
                  <p
                    className={cn(
                      "font-bold",
                      selected.leadScore >= 80
                        ? "text-green-400"
                        : selected.leadScore >= 60
                          ? "text-yellow-400"
                          : "text-red-400",
                    )}
                  >
                    {selected.leadScore}%
                  </p>
                </div>
                <Button size="icon" variant="ghost">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {selected.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex",
                    msg.role === "assistant" ? "justify-start" : "justify-end",
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[70%] p-3 rounded-2xl",
                      msg.role === "assistant"
                        ? "bg-white/10 rounded-tl-sm"
                        : "bg-primary rounded-br-sm",
                    )}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p
                      className={cn(
                        "text-[10px] mt-1 flex items-center gap-1",
                        msg.role === "assistant"
                          ? "text-muted-foreground"
                          : "text-white/70",
                      )}
                    >
                      {formatDistanceToNow(msg.timestamp, {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                      {msg.role === "user" && msg.status === "read" && (
                        <CheckCheck className="w-3 h-3 text-blue-400" />
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/5">
              <div className="flex gap-2">
                <Input
                  placeholder="Digite sua mensagem..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  className="bg-white/5"
                />
                <Button onClick={sendMessage} size="icon">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground">Selecione uma conversa</p>
          </div>
        )}
      </div>
    </div>
  );
}
