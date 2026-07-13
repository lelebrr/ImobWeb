'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Filter, SlidersHorizontal, UserPlus, Zap, Loader2, TrendingUp, Users, Clock, Target } from 'lucide-react'
import { Button } from '@/components/design-system/button'
import { Input } from '@/components/design-system/input'
import { Badge } from '@/components/design-system/badge'
import { LeadCard, LeadStatus } from '@/components/leads/LeadCard'
import { LeadSlideOver } from '@/components/leads/LeadSlideOver'
import { getDashboardLeads } from '@/app/actions/dashboard'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  }
}

function LeadSkeleton() {
  return (
    <div className="rounded-3xl overflow-hidden border border-border/50 animate-pulse p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-2/3 bg-muted rounded-full" />
          <div className="h-3 w-1/2 bg-muted rounded-full" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 w-full bg-muted rounded-full" />
        <div className="h-3 w-3/4 bg-muted rounded-full" />
      </div>
      <div className="flex gap-2">
        <div className="h-6 w-20 bg-muted rounded-full" />
        <div className="h-6 w-16 bg-muted rounded-full" />
      </div>
    </div>
  )
}

export default function LeadsPage() {
  const [search, setSearch] = useState('')
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLead, setSelectedLead] = useState<any>(null)
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState('all')

  useEffect(() => {
    async function load() {
      const data = await getDashboardLeads()
      setLeads(data)
      setLoading(false)
    }
    load()
  }, [])

  const stats = useMemo(() => {
    const today = new Date().toDateString()
    const newToday = leads.filter(l => {
      const status = l.status?.toUpperCase?.() || l.status
      return status === 'NOVO' && new Date(l.createdAt).toDateString() === today
    }).length
    const total = leads.length
    const inProgress = leads.filter(l => {
      const status = l.status?.toUpperCase?.() || l.status
      return ['INTERESSADO', 'CONTATADO', 'VISITA_AGENDADA', 'PROPOSTA'].includes(status)
    }).length
    const won = leads.filter(l => {
      const status = l.status?.toUpperCase?.() || l.status
      return status === 'GANHO' || status === 'WON'
    }).length
    return { newToday, total, inProgress, won }
  }, [leads])

  const filteredLeads = useMemo(() => {
    let filtered = leads
    if (activeFilter !== 'all') {
      filtered = leads.filter(l => {
        const status = (l.status?.toUpperCase?.() || l.status || '').replace(/ /g, '_')
        return status === activeFilter.toUpperCase()
      })
    }
    if (search) {
      const q = search.toLowerCase()
      filtered = filtered.filter(l =>
        l.name?.toLowerCase().includes(q) ||
        l.email?.toLowerCase().includes(q) ||
        l.phone?.includes(q)
      )
    }
    return filtered
  }, [leads, search, activeFilter])

  const handleOpenLead = (lead: any) => {
    setSelectedLead(lead)
    setIsSlideOverOpen(true)
  }

  const filters = [
    { id: 'all', label: 'Todos' },
    { id: 'novo', label: 'Novos' },
    { id: 'interessado', label: 'Interessados' },
    { id: 'contatado', label: 'Contatados' },
    { id: 'visita_agendada', label: 'Visitas' },
    { id: 'proposta', label: 'Propostas' },
    { id: 'ganho', label: 'Ganhos' },
  ]

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-10"
    >
      {/* Header Section */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
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
      </motion.div>

      {/* Stats Quick View */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Novos Hoje', value: stats.newToday, color: 'text-blue-400', icon: UserPlus },
          { label: 'Total', value: stats.total, color: 'text-purple-400', icon: Users },
          { label: 'Em Andamento', value: stats.inProgress, color: 'text-yellow-400', icon: Clock },
          { label: 'Ganhos', value: stats.won, color: 'text-emerald-400', icon: Target },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ scale: 1.03 }}
            className="glass p-4 rounded-3xl border-none cursor-default"
          >
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</p>
              <stat.icon className={`w-4 h-4 ${stat.color} opacity-60`} />
            </div>
            <p className={`text-2xl font-black ${stat.color}`}>{loading ? '-' : stat.value}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Filters & Search */}
      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row gap-4">
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
      </motion.div>

      {/* Filter Badges */}
      <motion.div variants={itemVariants} className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <motion.button
            key={f.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveFilter(f.id)}
          >
            <Badge
              variant={activeFilter === f.id ? 'secondary' : 'outline'}
              className={`px-3 py-1 rounded-full glass border-none text-xs font-bold uppercase cursor-pointer transition-all ${
                activeFilter === f.id ? 'bg-primary text-primary-foreground' : 'opacity-60 hover:opacity-100'
              }`}
            >
              {f.label}
            </Badge>
          </motion.button>
        ))}
      </motion.div>

      {/* Leads Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => <LeadSkeleton key={i} />)}
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeFilter}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            {filteredLeads.map((lead, idx) => (
              <motion.div
                key={lead.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleOpenLead(lead)}
                className="cursor-pointer"
              >
                <LeadCard lead={lead} />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Lead Detail SlideOver */}
      <LeadSlideOver
        isOpen={isSlideOverOpen}
        onClose={() => setIsSlideOverOpen(false)}
        lead={selectedLead}
      />

      {/* Empty Message */}
      {!loading && filteredLeads.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <div className="w-20 h-20 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-black tracking-tighter">Nenhum lead encontrado</h3>
          <p className="text-muted-foreground max-w-xs mx-auto">Aumente sua presença em portais para receber novos contatos automaticamente.</p>
          <Button className="mt-4" variant="outline" onClick={() => { setSearch(''); setActiveFilter('all'); }}>
            Limpar Filtros
          </Button>
        </motion.div>
      )}
    </motion.div>
  )
}
