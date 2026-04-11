import React from 'react';
import { PresentationWrapper } from '../../components/presentation/PresentationWrapper';
import { PropertyFilters } from '../../components/properties/PropertyFilters';
import { Property } from '../../types/property';

// Mock data generator for testing the Listing
const MOCK_PROPERTIES: Property[] = [
  {
    id: '1',
    slug: 'apartamento-luxo-itaim',
    ownerId: 'owner1',
    organizationId: 'org1',
    title: 'Apartamento de Altíssimo Padrão no Itaim Bibi',
    description: 'Um ícone de sofisticação com vista 360 do skyline paulistano.',
    status: 'ACTIVE',
    typeId: 'apartment',
    category: 'RESIDENTIAL',
    usage: 'FOR_SALE',
    price: { amount: 8500000, currency: 'BRL', isNegotiable: false },
    address: { 
      street: 'Rua Amauri', 
      neighborhood: 'Itaim Bibi', 
      city: 'São Paulo', 
      state: 'SP', 
      zipCode: '04548-000' 
    },
    media: [
      { 
        id: 'm1', 
        url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1000', 
        category: 'INTERIOR', 
        order: 0, 
        alt: 'Sala de estar luxuosa',
        aiMetadata: { qualityScore: 0.98, detectedType: 'Living Room', description: 'Modern living room', labels: ['luxury', 'design'], isEnhanced: true }
      }
    ],
    metrics: { totalArea: 350, bedrooms: 4, bathrooms: 5, parkingSpaces: 4 },
    features: ['pool', 'gym'],
    seo: { title: 'Apto Luxo Itaim', description: 'Saiba mais...', keywords: ['luxo', 'itaim'] },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Add more mock items as needed...
];

/**
 * PROPERTY LISTING PAGE - IMOBWEB 2026
 * The visitor-facing property exploration page.
 */
export default function PropertyListingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* Hero Header */}
      <div className="bg-slate-900/50 border-b border-slate-800 py-12 px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-black text-white italic tracking-tighter">Explorar Imóveis</h1>
          <p className="text-slate-500 mt-2 text-lg">Descubra as joias do mercado imobiliário curadas pelo imobWeb.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Filters (Placeholder) */}
          <aside className="w-full lg:w-72 shrink-0">
            <div className="sticky top-24 bg-slate-900/40 p-6 rounded-[2rem] border border-slate-800">
              <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                Filtros Avançados
              </h2>
              {/* Filter components would go here */}
              <div className="space-y-6">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Preço Máximo</p>
                  <div className="h-1 bg-slate-800 rounded-full">
                    <div className="w-1/2 h-full bg-indigo-500 rounded-full relative">
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg cursor-pointer" />
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Dormitórios</p>
                  <div className="flex gap-2">
                    {[1, 2, 3, '4+'].map(n => (
                      <button key={n} className="flex-1 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm font-bold hover:border-indigo-500 transition-all">
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <button className="w-full mt-8 bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-500/20 transition-all">
                Aplicar Filtros
              </button>
            </div>
          </aside>

          {/* Main Listings Area */}
          <div className="flex-1">
             <PresentationWrapper properties={MOCK_PROPERTIES} />
          </div>
        </div>
      </div>
    </div>
  );
}
