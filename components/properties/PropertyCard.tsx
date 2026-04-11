'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Bed, 
  Bath, 
  Expand, 
  MapPin, 
  Heart,
  TrendingUp,
  ShieldCheck,
  Star
} from 'lucide-react';
import { Property, PropertyStatus } from '../../types/property';
import { getPropertyType } from '../../lib/properties/property-types';
import { cn } from '../../lib/utils';

interface PropertyCardProps {
  property: Property;
  priority?: boolean;
}

/**
 * Premium Property Card Component
 * Designed for conversion and performance.
 */
export const PropertyCard: React.FC<PropertyCardProps> = ({ 
  property,
  priority = false 
}) => {
  const typeDef = getPropertyType(property.type);
  const mainImage = property.images.find(img => img.isMain) || property.images[0];

  const statusColors: Record<PropertyStatus, string> = {
    [PropertyStatus.FOR_SALE]: 'bg-emerald-500',
    [PropertyStatus.FOR_RENT]: 'bg-indigo-500',
    [PropertyStatus.SOLD]: 'bg-rose-500',
    [PropertyStatus.RENTED]: 'bg-slate-500',
    [PropertyStatus.RESERVED]: 'bg-amber-500',
    [PropertyStatus.OFF_MARKET]: 'bg-slate-700',
  };

  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: property.currency,
    maximumFractionDigits: 0,
  }).format(property.price);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      whileHover={{ y: -8 }}
      className="group relative flex flex-col overflow-hidden rounded-3xl bg-white border border-slate-100 shadow-sm transition-all hover:shadow-2xl"
    >
      {/* Media Section */}
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <Image
          src={mainImage?.url || '/property-placeholder.jpg'}
          alt={property.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          priority={priority}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {/* Overlays */}
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
          <div className="flex flex-col gap-2">
            <span className={cn(
              "rounded-full px-3 py-1 text-[10px] font-bold text-white shadow-lg backdrop-blur-md uppercase tracking-widest",
              statusColors[property.status]
            )}>
              {property.status.replace('_', ' ')}
            </span>
            {property.isExclusivelyListed && (
              <span className="flex items-center gap-1 rounded-full bg-blue-600 px-3 py-1 text-[10px] font-bold text-white shadow-lg">
                <ShieldCheck className="h-3 w-3" />
                EXCLUSIVO
              </span>
            )}
          </div>
          
          <button className="rounded-full bg-white/20 p-2 text-white backdrop-blur-md transition-all hover:bg-white/40 active:scale-90 border border-white/30">
            <Heart className="h-4 w-4" />
          </button>
        </div>

        {property.isFeatured && (
          <div className="absolute bottom-4 left-4">
            <div className="flex items-center gap-1 rounded-lg bg-yellow-400 px-2 py-1 text-[10px] font-bold text-slate-900 shadow-lg ring-1 ring-yellow-500/50">
              <Star className="h-3 w-3 fill-slate-900" />
              DESTAQUE
            </div>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      </div>

      {/* Content Section */}
      <div className="flex flex-col p-6">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">
            {typeDef?.label || property.category}
          </span>
          <div className="flex items-center gap-1 text-slate-400">
             <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
             <span className="text-[10px] font-medium">+12% Valorização</span>
          </div>
        </div>

        <Link href={`/properties/${property.slug}`}>
          <h3 className="mt-2 line-clamp-1 text-lg font-bold text-slate-900 transition-colors group-hover:text-indigo-600">
            {property.title}
          </h3>
        </Link>
        
        <div className="mt-1 flex items-center gap-1 text-slate-500">
          <MapPin className="h-4 w-4 text-slate-400" />
          <span className="text-sm line-clamp-1">{property.address.neighborhood}, {property.address.city}</span>
        </div>

        {/* Dynamic Specs based on type */}
        <div className="mt-6 grid grid-cols-3 gap-4 border-y border-slate-50 py-4">
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-1.5 text-slate-700">
              <Bed className="h-4 w-4 text-indigo-500" />
              <span className="text-sm font-bold">{property.bedrooms || 0}</span>
            </div>
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter">Quartos</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-1.5 text-slate-700">
              <Bath className="h-4 w-4 text-indigo-500" />
              <span className="text-sm font-bold">{property.bathrooms || 0}</span>
            </div>
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter">Banheiros</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-1.5 text-slate-700">
              <Expand className="h-4 w-4 text-indigo-500" />
              <span className="text-sm font-bold">{property.usableArea || property.totalArea}</span>
            </div>
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter">m² Área</span>
          </div>
        </div>

        {/* footer / Price */}
        <div className="mt-6 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Preço</span>
            <span className="text-xl font-black text-slate-900">{formattedPrice}</span>
          </div>
          <Link 
            href={`/properties/${property.slug}`}
            className="rounded-2xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white transition-all hover:bg-indigo-600 active:scale-95 shadow-lg shadow-slate-200"
          >
            Ver Detalhes
          </Link>
        </div>
      </div>
    </motion.div>
  );
};
