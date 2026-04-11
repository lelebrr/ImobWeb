# Arquitetura do Módulo de Imóveis e Mídia (imobWeb 2026)

Este documento descreve a arquitetura técnica, os princípios de performance e a integração de IA do módulo de propriedades.

## 1. Visão Geral
O módulo foi projetado para ser o motor principal do SaaS imobWeb, suportando alta escala, diversidade de tipos de imóveis e otimização extrema de mídia para atingir **100/100 no Core Web Vitals**.

## 2. Tipos de Imóveis (Extensibilidade)
A estrutura de dados em `types/property.ts` e a configuração em `lib/properties/property-types.ts` permitem:
- **Suporte a 50+ tipos**: Desde apartamentos residenciais até centros logísticos industriais.
- **Campos Dinâmicos**: Validação e sugestão de campos baseada no tipo (ex: docas para galpões, quartos para casas).
- **Categorização Semântica**: Agrupamento por Residencial, Comercial, Rural, Industrial, Temporada e Lançamentos.

## 3. Motor de Otimização de Imagem
Utiliza a biblioteca **Sharp** no lado do servidor para processamento de alto desempenho.
- **Formatos Modernos**: Conversão automática para WebP e AVIF com compressão inteligente.
- **Otimização On-the-fly**: Endpoint API `/api/images/optimize` para processamento em tempo real.
- **Progressive Loading**: Geração automática de placeholders em Base64 (blur effect) para LCP instantâneo.
- **Auto-Cropping**: Centralização inteligente de objetos para manter o foco do imóvel.

## 4. Integração de IA (AI-Driven Media)
O serviço `AIEnhancerService` atua como um wrapper para modelos de visão e processamento:
- **Qualidade Fotográfica**: Análise de nitidez e composição (AI Score).
- **Detecção de Cômodos**: Identificação automática de ambientes via Vision API.
- **Melhoria Automática (Upscale/Vibrant)**: Placeholder para integração com Leonardo.ai ou Replicate.
- **Gerador de Descrição**: Criação de textos persuasivos baseada em tags visuais detectadas.

## 5. Componentes Premium UI
Desenvolvidos com **React 19+**, **Framer Motion** e **Tailwind CSS v4**:
- **PropertyGallery**: Galeria ultra-fluida com modo de comparação IA e Lightbox imersivo.
- **PropertyCard**: Card otimizado com lazy-loading agressivo e micro-interações de destaque.

## 6. Performance & Cache
- **Streaming SSR**: Os dados do imóvel são entregues via Server Components.
- **Borda (Edge)**: Otimização de imagens preferencialmente processada na borda via CDN (Supabase Storage + Vercel Image Optimization).
- **Virtualização**: Listagens grandes utilizam virtualização de janelas para manter o DOM leve.
