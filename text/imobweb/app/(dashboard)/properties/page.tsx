'use client'

import React, { useState } from 'react'
import { Plus, Search, Filter, Home, MapPin, DollarSign, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/design-system/button'
import { Input } from '@/components/design-system/input'
import { Badge } from '@/components/design-system/badge'
import { PropertyCard } from '@/components/ui/PropertyCard'
import { useRouter } from 'next/navigation'

// Mock de dados para demonstração - Em um caso real, viria do Prisma/API
const MOCK_PROPERTIES = [
  {
    id: '1',
    title: 'Cobertura Duplex no Itaim Bibi',
    description: 'Vista espetacular 360 graus, acabamento em mármore italiano e automação completa.',
    price: { amount: 8500000, currency: 'BRL' },
    address: { neighborhood: 'Itaim Bibi', city: 'São Paulo' },
    metrics: { totalArea: 450, bedrooms: 4, bathrooms: 5, parkingSpaces: 4 },
    media: [{ url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1000' }],
    status: 'ACTIVE' as const,
    usage: 'FOR_SALE' as const,
    typeId: 'Apartamento'
  },
  {
    id: '2',
    title: 'Casa Contemporânea em Pinheiros',
    description: 'Projeto assinado por arquiteto renomado, jardim vertical e teto solar.',
    price: { amount: 3200000, currency: 'BRL' },
    address: { neighborhood: 'Pinheiros', city: 'São Paulo' },
    metrics: { totalArea: 280, bedrooms: 3, bathrooms: 4, parkingSpaces: 2 },
    media: [{ url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1000' }],
    status: 'ACTIVE' as const,
    usage: 'FOR_SALE' as const,
    typeId: 'Casa'
  },
  {
    id: '3',
    title: 'Loft Industrial na Vila Madalena',
    description: 'Pé direito duplo, janelas amplas e conceito aberto. Ideal para solteiros ou casais.',
    price: { amount: 1200000, currency: 'BRL' },
    address: { neighborhood: 'Vila Madalena', city: 'São Paulo' },
    metrics: { totalArea: 95, bedrooms: 1, bathrooms: 1, parkingSpaces: 1 },
    media: [{ url: 'https://images.unsplash.com/photo-1536376074432-bf12585b0573?auto=format&fit=crop&q=80&w=1000' }],
    status: 'ACTIVE' as const,
    usage: 'FOR_SALE' as const,
    typeId: 'Loft'
  }
]

export default function PropertiesPage() {
  const router = useRouter()
  const [search, setSearch] = useState('')

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {MOCK_PROPERTIES.map((property) => (
          <div key={property.id} className="animate-in fade-in zoom-in-95 duration-500">
             <PropertyCard property={property as any} />
          </div>
        ))}
      </div>

      {/* Empty State Mock */}
      {MOCK_PROPERTIES.length === 0 && (
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
