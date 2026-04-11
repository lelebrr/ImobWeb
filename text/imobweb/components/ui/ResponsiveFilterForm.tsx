import React from "react";
import { cn } from "@/text/imobweb/lib/responsive/tailwind-utils";
import { Search, MapPin, DollarSign, Home, SlidersHorizontal } from "lucide-react";

export function ResponsiveFilterForm({ className }: { className?: string }) {
  return (
    {/* 
      Container Queries magic! 
      Usamos '@container' aqui. Todos os elementos filhos vão olhar para o T-A-M-A-N-H-O DESTE COMPONENTE,
      não o tamanho do navegador. Assim o form pode viver solto ou numa sidebar e ele nao vai quebrar.
    */}
    <form className={cn("@container w-full bg-card rounded-2xl border shadow-sm p-4", className)}>
      
      {/* Layout Base: Coluna Unica. Assim que o painel atingir 672px (@2xl), vira 4 colunas */}
      <div className="grid grid-cols-1 @2xl:grid-cols-5 gap-3 items-end">
        
        {/* Campo: Localização */}
        <label className="flex flex-col gap-1.5 @2xl:col-span-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">Localização</span>
          <div className="relative group">
             <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
             <input type="text" placeholder="Cidade, Bairro, CEP..." className="w-full h-11 pl-9 pr-3 rounded-lg border border-input bg-background/50 hover:bg-background focus:bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm" />
          </div>
        </label>

        {/* Campo: Tipo */}
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">Tipo</span>
          <div className="relative group">
             <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
             <select className="w-full h-11 pl-9 pr-8 rounded-lg border border-input bg-background/50 hover:bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm cursor-pointer appearance-none">
                <option value="">Todos</option>
                <option value="apartment">Apartamentos</option>
                <option value="house">Casas</option>
                <option value="commercial">Comercial</option>
             </select>
          </div>
        </label>

        {/* Campo: Valor Maximo */}
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">Até (R$)</span>
          <div className="relative group">
             <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
             <input type="number" placeholder="Sem limite" className="w-full h-11 pl-9 pr-3 rounded-lg border border-input bg-background/50 hover:bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm" />
          </div>
        </label>
        
        {/* Botoes */}
        <div className="flex gap-2 h-11 mt-2 @2xl:mt-0">
          <button type="button" className="h-full aspect-square flex items-center justify-center rounded-lg border border-input bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors shrink-0" aria-label="Filtros avançados">
             <SlidersHorizontal className="w-4 h-4" />
          </button>
          
          <button type="submit" className="h-full bg-primary text-primary-foreground font-semibold rounded-lg w-full flex items-center justify-center gap-2 transition-all hover:bg-primary/90 active:scale-[0.98] shadow-sm hover:shadow">
             <Search className="w-4 h-4" />
             <span className="hidden @xs:inline">Localizar Imóveis</span>
             <span className="inline @xs:hidden">Buscar</span>
          </button>
        </div>
      </div>
    </form>
  );
}
