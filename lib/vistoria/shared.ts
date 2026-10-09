// Constantes compartilhadas entre cliente e servidor (sem dependências de UI)

export const CHECKLIST_ITEMS = [
  'Paredes', 'Pintura', 'Teto', 'Piso', 'Rodapé', 'Portas', 'Janelas', 'Elétrica (tomadas/interruptores)',
  'Iluminação', 'Hidráulica (torneiras/registros)', 'Louças e metais', 'Armários / bancadas',
] as const;

export type ChecklistStateId = 'ok' | 'regular' | 'ruim' | 'na';
export const CHECKLIST_STATE_IDS: ChecklistStateId[] = ['ok', 'regular', 'ruim', 'na'];

export const SEVERITIES = ['leve', 'moderada', 'grave'] as const;

// ---- Inspeção inteligente (detecção de objetos e defeitos nas fotos) ----

export const DEFECT_TYPES = [
  'risco', 'trinca', 'quebrado', 'descascado', 'mancha', 'umidade', 'mofo', 'ferrugem',
  'amassado', 'desgaste', 'sujeira', 'falta_peca', 'folgado', 'queimado', 'vazamento', 'outro',
] as const;
export type DefectType = (typeof DEFECT_TYPES)[number];

export const DEFECT_LABEL: Record<DefectType, string> = {
  risco: 'Risco', trinca: 'Trinca/rachadura', quebrado: 'Quebrado', descascado: 'Descascado/solto', mancha: 'Mancha',
  umidade: 'Umidade/infiltração', mofo: 'Mofo', ferrugem: 'Ferrugem', amassado: 'Amassado', desgaste: 'Desgaste',
  sujeira: 'Sujeira', falta_peca: 'Peça faltando', folgado: 'Folgado/desalinhado', queimado: 'Queimado', vazamento: 'Vazamento', outro: 'Avaria',
};

export const OBJECT_CATEGORIES = ['movel', 'eletrodomestico', 'estrutura', 'instalacao', 'outro'] as const;
export type ObjectCategory = (typeof OBJECT_CATEGORIES)[number];

/** caixa em % da imagem (x,y = canto superior esquerdo) */
export interface DetectedBox { x: number; y: number; w: number; h: number }
export interface DetectedObject { name: string; category: ObjectCategory; condition: 'bom' | 'regular' | 'ruim'; confidence: number; box?: DetectedBox }
export interface DetectedDefect { type: DefectType; severity: 'leve' | 'moderada' | 'grave'; description: string; object?: string; confidence: number; box?: DetectedBox }
export interface PhotoInspection { objects: DetectedObject[]; defects: DetectedDefect[]; quality?: string; at: string }
