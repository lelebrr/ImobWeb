import { Property } from '../../types/property';

export const MOCK_PROPERTIES: Property[] = [
  {
    id: '1',
    slug: 'cobertura-luxo-itaim-bibi',
    ownerId: 'owner-1',
    organizationId: 'org-1',
    title: 'Cobertura Duplex de Luxo no Itaim Bibi',
    description: 'Espetacular cobertura duplex com vista 360º para o skyline de São Paulo. Arquitetura moderna, acabamentos em mármore italiano e automação total.',
    aiDescription: 'Propriedade de altíssimo padrão com valorização estimada em 15% nos próximos 2 anos. Ideal para investidores que buscam exclusividade e rentabilidade.',
    status: 'ACTIVE',
    typeId: 'penthouse',
    category: 'RESIDENTIAL',
    usage: 'FOR_SALE',
    price: {
      amount: 12500000,
      currency: 'BRL',
      isNegotiable: true,
      fees: {
        condo: 4500,
        tax: 2100
      }
    },
    address: {
      street: 'Rua Leopoldo Couto de Magalhães Júnior',
      neighborhood: 'Itaim Bibi',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '04542-000',
      coordinates: {
        lat: -23.5855,
        lng: -46.6815
      }
    },
    media: [
      {
        id: 'm1',
        url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200',
        category: 'EXTERIOR',
        order: 0,
        alt: 'Fachada da Cobertura',
        aiMetadata: {
          qualityScore: 0.98,
          detectedType: 'PENTHOUSE_EXTERIOR',
          description: 'Vista externa da cobertura com fachada de vidro',
          labels: ['luxo', 'vidro', 'skyline'],
          isEnhanced: true
        }
      }
    ],
    features: ['automation', 'pool', 'gym', 'elevator', 'security_24h'],
    metrics: {
      totalArea: 450,
      builtArea: 450,
      rooms: 8,
      bedrooms: 4,
      suites: 4,
      bathrooms: 6,
      parkingSpaces: 5,
      floor: 25,
      totalFloors: 25
    },
    seo: {
      title: 'Cobertura de Luxo Itaim Bibi | ImobWeb Elite',
      description: 'A melhor cobertura do Itaim Bibi disponível para venda.',
      keywords: ['itaim bibi', 'cobertura', 'luxo', 'sao paulo']
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    slug: 'casa-moderna-alphaville',
    ownerId: 'owner-2',
    organizationId: 'org-1',
    title: 'Residência Contemporânea em Alphaville',
    description: 'Projeto assinado por arquiteto renomado. Integração perfeita entre áreas internas e externas. Piscina com borda infinita e fire pit.',
    aiDescription: 'Uma obra-prima da arquitetura contemporânea. Localizada no condomínio mais seguro de Alphaville, com infraestrutura de lazer completa.',
    status: 'ACTIVE',
    typeId: 'condo_house',
    category: 'RESIDENTIAL',
    usage: 'BOTH',
    price: {
      amount: 8900000,
      currency: 'BRL',
      isNegotiable: false,
      fees: {
        condo: 2800,
        tax: 1500
      }
    },
    address: {
      street: 'Alameda Mamoré',
      neighborhood: 'Alphaville 1',
      city: 'Barueri',
      state: 'SP',
      zipCode: '06454-040'
    },
    media: [
      {
        id: 'm3',
        url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=1200',
        category: 'EXTERIOR',
        order: 0,
        alt: 'Fachada Moderna',
        aiMetadata: {
          qualityScore: 0.95,
          detectedType: 'HOUSE_EXTERIOR',
          description: 'Fachada minimalista com concreto aparente',
          labels: ['moderno', 'arquitetura', 'minimalismo'],
          isEnhanced: true
        }
      }
    ],
    features: ['pool', 'backyard', 'security_24h', 'playground'],
    metrics: {
      totalArea: 800,
      builtArea: 650,
      landArea: 800,
      bedrooms: 5,
      suites: 5,
      bathrooms: 7,
      parkingSpaces: 6
    },
    seo: {
      title: 'Casa Contemporânea Alphaville | ImobWeb Elite',
      description: 'Linda residência em Alphaville com piscina e 5 suítes.',
      keywords: ['alphaville', 'casa moderna', 'luxo', 'barueri']
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    slug: 'studio-design-vila-madalena',
    ownerId: 'owner-3',
    organizationId: 'org-2',
    title: 'Studio Design na Vila Madalena',
    description: 'Studio compacto e funcional no coração da Vila Madalena. Ideal para quem busca praticidade e estilo de vida urbano.',
    aiDescription: 'Excelente opção para investimento short-stay (AirBnb). Localização estratégica com alta demanda o ano todo.',
    status: 'ACTIVE',
    typeId: 'studio',
    category: 'RESIDENTIAL',
    usage: 'FOR_RENT',
    price: {
      amount: 4500,
      currency: 'BRL',
      period: 'MONTHLY',
      isNegotiable: true,
      fees: {
        condo: 650,
        tax: 120
      }
    },
    address: {
      street: 'Rua Harmonia',
      neighborhood: 'Vila Madalena',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '05435-000'
    },
    media: [
      {
        id: 'm4',
        url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=1200',
        category: 'INTERIOR',
        order: 0,
        alt: 'Interior do Studio',
        aiMetadata: {
          qualityScore: 0.92,
          detectedType: 'STUDIO_INTERIOR',
          description: 'Ambiente integrado e bem iluminado',
          labels: ['studio', 'design', 'urbano'],
          isEnhanced: true
        }
      }
    ],
    features: ['gym', 'concierge', 'furnished', 'balcony'],
    metrics: {
      totalArea: 35,
      bathrooms: 1,
      parkingSpaces: 1,
      floor: 12
    },
    seo: {
      title: 'Studio Vila Madalena | ImobWeb Elite',
      description: 'Aluguel de studio na Vila Madalena, São Paulo.',
      keywords: ['vila madalena', 'studio', 'aluguel', 'airbnb']
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '4',
    slug: 'loft-industrial-brooklin',
    ownerId: 'owner-4',
    organizationId: 'org-2',
    title: 'Loft Industrial New York Style',
    description: 'Pé direito duplo, tijolos aparentes e janelas amplas. Um pedaço de Nova York no Brooklin.',
    aiDescription: 'Estilo autêntico e moderno. Perfeito para o público jovem que aprecia design industrial e espaços abertos.',
    status: 'ACTIVE',
    typeId: 'loft',
    category: 'RESIDENTIAL',
    usage: 'FOR_SALE',
    price: {
      amount: 1850000,
      currency: 'BRL',
      isNegotiable: true,
      fees: {
        condo: 1200,
        tax: 450
      }
    },
    address: {
      street: 'Rua Nebraska',
      neighborhood: 'Brooklin',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '04560-011'
    },
    media: [
      {
        id: 'm5',
        url: 'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?auto=format&fit=crop&q=80&w=1200',
        category: 'INTERIOR',
        order: 0,
        alt: 'Loft Industrial',
        aiMetadata: {
          qualityScore: 0.94,
          detectedType: 'LOFT_INTERIOR',
          description: 'Sala com pé direito duplo e escada metálica',
          labels: ['loft', 'industrial', 'moderno'],
          isEnhanced: true
        }
      }
    ],
    features: ['double_height_ceiling', 'pool', 'gym'],
    metrics: {
      totalArea: 110,
      bedrooms: 1,
      suites: 1,
      bathrooms: 2,
      parkingSpaces: 2
    },
    seo: {
      title: 'Loft Industrial Brooklin | ImobWeb Elite',
      description: 'Venda de loft no Brooklin com design industrial.',
      keywords: ['brooklin', 'loft', 'venda', 'sao paulo']
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '5',
    slug: 'predio-comercial-avenida-paulista',
    ownerId: 'owner-5',
    organizationId: 'org-3',
    title: 'Laje Corporativa na Avenida Paulista',
    description: 'Prédio comercial icônico com infraestrutura completa para grandes empresas. Localização privilegiada.',
    aiDescription: 'Oportunidade única para sede corporativa. Valorização constante garantida pela localização.',
    status: 'ACTIVE',
    typeId: 'commercial_building',
    category: 'COMMERCIAL',
    usage: 'FOR_RENT',
    price: {
      amount: 150000,
      currency: 'BRL',
      period: 'MONTHLY',
      isNegotiable: false,
      fees: {
        condo: 15000,
        tax: 8000
      }
    },
    address: {
      street: 'Avenida Paulista',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01311-000'
    },
    media: [
      {
        id: 'm6',
        url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200',
        category: 'EXTERIOR',
        order: 0,
        alt: 'Prédio Comercial',
        aiMetadata: {
          qualityScore: 0.97,
          detectedType: 'COMMERCIAL_EXTERIOR',
          description: 'Fachada moderna de prédio comercial espelhado',
          labels: ['comercial', 'paulista', 'corporativo'],
          isEnhanced: true
        }
      }
    ],
    features: ['security_24h', 'backup_generator', 'receptionist'],
    metrics: {
      totalArea: 1200,
      bathrooms: 8,
      parkingSpaces: 20,
      floor: 15,
      totalFloors: 30
    },
    seo: {
      title: 'Laje Corporativa Avenida Paulista | ImobWeb Elite',
      description: 'Aluguel de laje comercial na Av. Paulista.',
      keywords: ['paulista', 'comercial', 'aluguel', 'corporativo']
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];
