'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Bed, 
  Bath, 
  Maximize, 
  MapPin, 
  Share2, 
  Heart, 
  Calendar, 
  Zap, 
  ShieldCheck, 
  TrendingUp,
  MessageSquare,
  Phone,
  ArrowRight,
  Sparkles
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/design-system/button'
import { Badge } from '@/components/design-system/badge'
import { Card, CardContent } from '@/components/design-system/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/design-system/tabs'
import { MOCK_PROPERTIES } from '@/lib/data/mock-properties'
import { analytics } from '@/lib/analytics/posthog'
import { cn } from '@/lib/utils'

export default function PropertyDetailPage() {
  const { slug } = useParams()
  const router = useRouter()
  const [isLiked, setIsLiked] = useState(false)
  const [activeTab, setActiveTab] = useState('detalhes')

  const property = MOCK_PROPERTIES.find(p => p.slug === slug)

  useEffect(() => {
    if (property) {
      analytics.trackPropertyView(
        property.id, 
        property.title, 
        property.price.amount, 
        property.address.city
      )
    }
  }, [property])

  if (!property) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <h2 className="text-2xl font-black tracking-tighter">Imóvel não encontrado</h2>
        <Button onClick={() => router.push('/properties')}>Voltar para lista</Button>
      </div>
    )
  }

  const mainImage = property.media[0]?.url || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200'

  return (
    <div className="min-h-screen pb-20 mt-4 px-4 lg:px-8">
      {/* Navigation & Header */}
      <div className="max-w-7xl mx-auto mb-6 flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="glass hover:bg-secondary/50 rounded-2xl"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" className="glass rounded-full border-none">
            <Share2 className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className={cn(
              "glass rounded-full border-none transition-colors",
              isLiked && "text-red-500 fill-red-500"
            )}
            onClick={() => setIsLiked(!isLiked)}
          >
            <Heart className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content (Left) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Hero Gallery */}
          <div className="relative aspect-[16/9] rounded-[2.5rem] overflow-hidden shadow-2xl group">
             <img 
               src={mainImage} 
               alt={property.title}
               className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
             
             <div className="absolute top-6 left-6 flex gap-2">
                <Badge className="bg-primary/90 text-white border-none px-4 py-1.5 font-black uppercase tracking-tighter shadow-xl backdrop-blur-md">
                   {property.usage === 'FOR_SALE' ? 'Venda' : 'Locação'}
                </Badge>
                {property.status === 'RESERVED' && (
                  <Badge className="bg-amber-500/90 text-white border-none px-4 py-1.5 font-black uppercase tracking-tighter shadow-xl backdrop-blur-md">
                    Reservado
                  </Badge>
                )}
             </div>

             <div className="absolute bottom-6 right-6">
                <Button className="glass border-none font-bold shadow-2xl">
                   Ver todas as Fotos ({property.media.length})
                </Button>
             </div>
          </div>

          {/* Title & Basic Stats */}
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-none mb-2">
                  {property.title}
                </h1>
                <p className="text-xl text-muted-foreground font-medium flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-primary" />
                  {property.address.street}, {property.address.neighborhood} - {property.address.city}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Preço Sugerido</p>
                <p className="text-5xl font-black tracking-tight text-gradient">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(property.price.amount)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
              {[
                { icon: Bed, label: 'Quartos', value: property.metrics.bedrooms || '-' },
                { icon: Bath, label: 'Banheiros', value: property.metrics.bathrooms || '-' },
                { icon: Maximize, label: 'Área Total', value: `${property.metrics.totalArea}m²` },
                { icon: Calendar, label: 'Publicado', value: property.publishedAt ? new Date(property.publishedAt).toLocaleDateString() : 'Recente' },
              ].map((stat: any, i: number) => (
                <div key={i} className="glass p-4 rounded-3xl border-none flex flex-col items-center justify-center text-center">
                  <stat.icon className="w-5 h-5 mb-2 text-primary" />
                  <p className="text-lg font-black">{stat.value}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Description Tabs */}
          <div className="space-y-6">
             <Tabs defaultValue="detalhes" className="w-full">
                <TabsList className="glass border-none p-1.5 rounded-2xl h-14 w-full justify-start gap-4">
                  <TabsTrigger value="detalhes" className="rounded-xl px-8 font-black tracking-tighter">Sobre o Imóvel</TabsTrigger>
                  <TabsTrigger value="amenidades" className="rounded-xl px-8 font-black tracking-tighter">Comodidades</TabsTrigger>
                  <TabsTrigger value="mapa" className="rounded-xl px-8 font-black tracking-tighter">Localização</TabsTrigger>
                </TabsList>
                
                <TabsContent value="detalhes" className="mt-6">
                  <Card className="glass border-none p-8 rounded-[2rem] shadow-none">
                    <p className="text-lg leading-relaxed text-muted-foreground whitespace-pre-wrap">
                      Este imóvel representa o ápice do design contemporâneo e sofisticação urbana. Com acabamentos de altíssimo padrão, cada detalhe foi meticulosamente planejado para oferecer o máximo conforto e elegância. 
                      \n\nA planta otimizada proporciona ambientes amplos e iluminados, com grandes vãos de vidro que conectam o interior com a vista privilegiada. A cozinha gourmet e as suítes espaçosas são apenas o começo desta experiência de morar bem.
                    </p>
                  </Card>
                </TabsContent>

                <TabsContent value="amenidades" className="mt-6">
                   <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {['Piscina Aquecida', 'Área Gourmet', 'Portaria 24h', 'Academia Premium', 'Vaga com Carregador', 'Pet Friendly', 'Automação Full', 'Varanda Integrada'].map((item: string) => (
                        <div key={item} className="flex items-center gap-3 p-4 glass border-none rounded-2xl">
                           <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                              <ShieldCheck className="w-4 h-4 text-primary" />
                           </div>
                           <span className="font-bold text-sm tracking-tight">{item}</span>
                        </div>
                      ))}
                   </div>
                </TabsContent>
             </Tabs>
          </div>
        </div>

        {/* Sidebar (Right) */}
        <div className="space-y-6">
          
          {/* IA Insights Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass border-none p-6 rounded-[2.5rem] bg-indigo-500/5 relative overflow-hidden"
          >
            <div className="hero-glow -right-20 -top-20 opacity-20 scale-150" />
            
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Sparkles className="w-6 h-6 text-white fill-white" />
              </div>
              <div>
                 <h3 className="font-black text-lg tracking-tighter leading-none">ImobWeb Insights</h3>
                 <p className="text-[10px] font-black uppercase text-indigo-400">Análise de IA 4.0</p>
              </div>
            </div>

            <div className="space-y-4 relative z-10">
               <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Potencial de Valorização</span>
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 flex-1 bg-white/5 rounded-full overflow-hidden">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: '85%' }}
                         className="h-full bg-emerald-400"
                        />
                    </div>
                    <span className="text-xs font-black">Alto</span>
                  </div>
               </div>

               <div className="space-y-2 text-sm font-medium text-muted-foreground/80 lowercase italic">
                  <p>• Localização em zona de forte expansão corporativa.</p>
                  <p>• Escassez de tipologias similares no m².</p>
                  <p>• Alta demanda para locação na região.</p>
               </div>

               <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl h-12">
                 Gerar Relatório Completo
               </Button>
            </div>
          </motion.div>

          {/* Agent Contact Card */}
          <Card className="glass border-none p-6 rounded-[2.5rem] shadow-2xl">
            <h3 className="text-xl font-black tracking-tighter mb-6">Agendar Visita</h3>
            
            <div className="space-y-4 mb-8">
               <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-secondary overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200" alt="Agent" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-black tracking-tight">Juliana Mendes</p>
                    <p className="text-xs text-muted-foreground font-medium">Corretora Elite Specialist</p>
                  </div>
               </div>
            </div>

            <div className="space-y-3">
              <Button className="w-full h-14 rounded-2xl font-black text-lg gap-2 shadow-xl shadow-primary/20">
                <MessageSquare className="w-5 h-5 fill-current" />
                WhatsApp
              </Button>
              <Button variant="outline" className="w-full h-14 rounded-2xl font-black glass border-none gap-2">
                <Phone className="w-5 h-5" />
                Ligar Agora
              </Button>
            </div>

            <div className="mt-6 pt-6 border-t border-border/50 text-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Ou deixe seu contato</p>
              <Button variant="ghost" className="text-primary font-black hover:bg-transparent hover:underline group">
                Preencher formulário <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </Card>

          {/* Trust Indicators */}
          <div className="flex flex-col gap-4 px-4 opacity-70">
             <div className="flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span className="text-[11px] font-bold tracking-tight">Certificado de Veracidade</span>
             </div>
             <div className="flex items-center gap-3">
                <Zap className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="text-[11px] font-bold tracking-tight">Processamento Ágil 24h</span>
             </div>
          </div>
        </div>

      </div>
    </div>
  )
}
