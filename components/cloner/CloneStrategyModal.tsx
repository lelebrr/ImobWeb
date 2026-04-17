'use client'

import React, { useState, useEffect } from 'react'
import { 
  X, 
  Check, 
  Zap, 
  Sparkles, 
  TrendingUp, 
  MessageSquare, 
  ArrowRight,
  RefreshCw,
  Copy,
  Info,
  ShieldCheck,
  AlertCircle
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/design-system/button'
import { Badge } from '@/components/design-system/badge'
import { Card, CardContent } from '@/components/design-system/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/design-system/tabs'
import { Input } from '@/components/design-system/input'
import { Textarea } from '@/components/design-system/textarea'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { 
  ClonedStrategyResult, 
  CloneStrategyRequest,
  CloningTone 
} from '@/types/cloner'
import { clonerMotor } from '@/lib/cloner/intelligent-cloner'
import { cn } from '@/lib/utils'

interface CloneStrategyModalProps {
  isOpen: boolean
  onClose: () => void
  sourcePropertyId: string
  onConfirm: (optimizedData: any) => void
}

export const CloneStrategyModal: React.FC<CloneStrategyModalProps> = ({
  isOpen,
  onClose,
  sourcePropertyId,
  onConfirm
}) => {
  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState<ClonedStrategyResult | null>(null)
  const [activeTab, setActiveTab] = useState('review')
  const [preferredTone, setPreferredTone] = useState<CloningTone>('PROFESSIONAL')
  const [isPublishing, setIsPublishing] = useState(false)

  useEffect(() => {
    if (isOpen && sourcePropertyId) {
      loadStrategy()
    }
  }, [isOpen, sourcePropertyId, preferredTone])

  const loadStrategy = async () => {
    setLoading(true)
    try {
      const data = await clonerMotor.processCloneRequest({
        sourcePropertyId,
        adjustPrice: true,
        optimizeDescription: true,
        reorderPhotos: true,
        generateWhatsApp: true,
        preferredTone
      })
      setResult(data)
    } catch (error) {
      console.error("Error loading clone strategy:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = () => {
    setIsPublishing(true)
    setTimeout(() => {
      onConfirm(result?.optimizedData)
      setIsPublishing(false)
      onClose()
    }, 2000)
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-background/80 backdrop-blur-2xl border-white/10 rounded-[2.5rem] shadow-2xl">
        <DialogHeader className="p-8 pb-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <RefreshCw className={cn("w-7 h-7 text-white", loading && "animate-spin")} />
            </div>
            <div>
              <DialogTitle className="text-3xl font-black tracking-tighter">Clonar Estratégia de Sucesso</DialogTitle>
              <DialogDescription className="text-muted-foreground font-medium">
                Replicando a inteligência do anúncio "{result?.sourceProperty.title}"
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-8 py-6 max-h-[70vh] overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-primary animate-pulse" />
              </div>
              <p className="text-lg font-black tracking-tight animate-pulse text-gradient">IA Otimizando Preço e Descrição...</p>
            </div>
          ) : result && (
            <div className="space-y-8">
              {/* Performance Banner */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="glass p-4 rounded-3xl border-none bg-emerald-500/10">
                   <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Performance Projetada</span>
                   </div>
                   <p className="text-2xl font-black tracking-tight">{result.insights.performance.expectedLeadsPerWeek} Leads/Semana</p>
                 </div>
                 <div className="glass p-4 rounded-3xl border-none bg-indigo-500/10">
                   <div className="flex items-center gap-2 mb-1">
                      <Zap className="w-4 h-4 text-indigo-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Tempo de Venda</span>
                   </div>
                   <p className="text-2xl font-black tracking-tight">Est. {result.insights.performance.estimatedTimeUntilSale} dias</p>
                 </div>
                 <div className="glass p-4 rounded-3xl border-none bg-amber-500/10">
                   <div className="flex items-center gap-2 mb-1">
                      <AlertCircle className="w-4 h-4 text-amber-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">Pacote Sugerido</span>
                   </div>
                   <p className="text-2xl font-black tracking-tight">Super Destaque</p>
                 </div>
              </div>

              <Tabs defaultValue="review" className="w-full">
                <TabsList className="glass border-none p-1.5 rounded-2xl h-14 w-full justify-start gap-4 mb-6">
                  <TabsTrigger value="review" className="rounded-xl px-8 font-black tracking-tighter">Revisão IA</TabsTrigger>
                  <TabsTrigger value="content" className="rounded-xl px-8 font-black tracking-tighter">Conteúdo Editável</TabsTrigger>
                  <TabsTrigger value="multimedia" className="rounded-xl px-8 font-black tracking-tighter">Fotos & Legendas</TabsTrigger>
                </TabsList>

                <TabsContent value="review" className="space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="glass border-none p-6 rounded-[2rem] bg-secondary/30 relative overflow-hidden">
                         <div className="absolute top-4 right-4 text-primary opacity-20"><Info className="w-8 h-8" /></div>
                         <h4 className="font-black text-sm uppercase tracking-widest text-muted-foreground mb-4">Insights de Preço</h4>
                         <p className="text-lg font-bold leading-snug mb-4">{result.insights.price.reasoning}</p>
                         <div className="p-4 bg-background/50 rounded-2xl border border-white/5">
                            <span className="text-xs text-muted-foreground block mb-1">Preço Sugerido pela IA</span>
                            <span className="text-2xl font-black text-primary">
                               {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(result.optimizedData.price.amount)}
                            </span>
                         </div>
                      </Card>

                      <Card className="glass border-none p-6 rounded-[2rem] bg-secondary/30 relative overflow-hidden">
                         <div className="absolute top-4 right-4 text-primary opacity-20"><Sparkles className="w-8 h-8" /></div>
                         <h4 className="font-black text-sm uppercase tracking-widest text-muted-foreground mb-4">Insights de Descrição</h4>
                         <p className="text-lg font-bold leading-snug mb-4">{result.insights.description.reasoning}</p>
                         <div className="flex flex-wrap gap-2">
                            {['Título Chamativo', 'SEO Otimizado', 'Foco em Benefícios', 'Call to Action'].map(tag => (
                              <Badge key={tag} className="bg-primary/10 text-primary border-none font-bold">{tag}</Badge>
                            ))}
                         </div>
                      </Card>
                   </div>

                   <Card className="glass border-none p-6 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/20">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                           <MessageSquare className="w-5 h-5 text-indigo-500" />
                           <h4 className="font-black tracking-tighter">WhatsApp Strategy</h4>
                        </div>
                        <Badge variant="outline" className="text-indigo-500 border-indigo-500 font-black">REPLICADA</Badge>
                      </div>
                      <p className="text-sm font-medium text-muted-foreground italic mb-4">"O texto que gerou 45% mais agendamentos nesta categoria"</p>
                      <div className="p-4 bg-indigo-500/10 rounded-2xl italic text-sm border-white/5">
                        {result.optimizedData.whatsappInitialText}
                      </div>
                   </Card>
                </TabsContent>

                <TabsContent value="content" className="space-y-6">
                   <div className="space-y-4">
                      <div className="space-y-2">
                         <label className="text-xs font-black uppercase tracking-widest px-2">Título do Anúncio</label>
                         <Input 
                           defaultValue={result.optimizedData.title}
                           className="glass h-14 rounded-2xl border-none text-lg font-black"
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-xs font-black uppercase tracking-widest px-2">Tom da Voz (IA)</label>
                         <div className="flex flex-wrap gap-2 p-2 glass rounded-2xl">
                            {(['PROFESSIONAL', 'ENTHUSIASTIC', 'LUXURY', 'PERSUASIVE'] as CloningTone[]).map(tone => (
                              <Button 
                                key={tone}
                                variant={preferredTone === tone ? "default" : "ghost"}
                                size="sm"
                                onClick={() => setPreferredTone(tone)}
                                className="rounded-xl font-bold"
                              >
                                {tone}
                              </Button>
                            ))}
                         </div>
                      </div>
                      <div className="space-y-2">
                         <label className="text-xs font-black uppercase tracking-widest px-2">Descrição Completa</label>
                         <Textarea 
                           defaultValue={result.optimizedData.description}
                           className="glass min-h-[200px] rounded-2xl border-none text-base leading-relaxed"
                         />
                      </div>
                   </div>
                </TabsContent>

                <TabsContent value="multimedia" className="space-y-6">
                   <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {result.sourceProperty.media.slice(0, 6).map((item, i) => (
                        <div key={item.id} className="relative group">
                           <div className="aspect-square rounded-2xl overflow-hidden glass border-none">
                              <img src={item.url} alt={item.alt} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                 <Button size="icon" variant="ghost" className="text-white"><RefreshCw className="w-4 h-4" /></Button>
                                 <Button size="icon" variant="ghost" className="text-white"><Copy className="w-4 h-4" /></Button>
                              </div>
                           </div>
                           <div className="absolute top-2 left-2 w-6 h-6 rounded-lg bg-primary text-white flex items-center justify-center text-[10px] font-black">
                              {i + 1}
                           </div>
                           <Input 
                             defaultValue={result.optimizedData.mediaCaptions[item.id]} 
                             placeholder="Legenda da IA..."
                             className="mt-2 glass h-8 rounded-lg border-none text-[10px] font-bold py-1"
                           />
                        </div>
                      ))}
                   </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>

        <DialogFooter className="p-8 bg-secondary/20 border-t border-white/5 flex flex-col sm:flex-row gap-4">
          <Button variant="ghost" onClick={onClose} disabled={isPublishing} className="rounded-2xl font-black px-8">
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={loading || isPublishing}
            className="flex-1 h-14 rounded-2xl font-black text-lg gap-2 shadow-xl shadow-primary/20"
          >
            {isPublishing ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Publicando Clone...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 fill-current" />
                Confirmar e Publicar Clone Otimizado
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
