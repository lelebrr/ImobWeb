'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FileText, 
  Sparkles, 
  ArrowLeft, 
  CheckCircle2, 
  Copy, 
  ChevronRight,
  Zap,
  Layout,
  Type,
  Maximize2,
  Minimize2,
  Trash2
} from 'lucide-react'
import { Button } from '@/components/design-system/button'
import { Card } from '@/components/design-system/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'
import { toast } from 'sonner'

export default function GenerateDescriptionPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  
  const handleGenerate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    
    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData)
    
    try {
      const res = await fetch('/api/ai/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: data.location,
          area: Number(data.area),
          propertyType: data.type || 'apartamento',
          beds: Number(data.beds),
          baths: Number(data.baths),
          parking: Number(data.parking),
          tone: data.tone || 'persuasivo',
        }),
      })
      
      const json = await res.json()
      if (json.success) {
        setResult(json.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copiado para a área de transferência')
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <Link href="/ai" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-bold text-sm group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Voltar ao Centro de Inteligência
      </Link>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-primary font-bold tracking-tighter">
          <FileText className="w-5 h-5" />
          <span>IA ELITE COPYWRITING</span>
        </div>
        <h1 className="text-4xl font-black tracking-tight text-white">Gerador de Descrição IA</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: Settings */}
        <div className="lg:col-span-12 xl:col-span-5 space-y-6">
          <Card className="p-8 bg-slate-900/40 border-white/5 space-y-8">
            <form onSubmit={handleGenerate} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500">Localização / Bairro</label>
                <Input name="location" placeholder="Ex: Jardins, São Paulo" className="h-14 bg-white/5 border-white/10 text-white font-medium" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-500">Área (m²)</label>
                    <Input name="area" type="number" placeholder="0" className="h-14 bg-white/5 border-white/10 text-white font-medium" required />
                 </div>
                 <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-500">Dormitórios</label>
                    <Input name="beds" type="number" defaultValue="2" className="h-14 bg-white/5 border-white/10 text-white font-medium" />
                 </div>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500">Tom da Comunicação</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { val: 'persuasivo', label: 'Vendedor' },
                    { val: 'luxo', label: 'Alto Padrão' },
                    { val: 'tecnico', label: 'Informativo' },
                    { val: 'formal', label: 'Corporativo' }
                  ].map((t) => (
                    <div key={t.val} className="relative">
                      <input type="radio" name="tone" value={t.val} id={t.val} defaultChecked={t.val==='persuasivo'} className="peer hidden" />
                      <label htmlFor={t.val} className="flex items-center justify-center p-3 rounded-xl border border-white/5 bg-white/5 text-slate-400 peer-checked:bg-primary/20 peer-checked:border-primary peer-checked:text-white font-bold text-sm cursor-pointer hover:bg-white/10 transition-all">
                        {t.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full h-16 text-lg font-black tracking-tight rounded-2xl shadow-2xl shadow-primary/30 group" disabled={loading}>
                {loading ? 'Gerando Conteúdo...' : 'Gerar Anúncio de Elite'}
                {!loading && <Sparkles className="ml-2 w-5 h-5 group-hover:scale-125 transition-transform" />}
              </Button>
            </form>
          </Card>
        </div>

        {/* Right: Output */}
        <div className="lg:col-span-12 xl:col-span-7">
           <AnimatePresence mode="wait">
             {result ? (
               <motion.div
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: 20 }}
                 className="space-y-6"
               >
                 <div className="flex items-center justify-between mb-2">
                    <h3 className="font-black text-white uppercase tracking-widest text-xs">RESULTADOS GERADOS</h3>
                    <div className="flex gap-2">
                       <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-emerald-400">
                          <CheckCircle2 className="w-3 h-3" />
                          Alta Relevância
                       </div>
                    </div>
                 </div>

                 {/* Variations Tabs - Simplified for UI */}
                 <div className="space-y-4">
                   <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-primary to-indigo-500 rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition" />
                      <Card className="relative p-8 bg-slate-900 overflow-hidden">
                         <div className="flex items-center justify-between mb-6">
                            <span className="text-xs font-black text-primary uppercase tracking-widest">DESCRIÇÃO COMPLETA</span>
                            <Button variant="ghost" size="sm" onClick={() => copyToClipboard(result.descriptions.full)} className="text-slate-500 hover:text-white">
                               <Copy className="w-4 h-4 mr-2" /> Copiar Tudo
                            </Button>
                         </div>
                         <div className="prose prose-invert max-w-none">
                            <p className="text-slate-300 leading-relaxed font-medium whitespace-pre-line">
                               {result.descriptions.full}
                            </p>
                         </div>
                      </Card>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="p-6 bg-slate-900/40 border-white/5 space-y-4">
                         <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">RESUMO RÁPIDO</span>
                            <Button variant="ghost" size="icon" onClick={() => copyToClipboard(result.descriptions.short)} className="h-8 w-8 text-slate-500">
                               <Copy className="w-3.5 h-3.5" />
                            </Button>
                         </div>
                         <p className="text-sm text-slate-400 font-bold leading-snug">
                            {result.descriptions.short}
                         </p>
                      </Card>

                      <Card className="p-6 bg-slate-900/40 border-white/5 space-y-4">
                         <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">TAGS INTELIGENTES</span>
                         </div>
                         <div className="flex flex-wrap gap-2">
                            {result.tags.map((tag: string) => (
                              <span key={tag} className="px-2 py-1 rounded-lg bg-white/5 border border-white/5 text-[10px] font-bold text-slate-300">
                                 #{tag.replace(/\s+/g, '')}
                              </span>
                            ))}
                         </div>
                      </Card>
                   </div>

                   <Card className="p-6 bg-indigo-500/10 border-indigo-500/20">
                      <div className="flex gap-4">
                         <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-2xl shrink-0">
                            <Zap className="w-6 h-6" />
                         </div>
                         <div className="space-y-1">
                            <h4 className="font-bold text-white">Dicas SEO Ativadas</h4>
                            <p className="text-xs text-slate-400 leading-relaxed font-medium">
                               Utilize as palavras-chave sugeridas abaixo nos campos de meta-descrição do portal para indexar 
                               {result.seoKeywords.join(', ')}.
                            </p>
                         </div>
                      </div>
                   </Card>
                 </div>
               </motion.div>
             ) : (
               <div className="h-full flex flex-col items-center justify-center text-center space-y-6 border-2 border-dashed border-white/5 rounded-[2.5rem] p-12">
                  <div className="w-20 h-20 rounded-[2rem] bg-primary/10 flex items-center justify-center">
                     <Layout className="w-10 h-10 text-primary opacity-20" />
                  </div>
                  <div className="space-y-2">
                     <h3 className="text-xl font-bold text-slate-600">Aguardando rascunho...</h3>
                     <p className="text-sm text-slate-500 max-w-xs font-medium">
                       Adicione as informações básicas do imóvel ao lado para que nossa IA gere as variações de anúncio.
                     </p>
                  </div>
               </div>
             )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
