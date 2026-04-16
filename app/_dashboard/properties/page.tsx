'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Search, Filter, Home, MapPin, DollarSign, SlidersHorizontal, Loader2 } from 'lucide-react'
import { Button } from '@/components/design-system/button'
import { Input } from '@/components/design-system/input'
import { Badge } from '@/components/design-system/badge'
import { PropertyCard } from '@/components/properties/PropertyCard'
import { useRouter } from 'next/navigation'
import { getDashboardProperties } from '@/app/actions/dashboard'

export default function PropertiesPage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const data = await getDashboardProperties()
      setProperties(data)
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter">Gestão de Imóveis</h1>
          <p className="text-muted-foreground font-medium">Gerencie sua carteira de imóveis de alto padrão</p>
        </div>
        <Button onClick={() => router.push('/properties/new')} className="shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4 mr-2" /> Anunciar Imóvel
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col lg:flex-row gap-4">
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
        </div>
      </div>

      {/* Quick Summary Badges */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary" className="px-4 py-1.5 rounded-full glass border-none text-xs font-bold uppercase">Todos (47)</Badge>
        <Badge variant="outline" className="px-4 py-1.5 rounded-full glass border-none text-xs font-bold uppercase opacity-60">Disponíveis (32)</Badge>
        <Badge variant="outline" className="px-4 py-1.5 rounded-full glass border-none text-xs font-bold uppercase opacity-60">Em Negociação (8)</Badge>
        <Badge variant="outline" className="px-4 py-1.5 rounded-full glass border-none text-xs font-bold uppercase opacity-60">Vendidos (7)</Badge>
      </div>

      {/* Properties Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.filter(p => p.title?.toLowerCase().includes(search.toLowerCase()) || p.code?.toLowerCase().includes(search.toLowerCase())).map((property) => (
          <div key={property.id} className="animate-in fade-in zoom-in-95 duration-500">
             <PropertyCard property={property as any} />
          </div>
        ))}
        </div>
      )}

      {/* Empty State Mock */}
      {!loading && properties.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center">
            <Home className="w-10 h-10 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Nenhum imóvel encontrado</h3>
            <p className="text-muted-foreground">Tente ajustar seus filtros de busca ou adicione um novo imóvel.</p>
          </div>
          <Button variant="outline">Limpar Filtros</Button>
        </div>
      )}
    </div>
  )
}
