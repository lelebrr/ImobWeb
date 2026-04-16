export type LeadStatus = 'NOVO' | 'INTERESSADO' | 'CONTATADO' | 'AGUARDANDO' | 'VISITA_AGENDADA' | 'PROPOSTA' | 'GANHO' | 'PERDIDO';

export interface Lead {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  status: LeadStatus;
  source: string;
  budget: number;
  propertyInterest: string;
  createdAt: string;
  lastInteraction?: string;
  notes?: string;
}

export const MOCK_LEADS: Lead[] = [
  {
    id: '1',
    name: 'Roberto Camargo',
    email: 'roberto@email.com',
    phone: '+55 11 99988-7766',
    status: 'NOVO',
    source: 'Zap Imóveis',
    budget: 4500000,
    propertyInterest: 'Cobertura Duplex Itaim',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
    notes: 'Lead interessado em vista panorâmica e automação.'
  },
  {
    id: '2',
    name: 'Juliana Mendes',
    email: 'ju.mendes@gmail.com',
    phone: '+55 11 98877-0011',
    status: 'INTERESSADO',
    source: 'WhatsApp IA',
    budget: 1200000,
    propertyInterest: 'Loft Vila Madalena',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    lastInteraction: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    notes: 'Já conversou com a IA sobre o valor do condomínio.'
  },
  {
    id: '3',
    name: 'Carlos Albuquerque',
    phone: '+55 11 98877-6655',
    status: 'VISITA_AGENDADA',
    source: 'Website Direto',
    budget: 8000000,
    propertyInterest: 'Mansão Alphaville',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    lastInteraction: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
    notes: 'Visita agendada para sábado às 10h.'
  },
  {
    id: '4',
    name: 'Pâmela Souza',
    email: 'pam.souza@outlook.com',
    status: 'AGUARDANDO',
    source: 'VivaReal',
    budget: 850000,
    propertyInterest: 'Apto 2 qts Pinheiros',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    notes: 'Aguardando retorno sobre financiamento bancário.'
  },
  {
    id: '5',
    name: 'Marcos Vinícius',
    email: 'm.vinicius@tech.com',
    phone: '+55 11 97766-5544',
    status: 'PROPOSTA',
    source: 'Indicação',
    budget: 2500000,
    propertyInterest: 'Conjunto Comercial Paulista',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
    lastInteraction: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    notes: 'Proposta enviada. Aguardando aceite do proprietário.'
  },
  {
    id: '6',
    name: 'Beatriz Costa',
    email: 'biacosta@uol.com.br',
    status: 'GANHO',
    source: 'Instagram Ads',
    budget: 1500000,
    propertyInterest: 'Casa de Vila Brooklin',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), // 1 week ago
    notes: 'Venda finalizada com sucesso.'
  }
];
