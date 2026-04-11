import React from "react";
import { cn } from "@/lib/responsive/tailwind-utils";
import { MapPin, BedDouble, Bath, Square, MoveRight, Heart } from "lucide-react";
import { Badge } from "@/components/design-system/badge";

interface PropertyCardProps {
  property: {
    id: string;
    title: string;
    description: string;
    price: {
      amount: number;
      currency: string;
    };
    address: {
      neighborhood: string;
      city: string;
    };
    metrics: {
      totalArea: number;
      bedrooms: number;
      bathrooms: number;
      parkingSpaces: number;
    };
    media: Array<{ url: string }>;
    status: 'ACTIVE' | 'SOLD' | 'RENTED';
    usage: 'FOR_SALE' | 'FOR_RENT';
    typeId: string;
  };
  className?: string;
}

export function PropertyCard({ property, className }: PropertyCardProps) {
  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'decimal',
    minimumFractionDigits: 0
  }).format(property.price.amount);

  return (
    <div className={cn("@container w-full group cursor-pointer", className)}>
      <div className="glass border rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col h-full bg-white/5">
         
         {/* Imagem com Overlay Gradiente */}
         <div className="relative w-full shrink-0 aspect-[16/10] overflow-hidden bg-muted">
            <img 
               src={property.media[0]?.url || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1000"} 
               alt={property.title} 
               className="object-cover w-full h-full transform group-hover:scale-110 transition-transform duration-1000 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Badges Premium */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              <div className="bg-primary/90 backdrop-blur-md text-white text-[10px] font-black px-2 py-1 rounded-full shadow-sm tracking-widest uppercase italic">
                 {property.typeId}
              </div>
            </div>

            <button className="absolute top-3 right-3 p-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-red-500 transition-colors">
              <Heart className="w-4 h-4" />
            </button>
         </div>

         {/* Conteúdo */}
         <div className="flex flex-col flex-1 p-5">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-2">
                 {property.title}
              </h3>
            </div>
            
            <p className="flex items-center text-muted-foreground text-xs mb-4">
               <MapPin className="w-3.5 h-3.5 mr-1.5 shrink-0 text-primary" />
               <span className="truncate">{property.address.neighborhood}, {property.address.city}</span>
            </p>

            {/* Atributos com design limpo */}
            <div className="flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground mt-auto mb-6 border-y border-border/50 py-3">
               <div className="flex items-center gap-1.5 bg-secondary/30 px-2 py-1 rounded-lg border border-border/50">
                  <BedDouble className="w-3 h-3" /> <span className="font-bold text-foreground">{property.metrics.bedrooms} Qts</span>
               </div>
               <div className="flex items-center gap-1.5 bg-secondary/30 px-2 py-1 rounded-lg border border-border/50">
                  <Bath className="w-3 h-3" /> <span className="font-bold text-foreground">{property.metrics.bathrooms} WCs</span>
               </div>
               <div className="flex items-center gap-1.5 bg-secondary/30 px-2 py-1 rounded-lg border border-border/50">
                  <Square className="w-3 h-3" /> <span className="font-bold text-foreground">{property.metrics.totalArea} m²</span>
               </div>
            </div>

            {/* Footer com Preço Gradient */}
            <div className="flex items-center justify-between gap-4">
               <div className="flex flex-col">
                  <span className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">
                    {property.usage === 'FOR_SALE' ? 'Venda' : 'Aluguel'}
                  </span>
                  <p className="text-xl font-black tracking-tighter">
                    <span className="text-sm font-medium mr-1 text-muted-foreground">{property.price.currency === 'BRL' ? 'R$' : '$'}</span>
                    <span className="text-gradient">{formattedPrice}</span>
                  </p>
               </div>
               
               <button className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-primary/20">
                  <MoveRight className="w-5 h-5" />
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}
