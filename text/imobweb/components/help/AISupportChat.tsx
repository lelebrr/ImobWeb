'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  X, 
  MessageCircle, 
  User, 
  BrainCircuit, 
  Loader2,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { HelpCenterEngine } from '@/lib/help/help-center';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  links?: { title: string; slug: string }[];
}

/**
 * Chat de Suporte Inteligente (IA).
 * Utiliza a base de conhecimento para responder dúvidas e escala para humano se necessário.
 */
export const AISupportChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Olá! Sou o assistente inteligente do imobWeb. Como posso ajudar com sua conta hoje?' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const newMessages = [...messages, { role: 'user', content: text } as Message];
    setMessages(newMessages);
    setIsTyping(true);

    // Simulação de IA processando a base de conhecimento
    setTimeout(async () => {
      const searchResults = await HelpCenterEngine.search(text);
      let response = 'Entendi sua dúvida. ';
      let links: { title: string; slug: string }[] = [];

      if (searchResults.length > 0) {
        response += `Encontrei um artigo que pode te ajudar: "${searchResults[0].title}".`;
        links = searchResults.map(r => ({ title: r.title, slug: r.slug }));
      } else {
        response += 'Ainda estou aprendendo sobre isso. Gostaria que eu abrisse um chamado para nossa equipe humana te responder?';
      }

      setMessages([...newMessages, { role: 'assistant', content: response, links }]);
      setIsTyping(false);

      // Track AI usage
      import('@/lib/analytics/posthog').then(({ analytics }) => {
        analytics.trackAiUsage('support_chat', { 
          query: text, 
          has_results: searchResults.length > 0 
        });
      });
    }, 1500);
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-indigo-600 hover:bg-indigo-500 shadow-2xl z-50 group"
      >
        <MessageCircle className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className="fixed bottom-24 right-6 w-[400px] h-[600px] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-indigo-600 p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <BrainCircuit className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-bold">Suporte IA imobWeb</p>
                  <p className="text-indigo-200 text-xs">Online agora</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-white hover:bg-white/10">
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Messages Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-950/20">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-4 rounded-2xl ${
                    m.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-none' 
                      : 'bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700'
                  }`}>
                    <p className="text-sm leading-relaxed">{m.content}</p>
                    {m.links && m.links.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-700 space-y-2">
                        {m.links.map(link => (
                          <div key={link.slug} className="flex items-center gap-2 text-indigo-400 text-xs font-bold hover:underline cursor-pointer">
                            <ExternalLink className="w-3 h-3" />
                            {link.title}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-slate-800 p-4 rounded-2xl rounded-tl-none border border-slate-700">
                    <Loader2 className="w-4 h-4 text-slate-500 animate-spin" />
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-6 bg-slate-900 border-t border-slate-800">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const input = form.elements.namedItem('message') as HTMLInputElement;
                  handleSend(input.value);
                  input.value = '';
                }}
                className="flex gap-2"
              >
                <Input 
                  name="message" 
                  placeholder="Digite sua dúvida..." 
                  className="bg-slate-950 border-slate-800 text-white focus:ring-indigo-500"
                />
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500">
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
