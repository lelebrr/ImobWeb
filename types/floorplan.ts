export type Length = number; // em metros
export type Angle = number; // em graus
export type RGB = string; // cor em hex ou rgba

export interface Point {
  x: number; // coordenada no canvas (pixel)
  y: number;
}

export interface BaseElement {
  id: string;
  type: string;
  locked?: boolean;
  visible?: boolean;
}

/* ---------- Paredes ---------- */
export interface Wall extends BaseElement {
  type: "wall";
  points: Point[]; // sequência de pontos que definem a polilinha da parede
  thickness: Length; // espessura em metros
  color?: RGB;
}

/* ---------- Cômodos ---------- */
export interface Room extends BaseElement {
  type: "room";
  name: string; // ex: "Quarto 1", "Sala de Estar", "Suíte Master"
  area?: Length; // calculada em m²
  perimeter?: Length; // calculada em metros
  floorColor?: RGB;
  wallIds: string[]; // IDs das paredes que delimitam o cômodo
}

/* ---------- Portas ---------- */
export interface Door extends BaseElement {
  type: "door";
  start: Point; // ponto inicial na parede
  end: Point; // ponto final na parede (largura da porta)
  width: Length; // largura da porta em metros
  height?: Length; // altura padrão (opcional)
  color?: RGB;
  /** direção de abertura: "in" ou "out" */
  swing: "in" | "out";
}

/* ---------- Janelas ---------- */
export interface Window extends BaseElement {
  type: "window";
  start: Point;
  end: Point; // largura da janela
  height: Length; // altura da janela
  sillHeight?: Length; // altura do peitoral (distância do chão)
  color?: RGB;
}

/* ---------- Escadas ---------- */
export interface Stair extends BaseElement {
  type: "stair";
  points: Point[]; // linha central da escada
  width: Length;
  rise: Length; // altura do degrau
  run: Length; // profundidade do degrau
  color?: RGB;
}

/* ---------- Banheiros ---------- */
export interface Bathroom extends BaseElement {
  type: "bathroom";
  fixtures: {
    toilet: Point;
    sink: Point;
    shower: Point; // ou box
  };
  color?: RGB;
}

/* ---------- Cozinha ---------- */
export interface Kitchen extends BaseElement {
  type: "kitchen";
  sink: Point;
  countertop: Point[]; // polilinha da bancada
  color?: RGB;
}

/* ---------- Áreas externas ---------- */
export interface Garden extends BaseElement {
  type: "garden";
  points: Point[]; // polilinha do jardim
  color?: RGB;
}

export interface Pool extends BaseElement {
  type: "pool";
  points: Point[]; // polilinha da piscina
  depth?: Length;
  color?: RGB;
}

export interface Balcony extends BaseElement {
  type: "balcony";
  points: Point[]; // polilinha da varanda
  color?: RGB;
}

export interface Corridor extends BaseElement {
  type: "corridor";
  points: Point[]; // polilinha do corredor
  width: Length;
  color?: RGB;
}

export interface Storage extends BaseElement {
  type: "storage";
  points: Point[]; // polilinha do depósito
  color?: RGB;
}

/* ---------- União de todos os elementos ---------- */
export type FloorPlanElement =
  | Wall
  | Room
  | Door
  | Window
  | Stair
  | Bathroom
  | Kitchen
  | Garden
  | Pool
  | Balcony
  | Corridor
  | Storage;

/* ---------- Estado completo da planta baixa ---------- */
export interface FloorPlanState {
  id: string; // ID do imóvel ao qual pertence
  name: string; // nome do imóvel (ex: "Casa Silva")
  elements: FloorPlanElement[];
  gridSize: Length; // tamanho da grade em metros (ex: 0.5)
  snapToGrid: boolean;
  darkMode: boolean;
  selectedElementId: string | null;
  hoveredElementId: string | null;
  /** Ferramenta atualmente ativa */
  activeTool: ToolType;
}

/* ---------- Ferramentas disponíveis ---------- */
export type ToolType =
  | "select"
  | "wall"
  | "room"
  | "door"
  | "window"
  | "stair"
  | "bathroom"
  | "kitchen"
  | "garden"
  | "pool"
  | "balcony"
  | "corridor"
  | "storage"
  | "measure";

/* ---------- Medição ---------- */
export interface Measurement {
  id: string;
  start: Point;
  end: Point;
  distance: Length; // em metros
}

/* ---------- Payload para salvamento (vetorial + raster) ---------- */
export interface FloorPlanPayload {
  planId: string; // referencia ao imóvel
  vector: FloorPlanState; // dados editáveis
  raster: string; // base64 PNG
}
