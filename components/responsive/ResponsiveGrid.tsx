import React from "react";
import { cn } from "@/lib/responsive/tailwind-utils";

interface ResponsiveGridProps extends React.HTMLAttributes<HTMLDivElement> {
  minItemWidth?: string; // e.g. "280px" ou "min(100%, 300px)"
  gap?: string; // Use os valores fluidos do Tailwind
}

/**
 * ResponsiveGrid é um Grid adaptável que não precisa de Media Queries para quebrar linhas.
 * Ele preenche o espaço e aloca Itens baseando-se no tamanho real do Elemento Pai.
 */
export function ResponsiveGrid({
  className,
  minItemWidth = "280px",
  gap = "var(--fluid-6)",
  children,
  style,
  ...props
}: ResponsiveGridProps) {
  return (
    <div
      className={cn("grid w-full items-stretch", className)}
      style={{
        // Cria Colunas automaticamente dependendo do tamanho disponível,
        // usando clamp interno para impedir overflow estourando a grid.
        gridTemplateColumns: `repeat(auto-fill, minmax(min(100%, ${minItemWidth}), 1fr))`,
        gap,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
