'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Filter, Home, MapPin, DollarSign, SlidersHorizontal, Loader2, Grid3X3, List, Sliders } from 'lucide-react'
import { Button } from '@/components/design-system/button'
import { Input } from '@/components/design-system/input'
import { Badge } from '@/components/design-system/badge'
import { PropertyCard } from '@/components/properties/PropertyCard'
import { useRouter } from 'next/navigation'
import { getDashboardProperties } from '@/app/actions/dashboard'

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

function PropertySkeleton() {
  return (
    <div className="rounded-3xl overflow-hidden border border-border/50 animate-pulse">
      <div className="aspect-[4/3] bg-muted" />
      <div className="p-5 space-y-3">
        <div className="h-4 w-3/4 bg-muted rounded-full" />
        <div className="h-3 w-1/2 bg-muted rounded-full" />
        <div className="h-6 w-1/3 bg-muted rounded-full" />
        <div className="flex gap-2 mt-4">
          <div className="h-6 w-16 bg-muted rounded-full" />
          <div className="h-6 w-16 bg-muted rounded-full" />
        </div>
      </div>
    </div>
  )
}

export default function PropertiesPage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    async function load() {
      const data = await getDashboardProperties()
      setProperties(data)
      setLoading(false)
    }
    load()
  }, [])

  const stats = useMemo(() => {
    const total = properties.length
    const available = properties.filter(p => p.status === 'ACTIVE' || p.status === 'DISPONIVEL').length
    const negotiating = properties.filter(p => p.status === 'NEGOCIATION' || p.status === 'NEGOCIACAO').length
    const sold = properties.filter(p => p.status === 'SOLD' || p.status === 'VENDIDO').length
    return { total, available, negotiating, sold }
  }, [properties])

  const filteredProperties = useMemo(() => {
    let filtered = properties
    if (activeFilter === 'available') filtered = properties.filter(p => p.status === 'ACTIVE' || p.status === 'DISPONIVEL')
    else if (activeFilter === 'negotiating') filtered = properties.filter(p => p.status === 'NEGOCIATION' || p.status === 'NEGOCIACAO')
    else if (activeFilter === 'sold') filtered = properties.filter(p => p.status === 'SOLD' || p.status === 'VENDIDO')

    if (search) {
      const q = search.toLowerCase()
      filtered = filtered.filter(p =>
        p.title?.toLowerCase().includes(q) ||
        p.code?.toLowerCase().includes(q) ||
        p.address?.neighborhood?.toLowerCase().includes(q) ||
        p.address?.city?.toLowerCase().includes(q)
      )
    }
    return filtered
  }, [properties, search, activeFilter])

  const filters = [
    { id: 'all', label: 'Todos', count: stats.total },
    { id: 'available', label: 'Disponíveis', count: stats.available },
    { id: 'negotiating', label: 'Em Negociação', count: stats.negotiating },
    { id: 'sold', label: 'Vendidos', count: stats.sold },
  ]

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header Section */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter">Gestão de Imóveis</h1>
          <p className="text-muted-foreground font-medium">Gerencie sua carteira de imóveis de alto padrão</p>
        </div>
        <Button onClick={() => router.push('/properties/new')} className="shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4 mr-2" /> Anunciar Imóvel
        </Button>
      </motion.div>

      {/* Stats Quick View */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'text-foreground' },
          { label: 'Disponíveis', value: stats.available, color: 'text-emerald-400' },
          { label: 'Negociando', value: stats.negotiating, color: 'text-yellow-400' },
          { label: 'Vendidos', value: stats.sold, color: 'text-purple-400' },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ scale: 1.03 }}
            className="glass p-4 rounded-3xl border-none cursor-default"
          >
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{stat.label}</p>
            <p className={`text-2xl font-black ${stat.color}`}>{loading ? '-' : stat.value}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Filters & Search */}
      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, bairro ou código..."
            className="pl-10 glass border-none h-12"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="glass border-none h-12 px-6">
            <Filter className="w-4 h-4 mr-2" /> Status
          </Button>
          <Button variant="outline" className="glass border-none h-12 px-6">
            <SlidersHorizontal className="w-4 h-4 mr-2" /> Filtros Avançados
          </Button>
          <div className="flex border border-border/50 rounded-xl overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 transition-colors ${viewMode === 'grid' ? 'bg-primary text-white' : 'bg-secondary/50 text-muted-foreground hover:text-foreground'}`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 transition-colors ${viewMode === 'list' ? 'bg-primary text-white' : 'bg-secondary/50 text-muted-foreground hover:text-foreground'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Quick Summary Badges */}
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
              className={`px-4 py-1.5 rounded-full glass border-none text-xs font-bold uppercase cursor-pointer transition-all ${
                activeFilter === f.id ? 'bg-primary text-primary-foreground' : 'opacity-60 hover:opacity-100'
              }`}
            >
              {f.label} ({f.count})
            </Badge>
          </motion.button>
        ))}
      </motion.div>

      {/* Properties Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => <PropertySkeleton key={i} />)}
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeFilter + viewMode}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className={viewMode === 'grid'
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              : "flex flex-col gap-4"
            }
          >
            {filteredProperties.map((property, idx) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ scale: viewMode === 'grid' ? 1.02 : 1.01, y: viewMode === 'grid' ? -4 : 0 }}
              >
                <PropertyCard property={property as any} />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Empty State */}
      {!loading && filteredProperties.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 text-center space-y-4"
        >
          <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center">
            <Home className="w-10 h-10 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Nenhum imóvel encontrado</h3>
            <p className="text-muted-foreground">Tente ajustar seus filtros de busca ou adicione um novo imóvel.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { setSearch(''); setActiveFilter('all'); }}>
              Limpar Filtros
            </Button>
            <Button onClick={() => router.push('/properties/new')}>
              <Plus className="w-4 h-4 mr-2" /> Adicionar Imóvel
            </Button>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
