'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp,
  MapPin,
  Home,
  ArrowLeft,
  Sparkles,
  ChevronRight,
  Info,
  CheckCircle2,
  DollarSign,
  Maximize2,
  BedDouble,
  Bath,
  Car,
  BrainCircuit
} from 'lucide-react'
import { Button } from '@/components/design-system/button'
import { Card } from '@/components/design-system/card'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

export default function SuggestPricePage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleSuggest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData)

    try {
      const res = await fetch('/api/ai/suggest-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: data.type || 'apartamento',
          area: Number(data.area),
          location: data.location,
          zone: data.zone || 'centro',
          beds: Number(data.beds),
          baths: Number(data.baths),
          parking: Number(data.parking),
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

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Navbar Link back */}
      <Link href="/ai" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-bold text-sm group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Voltar ao Centro de Inteligência
      </Link>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-primary font-bold tracking-tighter">
          <TrendingUp className="w-5 h-5" />
          <span>IA ELITE PRICE PREDICTION</span>
        </div>
        <h1 className="text-4xl font-black tracking-tight text-white mb-8">Sugestão de Preço Inteligente</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: Form */}
        <div className="lg:col-span-12 xl:col-span-5 space-y-6">
          <Card className="p-8 bg-slate-900/40 border-white/5 space-y-8">
            <form onSubmit={handleSuggest} className="space-y-6">
              <div className="space-y-4">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500">Tipo de Imóvel</label>
                <div className="grid grid-cols-2 gap-3">
                  {['apartamento', 'casa', 'comercial', 'terreno'].map((t) => (
                    <div key={t} className="relative">
                      <input type="radio" name="type" value={t} id={t} defaultChecked={t === 'apartamento'} className="peer hidden" />
                      <label htmlFor={t} className="flex items-center justify-center p-3 rounded-xl border border-white/5 bg-white/5 text-slate-400 peer-checked:bg-primary/20 peer-checked:border-primary peer-checked:text-white font-bold text-sm cursor-pointer hover:bg-white/10 transition-all capitalize">
                        {t}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500">Localização / Bairro</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input name="location" placeholder="Ex: Itaim Bibi, São Paulo" className="pl-12 h-14 bg-white/5 border-white/10 text-white font-medium" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500">Área (m²)</label>
                  <div className="relative">
                    <Input name="area" type="number" placeholder="0" className="h-14 bg-white/5 border-white/10 text-white font-medium" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500">Dormitórios</label>
                  <Input name="beds" type="number" defaultValue="2" className="h-14 bg-white/5 border-white/10 text-white font-medium" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500">Banheiros</label>
                  <Input name="baths" type="number" defaultValue="1" className="h-14 bg-white/5 border-white/10 text-white font-medium" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500">Vagas</label>
                  <Input name="parking" type="number" defaultValue="1" className="h-14 bg-white/5 border-white/10 text-white font-medium" />
                </div>
              </div>

              <Button type="submit" className="w-full h-16 text-lg font-black tracking-tight rounded-2xl shadow-2xl shadow-primary/30 group" disabled={loading}>
                {loading ? 'Processando Inteligência...' : 'Gerar Sugestão de Preço'}
                {!loading && <Sparkles className="ml-2 w-5 h-5 group-hover:scale-125 transition-transform" />}
              </Button>
            </form>
          </Card>
        </div>

        {/* Right: Results Display */}
        <div className="lg:col-span-12 xl:col-span-7">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-6"
              >
                <Card className="p-8 bg-indigo-600 border-none shadow-[0_32px_64px_-16px_rgba(79,70,229,0.3)]">
                  <div className="flex items-center justify-between mb-8">
                    <span className="px-3 py-1 rounded-full bg-white/20 text-white font-black text-[10px] tracking-widest uppercase">
                      RECOMENDAÇÃO FINAL
                    </span>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-indigo-200" />
                      <span className="text-white font-bold text-sm">Validado por Big Data</span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-8">
                    <p className="text-indigo-200 font-bold uppercase tracking-widest text-xs">Preço Sugerido para o Mercado</p>
                    <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter">
                      {result.formattedPrice}
                    </h2>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-8 border-t border-white/10">
                    <div>
                      <p className="text-indigo-200 font-bold text-[10px] uppercase tracking-widest mb-1">Mínimo Aceitável</p>
                      <p className="text-xl font-black text-white">{result.range.formattedMin}</p>
                    </div>
                    <div>
                      <p className="text-indigo-200 font-bold text-[10px] uppercase tracking-widest mb-1">Máximo Otimista</p>
                      <p className="text-xl font-black text-white">{result.range.formattedMax}</p>
                    </div>
                  </div>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="p-6 bg-slate-900/40 border-white/5 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <p className="font-bold text-white">Confiança</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${result.confidence * 100}%` }}
                          className="h-full bg-indigo-500"
                        />
                      </div>
                      <span className="font-black text-white text-sm">{Math.round(result.confidence * 100)}%</span>
                    </div>
                  </Card>

                  <Card className="p-6 bg-slate-900/40 border-white/5 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                        <DollarSign className="w-5 h-5" />
                      </div>
                      <p className="font-bold text-white">Preço por m²</p>
                    </div>
                    <p className="text-2xl font-black text-white italic">{result.formattedPricePerSqm}</p>
                  </Card>
                </div>

                <Card className="p-6 bg-slate-900/40 border-white/5 space-y-4">
                  <h4 className="font-black text-white uppercase tracking-widest text-[10px] mb-4">Fatores de Influência</h4>
                  <div className="space-y-3">
                    {result.factors.map((f: string, i: number) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="mt-1 w-1.5 h-1.5 rounded-full bg-primary" />
                        <p className="text-sm font-medium text-slate-300">{f}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6 border-2 border-dashed border-white/5 rounded-[2.5rem] p-12">
                <div className="w-20 h-20 rounded-[2rem] bg-indigo-500/10 flex items-center justify-center">
                  <BrainCircuit className="w-10 h-10 text-indigo-400 opacity-20" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-slate-600">Aguardando dados...</h3>
                  <p className="text-sm text-slate-500 max-w-xs font-medium">
                    Preencha as características do imóvel ao lado para que nossa IA analise o mercado.
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
