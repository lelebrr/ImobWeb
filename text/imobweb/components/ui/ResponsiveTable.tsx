import React from "react";
import { cn } from "@/text/imobweb/lib/responsive/tailwind-utils";

interface Column {
  key: string;
  header: string;
  render?: (row: any) => React.ReactNode;
}

interface ResponsiveTableProps {
  columns: Column[];
  data: any[];
  className?: string;
}

export function ResponsiveTable({ columns, data, className }: ResponsiveTableProps) {
  return (
    <div className={cn("w-full overflow-hidden rounded-2xl border bg-card shadow-sm transition-all", className)}>
      
      {/* A MÁGICA RESPONSIVA: 
          1. Desktop/Tablet: Exibe uma Tabela clássica <table /> com colunas alinhadas.
          2. Mobile (< 768px): A tabela some, surge uma lista de cards verticais.
      */}

      {/* Visualização DESKTOP (Tabela Padrão CSS) */}
      <div className="hidden md:block overflow-x-auto scrollbar-hide">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/40 text-muted-foreground uppercase text-[11px] font-bold tracking-wider">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="px-6 py-4">{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y border-t">
            {data.map((row, i) => (
              <tr key={i} className="hover:bg-muted/20 transition-colors group">
                {columns.map((col) => (
                  <td key={col.key} className="px-6 py-4 whitespace-nowrap text-foreground group-hover:text-primary transition-colors">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-6 py-8 text-center text-muted-foreground">
                  Nenhum registro encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Visualização MOBILE (Listagem de Cards) */}
      <div className="block md:hidden divide-y">
        {data.length === 0 && (
           <div className="p-6 text-center text-muted-foreground text-sm">
             Nenhum registro encontrado.
           </div>
        )}
        
        {data.map((row, i) => (
          <div key={i} className="flex flex-col gap-3 p-5 hover:bg-muted/10 transition-colors">
            {columns.map((col) => (
               <div key={col.key} className="flex flex-col gap-0.5">
                 <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{col.header}</span>
                 <span className="text-sm font-medium text-foreground">{col.render ? col.render(row) : row[col.key]}</span>
               </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
