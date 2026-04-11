import React from "react";
import { cn } from "@/text/imobweb/lib/responsive/tailwind-utils";
import { MapPin, BedDouble, Bath, Square, MoveRight } from "lucide-react";

export function PropertyCard({ className }: { className?: string }) {
  return (
    // Transformamos este card num componente monitorado por @container
    <div className={cn("@container w-full group cursor-pointer", className)}>
      
      {/* Quando o container atingir tamanho médio (@lg ou 32rem), a imagem fica de lado (flex-row) */}
      <div className="bg-card border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col @lg:flex-row h-full">
         
         {/* Container da Imagem: Aspect-ratio 4/3 e muda pra cobertura inteira na horizontal */}
         <div className="relative w-full @lg:w-[45%] shrink-0 aspect-[4/3] @lg:aspect-auto overflow-hidden bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
               src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
               alt="Exemplo Imovel" 
               className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            {/* Pills flutuantes responsivos */}
            <div className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded shadow-sm">
               REVENDA EXCLUSIVA
            </div>
         </div>

         {/* Informações detalhadas */}
         <div className="flex flex-col flex-1 p-4 @md:p-5 @lg:px-6">
            <h3 className="font-extrabold text-lg @md:text-xl leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">
               Residência Contemporânea com Piscina de Borda Infinita e Área Gourmet
            </h3>
            
            <p className="flex items-center text-muted-foreground text-sm mb-4">
               <MapPin className="w-4 h-4 mr-1 shrink-0" />
               <span className="truncate">Jardim Europa, São Paulo - SP</span>
            </p>

            {/* Atributos do Imóvel quebram perfeitamente sem vazar */}
            <div className="flex flex-wrap items-center gap-4 gap-y-2 text-sm text-muted-foreground mt-auto mb-5 border-t border-b py-3">
               <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded" title="Quartos">
                  <BedDouble className="w-4 h-4 text-foreground/70" /> <span className="font-medium text-foreground">4 Suítes</span>
               </div>
               <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded" title="Banheiros">
                  <Bath className="w-4 h-4 text-foreground/70" /> <span className="font-medium text-foreground">6 WCs</span>
               </div>
               <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded" title="Área Total">
                  <Square className="w-4 h-4 text-foreground/70" /> <span className="font-medium text-foreground">450 m²</span>
               </div>
            </div>

            {/* Preço e Call to Action Baseado em Tamanho do Container */}
            <div className="flex items-end justify-between gap-4 mt-auto">
               <div className="shrink-0">
                  <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mb-0.5">Venda</p>
                  <p className="text-xl @md:text-2xl font-black text-foreground tracking-tighter">
                     <span className="text-muted-foreground font-medium text-sm mr-1">R$</span>4.850.000
                  </p>
               </div>
               
               {/* Transição apenas da Seta na label ao hover */}
               <button className="flex items-center gap-1.5 text-primary text-sm font-semibold hover:underline">
                  Ver Fotos
                  <MoveRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}
