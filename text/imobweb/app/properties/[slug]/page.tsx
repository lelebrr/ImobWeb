import React from 'react';
import { PropertyGallery } from '@/components/image/PropertyGallery';
import { Property } from '@/types/property';
import { 
  Bed, 
  Bath, 
  Maximize, 
  Car, 
  ChevronRight, 
  MapPin, 
  Calendar,
  ShieldCheck,
  Zap,
  Share2,
  Printer
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock data for a single property
const PROPERTY: Property = {
  id: '1',
  slug: 'apartamento-luxo-itaim',
  ownerId: 'owner1',
  organizationId: 'org1',
  title: 'Apartamento de Altíssimo Padrão no Itaim Bibi',
  description: 'Localizado no quadrilátero mais desejado de São Paulo, este imóvel oferece acabamentos em mármore italiano, automação completa e uma vista de tirar o fôlego para o Parque do Ibirapuera.',
  status: 'ACTIVE',
  typeId: 'apartment',
  category: 'RESIDENTIAL',
  usage: 'FOR_SALE',
  price: { amount: 8500000, currency: 'BRL', isNegotiable: false, fees: { condo: 4500, tax: 1200 } },
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
      url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=2000', 
      category: 'INTERIOR', 
      order: 0, 
      alt: 'Living Room Large View',
      aiMetadata: { qualityScore: 0.98, detectedType: 'Living Room', description: 'Sunlit modern living room with Italian marble floor.', labels: ['high ceiling', 'modern'], isEnhanced: true }
    },
    { 
      id: 'm2', 
      url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=2000', 
      category: 'EXTERIOR', 
      order: 1, 
      alt: 'Building Facade',
      aiMetadata: { qualityScore: 0.95, detectedType: 'Building', description: 'Contemporary architectural design.', labels: ['facade', 'night view'], isEnhanced: false }
    },
    // Add more media items to test the gallery
  ],
  metrics: { totalArea: 350, builtArea: 350, bedrooms: 4, suites: 4, bathrooms: 5, parkingSpaces: 4 },
  features: ['automação', 'piscina aquecida', 'spa', 'academia privativa'],
  seo: { title: 'Apartamento Luxo Itaim Bibi | imobWeb', description: 'Visite agora...', keywords: [] },
  createdAt: '2026-03-10T11:00:00Z',
  updatedAt: '2026-04-10T21:00:00Z',
};

/**
 * PROPERTY DETAIL PAGE - IMOBWEB 2026
 * The ultimate property showcase.
 */
export default function PropertyDetailPage() {
  return (
    <div className="bg-slate-950 min-h-screen text-slate-200">
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-8 py-6">
        <nav className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
          <span className="hover:text-white cursor-pointer">Início</span>
          <ChevronRight size={12} />
          <span className="hover:text-white cursor-pointer">São Paulo</span>
          <ChevronRight size={12} />
          <span className="text-indigo-400">Itaim Bibi</span>
        </nav>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 space-y-8 pb-20">
        
        {/* Title & Actions */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-white/5 pb-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-indigo-600/10 text-indigo-400 text-[10px] font-black px-2 py-1 rounded border border-indigo-500/20 tracking-tighter uppercase">ID: {PROPERTY.id}</span>
              <span className="text-emerald-500 text-xs font-bold flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1 rounded-full ring-1 ring-emerald-500/20">
                 <Zap className="w-3.5 h-3.5 fill-current" />
                 ANÚNCIO VERIFICADO
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter leading-none">{PROPERTY.title}</h1>
            <p className="flex items-center gap-2 text-slate-500 mt-4 font-medium">
              <MapPin className="text-indigo-500" size={18} />
              {PROPERTY.address.street}, {PROPERTY.address.neighborhood} — {PROPERTY.address.city}, {PROPERTY.address.state}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
             <button className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-3 rounded-2xl hover:bg-slate-800 transition-all text-slate-300">
               <Share2 size={18} />
             </button>
             <button className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-3 rounded-2xl hover:bg-slate-800 transition-all text-slate-300">
               <Printer size={18} />
             </button>
             <button className="bg-indigo-600 hover:bg-indigo-500 text-white font-black px-8 py-4 rounded-3xl shadow-2xl shadow-indigo-500/20 transition-all flex items-center gap-3">
               Falar com Consultor
               <ChevronRight size={18} />
             </button>
          </div>
        </div>

        {/* --- GALLERY SECTION --- */}
        <PropertyGallery media={PROPERTY.media} title={PROPERTY.title} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Specs & Description */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Specs Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-8 bg-slate-900/40 rounded-[2.5rem] border border-slate-800">
               <SpecItem icon={Bed} label="Dormitórios" value={PROPERTY.metrics.bedrooms} />
               <SpecItem icon={Bath} label="Suítes" value={PROPERTY.metrics.suites} />
               <SpecItem icon={Car} label="Vagas" value={PROPERTY.metrics.parkingSpaces} />
               <SpecItem icon={Maximize} label="Área Total" value={`${PROPERTY.metrics.totalArea}m²`} />
            </div>

            {/* AI Insight Section */}
            <div className="bg-indigo-600/5 p-8 rounded-[2.5rem] border border-indigo-500/20 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                 <Zap className="w-20 h-20 text-indigo-500" />
               </div>
               <div className="flex items-center gap-3 mb-4">
                 <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                    <Zap size={18} />
                 </div>
                 <h3 className="text-xl font-bold text-white tracking-tight italic">Relatório de Inteligência imobWeb</h3>
               </div>
               <p className="text-slate-400 leading-relaxed max-w-2xl">
                 Este imóvel possui um **Core Affinity Score de 94%**. Com base nas tendências do Itaim Bibi, 
                 o valor do m² está 5% abaixo da média praticada na Amauri, representando uma excelente oportunidade 
                 de investimento. O acabamento de alto padrão detectado nas fotos garante uma valorização anual projetada de 12%.
               </p>
            </div>

            {/* Description */}
            <div className="space-y-6">
               <h3 className="text-2xl font-black text-white italic tracking-tight">Sobre o Imóvel</h3>
               <p className="text-lg text-slate-400 leading-relaxed whitespace-pre-line">
                 {PROPERTY.description}
               </p>
               <div className="flex flex-wrap gap-2 pt-4">
                 {PROPERTY.features.map(f => (
                   <span key={f} className="px-5 py-2.5 bg-slate-900 border border-slate-800 rounded-full text-sm font-bold text-slate-200">
                     # {f}
                   </span>
                 ))}
               </div>
            </div>
          </div>

          {/* Pricing Sidebar */}
          <aside className="space-y-6">
            <div className="p-8 bg-slate-900 border border-slate-800 rounded-[2.5rem] sticky top-24 shadow-2xl">
              <h4 className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-2">Valor de Venda</h4>
              <div className="flex items-baseline gap-2 mb-8">
                <span className="text-4xl font-black text-white italic tracking-tighter">
                  {PROPERTY.price.currency} {PROPERTY.price.amount.toLocaleString('pt-BR')}
                </span>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-800">
                 <div className="flex justify-between text-sm">
                   <span className="text-slate-500">Condomínio</span>
                   <span className="text-white font-bold">R$ {PROPERTY.price.fees?.condo?.toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between text-sm">
                   <span className="text-slate-500">IPTU (mensal)</span>
                   <span className="text-white font-bold">R$ {PROPERTY.price.fees?.tax?.toLocaleString()}</span>
                 </div>
              </div>

              <button className="w-full mt-10 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-5 rounded-2xl shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-3">
                Agendar Visita por WhatsApp
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function SpecItem({ icon: Icon, label, value }: { icon: any, label: string, value: any }) {
  return (
    <div className="flex flex-col items-center text-center gap-2">
      <div className="p-3 bg-slate-950 rounded-2xl text-indigo-500">
        <Icon size={20} />
      </div>
      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">{label}</p>
      <p className="text-lg font-bold text-white tracking-tight">{value}</p>
    </div>
  );
}
