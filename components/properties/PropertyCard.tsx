'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Bed, 
  Bath, 
  Maximize, 
  MapPin, 
  Heart, 
  Share2, 
  Sparkles,
  Zap
} from 'lucide-react';
import { Property } from '../../types/property';
import { getPropertyType } from '../../lib/properties/property-types';
import { cn } from '../../lib/utils';

interface PropertyCardProps {
  property: Property;
  viewMode?: 'grid' | 'list';
}

/**
 * PREMIUM PROPERTY CARD - IMOBWEB 2026
 * Features:
 * - Dynamic data display based on property type
 * - Hover interactions & smooth transitions
 * - Core Web Vitals optimized (next/image)
 * - AI Insight integration
 */
export const PropertyCard: React.FC<PropertyCardProps> = ({ property, viewMode = 'grid' }) => {
  const typeConfig = getPropertyType(property.typeId);
  const mainImage = property.media.find(m => m.order === 0) || property.media[0];

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: property.price.currency,
    }).format(amount);
  };

  return (
    <motion.div
      whileHover={{ y: -8 }}
      className={cn(
        "group bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10",
        viewMode === 'list' ? "flex flex-col md:flex-row h-auto md:h-[280px]" : "flex flex-col h-[480px]"
      )}
    >
      {/* --- IMAGE SECTION --- */}
      <div className={cn(
        "relative overflow-hidden",
        viewMode === 'list' ? "w-full md:w-[320px] h-[200px] md:h-full" : "w-full h-[240px]"
      )}>
        <Image
          src={mainImage?.url || '/placeholders/property.jpg'}
          alt={property.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          <span className="bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
            {property.usage === 'FOR_SALE' ? 'Venda' : property.usage === 'FOR_RENT' ? 'Locação' : 'Venda + Locação'}
          </span>
          {property.status === 'RESERVED' && (
            <span className="bg-amber-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
              Reservado
            </span>
          )}
        </div>

        {/* Favorite Button */}
        <button className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-rose-500 hover:text-white transition-all">
          <Heart size={20} className="group-hover:fill-current" />
        </button>

        {/* AI Insight Badge */}
        {mainImage?.aiMetadata?.qualityScore && mainImage.aiMetadata.qualityScore > 0.9 && (
          <div className="absolute bottom-4 left-4 z-10 flex items-center gap-1.5 bg-emerald-500/90 backdrop-blur-md text-white text-[9px] font-black px-2 py-1 rounded-md shadow-lg italic">
            <Zap className="w-2.5 h-2.5 fill-current" />
            TOP RATED PHOTO
          </div>
        )}
      </div>

      {/* --- DETAILS SECTION --- */}
      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        {/* Type & Address */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
            {typeConfig?.label || property.category}
          </span>
          <span className="text-slate-500 text-xs flex items-center gap-1">
            <MapPin size={12} />
            {property.address.neighborhood}
          </span>
        </div>

        {/* Title */}
        <Link href={`/properties/${property.slug}`} className="block">
          <h3 className="text-lg font-bold text-white leading-tight mb-2 line-clamp-2 hover:text-indigo-400 transition-colors">
            {property.title}
          </h3>
        </Link>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-4 py-4 border-y border-slate-800 my-2">
          {typeConfig?.showFields.rooms && (
            <div className="flex flex-col gap-1 items-center">
              <span className="text-slate-500 flex items-center gap-1.5 text-xs font-medium">
                <Bed size={14} /> Dorms
              </span>
              <span className="text-white font-bold text-sm">{property.metrics.bedrooms || 0}</span>
            </div>
          )}
          <div className="flex flex-col gap-1 items-center">
            <span className="text-slate-500 flex items-center gap-1.5 text-xs font-medium">
              <Bath size={14} /> Banheiros
            </span>
            <span className="text-white font-bold text-sm">{property.metrics.bathrooms || 0}</span>
          </div>
          <div className="flex flex-col gap-1 items-center">
            <span className="text-slate-500 flex items-center gap-1.5 text-xs font-medium">
              <Maximize size={14} /> Área
            </span>
            <span className="text-white font-bold text-sm">{property.metrics.totalArea}m²</span>
          </div>
        </div>

        {/* Price Section */}
        <div className="mt-auto pt-4 flex items-center justify-between">
          <div className="flex flex-col">
            <p className="text-xs text-slate-500 font-medium">Valor do Imóvel</p>
            <h4 className="text-xl font-black text-white tracking-tight">
              {formatPrice(property.price.amount)}
              {property.price.period && <span className="text-xs text-slate-500 font-normal ml-1">/{property.price.period === 'MONTHLY' ? 'mês' : 'dia'}</span>}
            </h4>
          </div>
          
          <Link 
            href={`/properties/${property.slug}`}
            className="w-10 h-10 bg-slate-800 rounded-2xl flex items-center justify-center text-white hover:bg-indigo-600 transition-all shadow-xl"
          >
            <Share2 size={18} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};
