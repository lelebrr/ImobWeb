"use client"

import * as React from "react"
import { Button } from "../design-system/button"
import { Card, CardContent, CardHeader, CardTitle } from "../design-system/card"
import { Input } from "../design-system/input"
import { MessageCircle, X, Send, Bot } from "lucide-react"
import { useBranding } from "../branding/branding-provider"

export function ChatbotSupport() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [messages, setMessages] = React.useState([
    { role: "bot", content: "Olá! Como posso ajudar você hoje com o imobWeb?" }
  ])
  const [input, setInput] = React.useState("")
  const { config } = useBranding()

  const handleSend = () => {
    if (!input.trim()) return

    const newMessages = [...messages, { role: "user", content: input }]
    setMessages(newMessages)
    setInput("")

    // Simulação de resposta da IA
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: "bot", 
        content: "Entendi sua dúvida sobre '" + input + "'. Gostaria de falar com um atendente humano ou ver um artigo sobre isso?" 
      }])
    }, 1000)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen ? (
        <Button 
          size="icon" 
          className="w-14 h-14 rounded-full shadow-2xl animate-bounce-subtle"
          onClick={() => setIsOpen(true)}
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      ) : (
        <Card className="w-80 h-[450px] flex flex-col shadow-2xl border-primary/20 animate-slide-in">
          <CardHeader className="p-4 bg-primary text-primary-foreground flex flex-row items-center justify-between rounded-t-xl">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <CardTitle className="text-sm">Suporte imobWeb</CardTitle>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-primary-foreground" onClick={() => setIsOpen(false)}>
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] p-2 rounded-lg text-xs ${
                  msg.role === "user" 
                    ? "bg-primary text-primary-foreground rounded-tr-none" 
                    : "bg-muted text-muted-foreground rounded-tl-none"
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
          </CardContent>
          <div className="p-4 border-t flex gap-2">
            <Input 
              placeholder="Digite sua dúvida..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="text-xs"
            />
            <Button size="icon" className="h-9 w-9" onClick={handleSend}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
