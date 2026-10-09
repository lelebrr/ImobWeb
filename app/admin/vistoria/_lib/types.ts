// Tipos e valores padrão do módulo de vistoria
import type { PhotoInspection } from '@/lib/vistoria/shared';
export type { PhotoInspection };
export interface PhotoAnnotation { x: number; y: number; label: string; }
export type ChecklistState = 'ok' | 'regular' | 'ruim' | 'na';
export type TipoVistoria = 'ENTRADA' | 'SAIDA' | 'PERIODICA';
export interface Signatures { locadora?: string; locatario?: string; vistoriadora?: string; }
export interface PhotoData { id?: string; dataUrl: string; name: string; annotations: PhotoAnnotation[];
  /** objetos e defeitos detectados automaticamente pela IA nesta foto */
  inspection?: PhotoInspection; }
export interface RoomData { id: string; name: string; photos: PhotoData[]; items: string[]; furniture: string[]; damages: string[]; analyzing: boolean; analyzed: boolean;
  /** estado de conservação por elemento (Paredes, Piso, ...) */
  checklist?: Record<string, ChecklistState>;
  /** observações livres do cômodo */
  observations?: string;
  /** problemas marcados para fotografar neste cômodo */
  photoProblems?: string[];
  /** orientações geradas pela IA ao analisar as fotos */
  /** sugestões da IA (itens e avarias) aguardando revisão */
  proposals?: Proposal[];
  aiAdvice?: { missingShots: string[]; photoNotes: { photo: number; issue: string; advice: string }[] };
}
export interface Medidor { numero: string; leitura: string }
export type MedidorKey = 'agua' | 'luz' | 'gas';
export type Medidores = Record<MedidorKey, Medidor>;
export interface ChaveItem { id: string; descricao: string; quantidade: number }
export interface Reparo { id: string; comodo: string; descricao: string; min: number; max: number; nota?: string; origem: 'ia' | 'manual' }
/** Sugestão da IA aguardando aceitação (e edição) da vistoriadora. Nada entra no laudo sem aceite. */
export interface Proposal {
  id: string;
  kind: 'furniture' | 'damage';
  /** texto que será gravado; editável antes de aceitar */
  text: string;
  confidence: number;
  source: 'inspecao' | 'analise';
  photoId?: string;
  /** posição (%) para marcar a avaria na foto, se aceita */
  mark?: { x: number; y: number; label: string };
}
export interface PropertyInfo {
  condominio: string; endereco: string; numero: string; conjApto: string; apto: string; cep: string;
  bairro: string; cidade: string; estado: string; tipoImovel: string; finalidade: string;
  metragem: string; mobiliado: string; andar: string;
  locadora: string; locadoraCpf: string; locadoraTelefone: string;
  locatario: string; locatarioCpf: string; locatarioTelefone: string;
  vistoriadora: string; dataFotografia: string;
  dataLaudo: string; solicitante: string; consideracoes: string; totalComodos: number;
  tipoVistoria?: TipoVistoria;
  emailContestacao?: string;
  /** leituras dos medidores no momento desta vistoria */
  medidores?: Medidores;
  /** leituras registradas na vistoria de entrada (preenchido ao criar a saída) */
  medidoresEntrada?: Medidores;
  /** chaves, controles e acessos entregues */
  chaves?: ChaveItem[];
  /** estimativa de custo de reparos (referencial) */
  reparos?: Reparo[];
}
export interface SavedLaudo {
  id: string; name: string; condominio: string; savedAt: string;
  createdAt?: string; favorite?: boolean; isExample?: boolean;
  /** miniatura (dataURL ~240px) para listagens sem carregar as fotos */
  thumb?: string;
  signatures?: Signatures;
  /** vistoria de saída aponta para a de entrada */
  linkedId?: string;
  propertyInfo: PropertyInfo; rooms: RoomData[];
}
export interface VistoriaSettings {
  defaultVistoriadora: string; defaultSolicitante: string; defaultCidade: string;
  defaultEstado: string; defaultTipoImovel: string; defaultFinalidade: string;
  autoAnalyze: boolean; customProblems: string[];
  watermarkImage: string; watermarkText: string; watermarkEnabled: boolean;
  geminiApiKey: string;
  aiAnalysisEnabled: boolean;
  aiConsiderationsEnabled: boolean;
  deletedDefaultProblems: string[];
  /** nome exibido no rodapé do laudo */
  empresaNome: string;
  /** e-mail para contestação do laudo (impresso no PDF) */
  emailContestacao: string;
  /** a IA marca avarias diretamente nas fotos */
  aiAutoAnnotate: boolean;
  /** a IA preenche o checklist de conservação ao analisar */
  aiAutoChecklist: boolean;
  /** a IA detecta objetos e defeitos em cada foto (câmera e galeria) */
  aiAutoInspect: boolean;
}

export const defaultPropertyInfo: PropertyInfo = {
  condominio: '', endereco: '', numero: '', conjApto: '', apto: '', cep: '', bairro: '',
  cidade: '', estado: '', tipoImovel: '', finalidade: 'RESIDENCIAL',
  metragem: '', mobiliado: 'NÃO', andar: '',
  locadora: '', locadoraCpf: '', locadoraTelefone: '',
  locatario: '', locatarioCpf: '', locatarioTelefone: '',
  vistoriadora: '', dataFotografia: new Date().toLocaleDateString('pt-BR'),
  dataLaudo: new Date().toLocaleDateString('pt-BR'), solicitante: '', consideracoes: '', totalComodos: 0,
  tipoVistoria: 'ENTRADA', emailContestacao: '',
};

export const defaultSettings: VistoriaSettings = {
  defaultVistoriadora: '', defaultSolicitante: '', defaultCidade: 'São Paulo',
  defaultEstado: 'SP', defaultTipoImovel: 'APARTAMENTO', defaultFinalidade: 'RESIDENCIAL',
  autoAnalyze: true, customProblems: [],
  watermarkImage: '', watermarkText: 'imobWeb Vistoria', watermarkEnabled: false,
  geminiApiKey: '', aiAnalysisEnabled: true, aiConsiderationsEnabled: true,
  deletedDefaultProblems: [],
  empresaNome: '', emailContestacao: '', aiAutoAnnotate: true, aiAutoChecklist: true, aiAutoInspect: true,
};

