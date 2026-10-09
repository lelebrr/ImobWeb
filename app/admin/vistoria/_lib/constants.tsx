import { Building2, Edit3, ClipboardCheck, AlertTriangle, Camera, FileText } from 'lucide-react';

export const TIPO_IMOVEL_OPTIONS = ['APARTAMENTO', 'SALA', 'CASA', 'COMERCIAL', 'COBERTURA', 'LOFT'];
export const FINALIDADE_OPTIONS = ['RESIDENCIAL', 'COMERCIAL'];
export const MOBILIADO_OPTIONS = ['NÃO', 'SIM', 'PARCIALMENTE'];

export const ROOM_PHOTO_TIPS: Record<string, string[]> = {
  ENTRADA: ['Porta de entrada e fechadura', 'Interfone e campainha', 'Piso e rodapé', 'Parede e teto', 'Quadro de luz'],
  SALA: ['Parede geral (4 faces)', 'Piso e rodapé', 'Janelas e persianas', 'Teto e luminárias', 'Tomadas e interruptores', 'Ar condicionado', 'Porta de entrada'],
  'SALA DE ESTAR': ['Parede geral (4 faces)', 'Piso e rodapé', 'Janelas e persianas', 'Teto e luminárias', 'Tomadas e interruptores'],
  COZINHA: ['Bancada e pia', 'Armários (superior e inferior)', 'Torneira e registros', 'Piso e parede', 'Fogão/forno', 'Tomadas e interruptores', 'Teto'],
  'ÁREA DE SERVIÇO': ['Pia e torneira', 'Registro de água', 'Piso e parede', 'Linha de roupas', 'Tomadas para máquinas'],
  BANHEIRO: ['Vaso sanitário e caixa acoplada', 'Pia e espelho', 'Torneira e registros', 'Chuveiro/ducha', 'Piso e parede', 'Louças e metais', 'Ventilação'],
  'BANHEIRO SOCIAL': ['Vaso sanitário e caixa acoplada', 'Pia e espelho', 'Torneira e registros', 'Chuveiro/ducha', 'Piso e parede'],
  QUARTO: ['Parede geral (4 faces)', 'Piso e rodapé', 'Janelas e persianas', 'Teto e luminárias', 'Tomadas e interruptores', 'Armários'],
  SUÍTE: ['Parede geral (4 faces)', 'Piso e rodapé', 'Janelas e persianas', 'Teto e luminárias', 'Tomadas e interruptores', 'Armários'],
  'BANHEIRO SUÍTE': ['Vaso sanitário', 'Pia e espelho', 'Torneira e registros', 'Chuveiro/ducha', 'Piso e parede'],
  VARANDA: ['Piso e paredes', 'Grade/vidraça', 'Teto', 'Luminária', 'Porta de acesso'],
  ESCRITÓRIO: ['Parede geral', 'Piso e rodapé', 'Janelas', 'Teto e luminárias', 'Tomadas e interruptores'],
  GARAGEM: ['Piso (concreto/lajota)', 'Parede e teto', 'Portão', 'Iluminação', 'Vaga demarcada'],
};

export const DEFAULT_PHOTO_TIPS = ['Parede geral (4 faces)', 'Piso e rodapé', 'Janelas', 'Teto e luminárias', 'Tomadas e interruptores', 'Portas'];

export const COMMON_PROBLEMS = [
  // Paredes e Teto
  'Rachadura na parede', 'Mancha de umidade na parede', 'Pintura descascando', 'Furo na parede',
  'Teto descascando', 'Infiltração no teto', 'Mofo na parede', 'Vazamento de água na parede',
  'Parede com bolhas', 'Reboco soltando', 'Teto com manchas',
  // Piso
  'Desgaste no piso', 'Piso quebrado', 'Rachadura no piso', 'Azulejo solto', 'Rejunte deteriorado',
  'Piso com manchas', 'Desnível no piso', 'Ladrilho trincado',
  // Hidráulica
  'Vazamento na torneira', 'Vazamento no registro', 'Vazamento no vaso sanitário',
  'Pressão de água baixa', 'Louça quebrada', 'Torneira com vazamento',
  'Caixa d\'água com vazamento', 'Tubo exposto', 'Registro travado',
  // Elétrica
  'Tomada com defeito', 'Interruptor com defeito', 'Fiação aparente',
  'Quadro de luz com defeito', 'Disjuntor desarmando', 'Luz piscando',
  'Falta de tomadas', 'Fio desencapado',
  // Portas e Janelas
  'Porta com desajuste', 'Fechadura com defeito', 'Janela emperrando',
  'Vidro rachado', 'Persiana quebrada', 'Mosqueiro rasgado',
  'Porta rangendo', 'Batente danificado', 'Ferragens soltas',
  // Outros
  'Barulho excessivo', 'Vazamento na varanda', 'Grade com ferrugem',
  'Luminária com defeito', 'Ar condicionado com vazamento', 'Encanamento exposto',
  'Proteção contra quedas danificada', 'Detector de fumaça com defeito',
];

export const LAUDO_TEMPLATES = [
  {
    id: 'apartamento-residencial',
    name: 'Apartamento',
    icon: '🏢',
    tipoImovel: 'APARTAMENTO',
    finalidade: 'RESIDENCIAL',
    rooms: ['ENTRADA', 'SALA', 'COZINHA', 'ÁREA DE SERVIÇO', 'BANHEIRO SOCIAL', 'QUARTO 1', 'QUARTO 2', 'SUÍTE', 'BANHEIRO SUÍTE', 'VARANDA'],
    description: '10 cômodos · Padrão apartamento 2 quartos',
  },
  {
    id: 'casa-residencial',
    name: 'Casa',
    icon: '🏠',
    tipoImovel: 'CASA',
    finalidade: 'RESIDENCIAL',
    rooms: ['ENTRADA', 'SALA DE ESTAR', 'SALA DE JANTAR', 'COZINHA', 'ÁREA DE SERVIÇO', 'BANHEIRO SOCIAL', 'QUARTO 1', 'QUARTO 2', 'QUARTO 3', 'SUÍTE', 'BANHEIRO SUÍTE', 'GARAGEM', 'QUINTAL'],
    description: '13 cômodos · Padrão casa 3 quartos',
  },
  {
    id: 'sala-comercial',
    name: 'Sala Comercial',
    icon: '🏬',
    tipoImovel: 'SALA',
    finalidade: 'COMERCIAL',
    rooms: ['ENTRADA', 'SALA PRINCIPAL', 'SALA DE REUNIÃO', 'BANHEIRO', 'COZINHETE', 'DEPÓSITO'],
    description: '6 cômodos · Padrão sala empresarial',
  },
  {
    id: 'cobertura',
    name: 'Cobertura',
    icon: '🏙️',
    tipoImovel: 'COBERTURA',
    finalidade: 'RESIDENCIAL',
    rooms: ['ENTRADA', 'SALA DE ESTAR', 'SALA DE JANTAR', 'COZINHA', 'ÁREA DE SERVIÇO', 'BANHEIRO SOCIAL', 'QUARTO 1', 'QUARTO 2', 'QUARTO 3', 'SUÍTE', 'BANHEIRO SUÍTE', 'SUÍTE MASTER', 'BANHEIRO MASTER', 'VARANDA GOURMET', 'TERRAÇO', 'CHURRASQUEIRA'],
    description: '16 cômodos · Padrão cobertura alto padrão',
  },
  {
    id: 'studio',
    name: 'Studio / Flat',
    icon: '🛏️',
    tipoImovel: 'APARTAMENTO',
    finalidade: 'RESIDENCIAL',
    rooms: ['SALA/QUARTO', 'COZINHA AMERICANA', 'BANHEIRO'],
    description: '3 cômodos · Padrão compacto',
  },
  {
    id: 'personalizado',
    name: 'Personalizado',
    icon: '✏️',
    tipoImovel: '',
    finalidade: '',
    rooms: [],
    description: 'Defina seus próprios cômodos',
  },
];

export function getRoomPhotoTips(roomName: string): string[] {
  const upper = roomName.toUpperCase().trim();
  if (ROOM_PHOTO_TIPS[upper]) return ROOM_PHOTO_TIPS[upper];
  for (const [key, tips] of Object.entries(ROOM_PHOTO_TIPS)) {
    if (upper.includes(key) || key.includes(upper)) return tips;
  }
  return DEFAULT_PHOTO_TIPS;
}

export const CONDOMINIO_TYPES = ['APARTAMENTO', 'COBERTURA', 'LOFT'];
export const WIZARD_STEPS = [
  { id: 'property', title: 'Dados do Imóvel', icon: Building2 },
  { id: 'parties', title: 'Partes', icon: Edit3 },
  { id: 'rooms', title: 'Cômodos', icon: ClipboardCheck },
  { id: 'problems', title: 'Problemas', icon: AlertTriangle },
  { id: 'photos', title: 'Fotos', icon: Camera },
  { id: 'review', title: 'Finalizar', icon: FileText },
];

export const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

// Checklist de conservação por cômodo
export { CHECKLIST_ITEMS } from '@/lib/vistoria/shared';
export const CHECKLIST_STATES: { id: 'ok' | 'regular' | 'ruim' | 'na'; label: string; short: string; cls: string }[] = [
  { id: 'ok', label: 'Bom', short: 'OK', cls: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  { id: 'regular', label: 'Regular', short: 'REG', cls: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  { id: 'ruim', label: 'Ruim', short: 'RUIM', cls: 'bg-red-500/20 text-red-300 border-red-500/40' },
  { id: 'na', label: 'N/A', short: 'N/A', cls: 'bg-slate-500/20 text-slate-300 border-slate-500/40' },
];
export const TIPO_VISTORIA_OPTIONS = [
  { id: 'ENTRADA', label: 'Entrada' }, { id: 'SAIDA', label: 'Saída' }, { id: 'PERIODICA', label: 'Periódica' },
] as const;
