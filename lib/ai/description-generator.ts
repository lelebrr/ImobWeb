import { z } from 'zod';

export const DescriptionInputSchema = z.object({
  title: z.string().optional(),
  location: z.string().min(2).max(200),
  area: z.number().positive().max(10000),
  propertyType: z.enum(['apartamento', 'casa', 'terreno', 'comercial', 'salas', 'galpão', 'loja', 'outro']).optional(),
  beds: z.number().int().min(0).max(20).optional(),
  baths: z.number().int().min(0).max(10).optional(),
  parking: z.number().int().min(0).max(5).optional(),
  floor: z.number().int().optional(),
  totalFloors: z.number().int().optional(),
  age: z.number().int().min(0).max(200).optional(),
  features: z.array(z.string()).optional(),
  highlight: z.string().optional(),
  targetAudience: z.enum(['família', 'jovem', 'idoso', 'investidor', 'corporativo', 'todos']).optional(),
  tone: z.enum(['formal', 'informal', 'persuasivo', 'técnico', 'luxo']).optional(),
});

export type DescriptionInput = z.infer<typeof DescriptionInputSchema>;

export interface GeneratedDescription {
  short: string;
  medium: string;
  full: string;
  tags: string[];
  highlights: string[];
 seoKeywords: string[];
}

const PROPERTY_TYPES: Record<string, { singular: string; plural: string }> = {
  apartamento: { singular: 'apartamento', plural: 'apartamentos' },
  casa: { singular: 'casa', plural: 'casas' },
  terreno: { singular: 'terreno', plural: 'terrenos' },
  comercial: { singular: 'imóvel comercial', plural: 'imóveis comerciais' },
  salas: { singular: 'sala comercial', plural: 'salas comerciais' },
  galpão: { singular: 'galpão', plural: 'galpões' },
  loja: { singular: 'loja', plural: 'lojas' },
  outro: { singular: 'imóvel', plural: 'imóveis' },
};

const FEATURE_DESCRIPTIONS: Record<string, string> = {
  'piscina': 'piscina climatizada',
  'churrasqueira': 'churrasqueira integrada',
  'academia': 'academia completa',
  'portaria-24h': 'portaria 24h',
  'segurança': 'sistema de segurança',
  'varanda': 'varanda gourmet',
  'lavanderia': 'lavanderia exclusiva',
  'ar-condicionado': 'ar-condicionado central',
  'mobiliado': 'mobiliado e equipado',
  'jardim': 'jardim decorado',
  'pets': 'pet-friendly',
  'vista-mar': 'vista para o mar',
  'panorâmica': 'vista panorâmica',
  'renovado': 'renovado recentemente',
  'novo': 'imersão nova',
  'elevador': 'elevador',
  'sacada': 'sacada com churrasqueira',
  'home-office': 'espaço home-office',
  'smart-home': 'automação residencial',
};

export function generateDescription(input: DescriptionInput): GeneratedDescription {
  const propertyType = input.propertyType || 'apartamento';
  const typeInfo = PROPERTY_TYPES[propertyType] || PROPERTY_TYPES.outro;
  
  const short = generateShortDescription(input, typeInfo);
  const medium = generateMediumDescription(input, typeInfo);
  const full = generateFullDescription(input, typeInfo);
  
  const tags = generateTags(input, typeInfo);
  const highlights = generateHighlights(input, typeInfo);
  const seoKeywords = generateSeoKeywords(input, typeInfo);

  return {
    short,
    medium,
    full,
    tags,
    highlights,
    seoKeywords,
  };
}

function generateShortDescription(input: DescriptionInput, typeInfo: { singular: string; plural: string }): string {
  const parts: string[] = [];
  
  if (input.beds) {
    parts.push(`${input.beds} ${input.beds === 1 ? 'quarto' : 'quartos'}`);
  }
  
  if (input.baths) {
    parts.push(`${input.beds ? 'c/ ' : ''}${input.baths} ${input.baths === 1 ? 'banheiro' : 'banheiros'}`);
  }
  
  parts.push(`${input.area}m²`);
  
  if (input.parking) {
    parts.push(`${input.parking} ${input.parking === 1 ? 'vaga' : 'vagas'}`);
  }
  
  parts.push(`em ${input.location}`);
  
  return `${typeInfo.singular} ${parts.join(', ')}`;
}

function generateMediumDescription(input: DescriptionInput, typeInfo: { singular: string; plural: string }): string {
  const lines: string[] = [];
  
  lines.push(`✨ ${typeInfo.singular.charAt(0).toUpperCase() + typeInfo.singular.slice(1)} com ${input.area}m²`);
  
  if (input.beds) {
    lines.push(`🛏️ ${input.beds} ${input.beds === 1 ? 'quarto' : 'quartos'}`);
  }
  if (input.baths) {
    lines.push(`🚿 ${input.baths} ${input.baths === 1 ? 'banheiro' : 'banheiros'}`);
  }
  if (input.parking) {
    lines.push(`🚗 ${input.parking} ${input.parking === 1 ? 'vaga' : 'vagas'} de garagem`);
  }
  
  if (input.location) {
    lines.push(`📍 ${input.location}`);
  }
  
  if (input.highlight) {
    lines.push(`\n⭐ ${input.highlight}`);
  }
  
  return lines.join('\n');
}

function generateFullDescription(input: DescriptionInput, typeInfo: { singular: string; plural: string }): string {
  const paragraphs: string[] = [];
  
  const intro = generateIntro(input, typeInfo);
  paragraphs.push(intro);
  
  const features = generateFeaturesSection(input);
  if (features) paragraphs.push(features);
  
  const location = generateLocationSection(input);
  if (location) paragraphs.push(location);
  
  const cta = generateCta(input, typeInfo);
  paragraphs.push(cta);

  return paragraphs.join('\n\n');
}

function generateIntro(input: DescriptionInput, typeInfo: { singular: string; plural: string }): string {
  const tones: Record<string, string> = {
    formal: `Apresentamos este belíssimo ${typeInfo.singular} localizado em ${input.location}.`,
    informal: `Eita, você vai adorar este ${typeInfo.singular} em ${input.location}!`,
    persuasivo: `Não perca esta oportunidade! Este ${typeInfo.singular} de ${input.area}m² pode ser seu!`,
    técnico: `${typeInfo.singular.charAt(0).toUpperCase() + typeInfo.singular.slice(1)} com área de ${input.area}m², localizado em ${input.location}.`,
    luxo: `Descubra o extremo luxo neste exclusivo ${typeInfo.singular} em ${input.location}.`,
  };
  
  let intro = tones[input.tone || 'formal'];
  
  const specs: string[] = [];
  if (input.beds) specs.push(`${input.beds} ${input.beds === 1 ? 'quarto' : 'quartos'}`);
  if (input.baths) specs.push(`${input.baths} ${input.baths === 1 ? 'banheiro' : 'banheiros'}`);
  if (input.parking) specs.push(`${input.parking} ${input.parking === 1 ? 'vaga' : 'vagas'}`);
  if (input.area) specs.push(`${input.area}m² de área`);
  
  if (specs.length > 0) {
    intro += ` ${specs.join(', ')}.`;
  }
  
  if (input.highlight) {
    intro += ` Destaque: ${input.highlight}.`;
  }
  
  return intro;
}

function generateFeaturesSection(input: DescriptionInput): string | null {
  if (!input.features || input.features.length === 0) return null;
  
  const lines: string[] = ['✅ Características e Comodidades:'];
  
  input.features.forEach(feature => {
    const desc = FEATURE_DESCRIPTIONS[feature.toLowerCase()];
    if (desc) {
      lines.push(`• ${desc}`);
    } else {
      lines.push(`• ${feature}`);
    }
  });
  
  return lines.join('\n');
}

function generateLocationSection(input: DescriptionInput): string | null {
  const locationBenefits: string[] = [];
  
  const lower = input.location.toLowerCase();
  if (lower.includes('centro')) {
    locationBenefits.push('Excelente localização no centro');
    locationBenefits.push('Próximo a comércio, restaurantes e serviços');
    locationBenefits.push('Fácil acesso a transporte público');
  } else if (lower.includes('zona') || lower.includes('bairro')) {
    locationBenefits.push('Bairro tranquilo e arborizado');
    locationBenefits.push(' Próximo a escolas e áreas de lazer');
    locationBenefits.push('Boa infraestrutura local');
  } else {
    locationBenefits.push(`Localizado em ${input.location}`);
  }
  
  return `📍 Localização:\n${locationBenefits.join('\n')}`;
}

function generateCta(input: DescriptionInput, typeInfo: { singular: string; plural: string }): string {
  const ctas: Record<string, string> = {
    formal: `Agende uma visita e conheça este ${typeInfo.singular}.`,
    informal: 'Quer ver de perto? Agenda uma visita!',
    persuasivo: 'Não deixe escapar! Agende agora mesmo sua visita!',
    técnico: 'Para agendar uma visita ou obter mais informações, entre em contato.',
    luxo: 'Experience o luxo. Agende sua visita privativa.',
  };
  
  return ctas[input.tone || 'formal'];
}

function generateTags(input: DescriptionInput, typeInfo: { singular: string; plural: string }): string[] {
  const tags: string[] = [];
  
  tags.push(typeInfo.singular);
  tags.push(input.location);
  if (input.beds) tags.push(`${input.beds}-quartos`);
  if (input.area) tags.push(`${input.area}m2`);
  if (input.propertyType) tags.push(input.propertyType);
  if (input.features) tags.push(...input.features.slice(0, 3));
  
  return [...new Set(tags)].slice(0, 10);
}

function generateHighlights(input: DescriptionInput, typeInfo: { singular: string; plural: string }): string[] {
  const highlights: string[] = [];
  
  if (input.highlight) {
    highlights.push(input.highlight);
  }
  
  if (input.area > 100) highlights.push('Amplo espaço');
  if (input.beds && input.beds >= 3) highlights.push('Múltiplos quartos');
  if (input.parking && input.parking >= 2) highlights.push('Multiple vagas');
  if (input.age && input.age < 3) highlights.push('Imovel novo');
  if (input.features?.includes('piscina')) highlights.push('Piscina');
  if (input.features?.includes('vista-mar')) highlights.push('Vista para o mar');
  
  return highlights.slice(0, 5);
}

function generateSeoKeywords(input: DescriptionInput, typeInfo: { singular: string; plural: string }): string[] {
  const keywords: string[] = [];
  
  keywords.push(`${typeInfo.singular} ${input.location}`);
  keywords.push(`${typeInfo.singular} à venda`);
  keywords.push(`alugar ${typeInfo.singular} ${input.location}`);
  
  if (input.beds) {
    keywords.push(`${typeInfo.singular} ${input.beds} quartos`);
  }
  
  keywords.push(`imóvel ${input.location}`);
  keywords.push(`apartamento/casa ${input.location}`);
  
  return [...new Set(keywords)].slice(0, 10);
}

export function createDescriptionVariations(base: GeneratedDescription): string[] {
  return [
    base.short,
    base.medium,
    base.full,
    base.medium.replace(/✨/g, '🌟').replace(/🛏️/g, 'Quarto: ').replace(/🚿/g, 'Banheiro: ').replace(/🚗/g, 'Garagem: ').replace(/📍/g, 'Local: '),
  ];
}
