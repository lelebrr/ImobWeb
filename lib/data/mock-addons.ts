export interface MarketplaceAddon {
  id: string;
  name: string;
  description: string;
  desc?: string;
  price: number;
  currency: string;
  category: 'IA' | 'INTEGRATION' | 'MARKETING' | 'ADMIN';
  icon: string;
  rating: number;
  installs: number;
  tags: string[];
  bannerUrl: string;
  badge?: string;
}

export const MOCK_ADDONS: MarketplaceAddon[] = [
  {
    id: 'addon-1',
    name: 'IA Co-pilot: Resumo de Conversas',
    description: 'Nossa IA analisa suas conversas no WhatsApp e gera resumos automáticos dos pontos mais importantes e próximos passos.',
    price: 49.90,
    currency: 'BRL',
    category: 'IA',
    icon: 'Brain',
    rating: 4.9,
    installs: 1250,
    tags: ['ia', 'whatsapp', 'produtividade'],
    bannerUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'addon-2',
    name: 'Sync 360: Portais Internacionais',
    description: 'Leve seus imóveis para o mundo. Sincronização automática com portais em Miami, Portugal e Dubai.',
    price: 199.00,
    currency: 'BRL',
    category: 'INTEGRATION',
    icon: 'Globe',
    rating: 4.8,
    installs: 450,
    tags: ['venda', 'internacional', 'sync'],
    bannerUrl: 'https://images.unsplash.com/photo-1520110120185-610666624bf1?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'addon-3',
    name: 'Tour Virtual Imersivo DIY',
    description: 'Transforme fotos 360º em tours virtuais imersivos diretamente da sua câmera, com narração em IA.',
    price: 89.90,
    currency: 'BRL',
    category: 'MARKETING',
    icon: 'View360',
    rating: 4.7,
    installs: 890,
    tags: ['marketing', 'visual', 'tecnologia'],
    bannerUrl: 'https://images.unsplash.com/photo-1626178732048-0d1667be5699?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'addon-4',
    name: 'Gerador de Contratos Jurídico AI',
    description: 'Crie contratos de compra/venda e locação 100% personalizados e validados juridicamente em segundos.',
    price: 129.00,
    currency: 'BRL',
    category: 'ADMIN',
    icon: 'Scale',
    rating: 4.9,
    installs: 2100,
    tags: ['juridico', 'segurança', 'contratos'],
    bannerUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'addon-5',
    name: 'Ads Inteligentes (Meta & Google)',
    description: 'Nossa IA cria e gerencia suas campanhas de anúncios focando apenas nos leads mais qualificados para cada imóvel.',
    price: 299.00,
    currency: 'BRL',
    category: 'MARKETING',
    icon: 'Megaphone',
    rating: 4.6,
    installs: 670,
    tags: ['ads', 'marketing', 'vendas'],
    bannerUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'addon-6',
    name: 'Assinatura Digital Integrada',
    description: 'Fluxo completo de assinatura digital (ICP-Brasil) integrado diretamente ao seu CRM Leads.',
    price: 39.90,
    currency: 'BRL',
    category: 'ADMIN',
    icon: 'FileCheck',
    rating: 4.9,
    installs: 1540,
    tags: ['assinatura', 'digital', 'fluxo'],
    bannerUrl: 'https://images.unsplash.com/photo-1554224155-167bb9662734?auto=format&fit=crop&q=80&w=800'
  }
];
