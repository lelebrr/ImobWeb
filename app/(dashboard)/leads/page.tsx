'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Search, Filter, SlidersHorizontal, UserPlus, Zap, Loader2 } from 'lucide-react'
import { Button } from '@/components/design-system/button'
import { Input } from '@/components/design-system/input'
import { Badge } from '@/components/design-system/badge'
import { LeadCard, LeadStatus } from '@/components/leads/LeadCard'
import { LeadSlideOver } from '@/components/leads/LeadSlideOver'
import { getDashboardLeads } from '@/app/actions/dashboard'

export default function LeadsPage() {
  const [search, setSearch] = useState('')
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLead, setSelectedLead] = useState<any>(null)
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false)

  useEffect(() => {
    async function load() {
      const data = await getDashboardLeads()
      setLeads(data)
      setLoading(false)
    }
    load()
  }, [])

  const handleOpenLead = (lead: any) => {
    setSelectedLead(lead)
    setIsSlideOverOpen(true)
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-black tracking-tighter">Gestão de Leads</h1>
            <Badge variant="secondary" className="glass border-none font-bold text-primary">CRM</Badge>
          </div>
          <p className="text-muted-foreground font-medium">Converta seus contatos em clientes e acelere suas vendas.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
           <Button variant="outline" className="glass border-none flex-1 md:flex-none">
              <Zap className="w-4 h-4 mr-2 text-yellow-500 fill-yellow-500" /> Automações IA
           </Button>
           <Button className="shadow-lg shadow-primary/20 flex-1 md:flex-none">
              <UserPlus className="w-4 h-4 mr-2" /> Novo Lead
           </Button>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass p-4 rounded-3xl border-none">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Novos Hoje</p>
          <p className="text-2xl font-black">{loading ? '-' : leads.filter(l => l.status === 'NOVO').length || 0}</p>
        </div>
        <div className="glass p-4 rounded-3xl border-none">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Total</p>
          <p className="text-2xl font-black text-purple-400">{loading ? '-' : leads.length}</p>
        </div>
        <div className="glass p-4 rounded-3xl border-none">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Taxa de Resp.</p>
          <p className="text-2xl font-black text-emerald-400">94%</p>
        </div>
        <div className="glass p-4 rounded-3xl border-none">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Vendas Mês</p>
          <p className="text-2xl font-black text-primary">07</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por nome, email ou telefone..." 
            className="pl-12 glass border-none h-14 rounded-2xl text-base shadow-inner"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="glass border-none h-14 px-6 rounded-2xl font-bold">
            <Filter className="w-4 h-4 mr-2" /> Status
          </Button>
          <Button variant="outline" className="glass border-none h-14 px-6 rounded-2xl font-bold">
             <SlidersHorizontal className="w-4 h-4 mr-2" /> Avançado
          </Button>
        </div>
      </div>

      {/* Leads Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {leads.filter(l => l.name?.toLowerCase().includes(search.toLowerCase()) || l.email?.toLowerCase().includes(search.toLowerCase())).map((lead) => (
            <div key={lead.id} onClick={() => handleOpenLead(lead)} className="cursor-pointer active:scale-[0.98] transition-transform">
              <LeadCard lead={lead} />
            </div>
          ))}
        </div>
      )}

      {/* Lead Detail SlideOver */}
      <LeadSlideOver 
        isOpen={isSlideOverOpen} 
        onClose={() => setIsSlideOverOpen(false)} 
        lead={selectedLead} 
      />

      {/* Empty Message Example */}
      {!loading && leads.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-black tracking-tighter">Nenhum lead encontrado</h3>
            <p className="text-muted-foreground max-w-xs mx-auto">Aumente sua presença em portais para receber novos contatos automaticamente.</p>
        </div>
      )}
    </div>
  )
}
