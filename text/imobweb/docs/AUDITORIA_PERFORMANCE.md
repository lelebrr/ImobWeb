# imobWeb - Auditoria de Performance e Code Splitting (2026)

Recomendações estratégicas para manter o Core Web Vitals em 100/100 à medida que o CRM escala.

## 1. Estratégia de Code Splitting

Para o dashboard imobiliário, recomendamos o uso agressivo de `next/dynamic` para componentes pesados.

### Componentes Críticos para Dynamic Loading:
- **Gráficos (Recharts)**: Devem ser carregados apenas no dashboard.
  ```tsx
  const AdvancedChart = dynamic(() => import('@/components/performance/marketing/AdvancedChart'), { 
    ssr: false,
    loading: () => <Skeleton className="h-[400px] w-full" />
  });
  ```
- **Mapas (Google Maps)**: Nunca carregar no bundle principal. Carregar apenas quando o usuário interagir com a localização do imóvel.
- **Editores Rich Text**: Para descrições de imóveis.

## 2. Otimização de Vendor Chunks

Adicionar ao `next.config.mjs` (já iniciado):
- Agrupar bibliotecas de BI em um chunk separado para não impactar o LCP da Landing Page.
- Manter `lucide-react` e `framer-motion` em chunks pré-otimizados pelo Next.js.

## 3. Image Optimization Scorecard

- **LCP (Largest Contentful Paint)**: Use `priority={true}` apenas na foto principal do primeiro imóvel visible na viewport.
- **Cumulative Layout Shift (CLS)**: Todas as imagens no imobWeb agora possuem containers com aspect-ratio fixo (via `ImageOptimized`), garantindo CLS = 0.

## 4. Sugestões de Melhoria Contínua
1. **PWA Assets**: Implementar geração automática de ícones em múltiplos tamanhos para o manifesto.
2. **Font Subsetting**: Usar apenas os glifos necessários da fonte (ex: Inter ou Roboto) via Google Fonts optimized.
3. **Speculative Prefetching": Implementar prefetch de rotas apenas quando o mouse estiver sobre o link por mais de 100ms.

---
*Relatório gerado em Abril de 2026.*
