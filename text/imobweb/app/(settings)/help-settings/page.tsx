"use client"

import * as React from "react"
import { Input } from "@/components/design-system/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/design-system/card"
import { Search, BookOpen, MessageSquare, Zap, Shield, Settings } from "lucide-react"

const ARTICLES = [
  { id: 1, title: "Como cadastrar seu primeiro imóvel", category: "Início", icon: Zap },
  { id: 2, title: "Customizando as cores da sua imobiliária", category: "Branding", icon: Settings },
  { id: 3, title: "Entendendo a conformidade LGPD", category: "Segurança", icon: Shield },
  { id: 4, title: "Configurando integração com WhatsApp", category: "Comunicação", icon: MessageSquare },
  { id: 5, title: "Exportação de relatórios financeiros", category: "Financeiro", icon: BookOpen },
]

export default function HelpCenterPage() {
  const [search, setSearch] = React.useState("")

  const filteredArticles = ARTICLES.filter(art => 
    art.title.toLowerCase().includes(search.toLowerCase()) || 
    art.category.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="container mx-auto py-10 px-4 space-y-8 animate-fade-in">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Central de Ajuda imobWeb</h1>
        <p className="text-muted-foreground text-lg">Como podemos ajudar você a gerir sua imobiliária hoje?</p>
        
        <div className="max-w-xl mx-auto relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            className="pl-10 h-12 text-lg" 
            placeholder="Pesquisar artigos, guias ou dúvidas..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArticles.map((article) => (
          <Card key={article.id} className="cursor-pointer hover:border-primary/50 transition-all group">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <article.icon className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {article.category}
                </span>
                <CardTitle className="text-base">{article.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Aprenda o passo a passo completo neste guia detalhado para otimizar seu fluxo de trabalho.
              </p>
            </CardContent>
          </Card>
        ))}
        {filteredArticles.length === 0 && (
          <div className="col-span-full text-center py-20 bg-muted/20 rounded-xl">
            <p className="text-muted-foreground italic">Nenhum artigo encontrado para "{search}"</p>
          </div>
        )}
      </div>

      <div className="bg-primary/5 border border-primary/10 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-center md:text-left space-y-2">
          <h2 className="text-xl font-semibold">Ainda precisa de ajuda?</h2>
          <p className="text-muted-foreground">Nossos especialistas estão disponíveis 24/7 para ajudar você via chat ou e-mail.</p>
        </div>
        <div className="flex gap-4">
          <button className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors">
            Falar com Suporte
          </button>
        </div>
      </div>
    </div>
  )
}
