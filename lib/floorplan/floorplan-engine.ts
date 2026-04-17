import { Point, Length } from "@/types/floorplan";

/**
 * Converte metros para pixels (escala arbitrária: 1m = 100px)
 */
export const metersToPixels = (m: Length): number => m * 100;

/**
 * Converte pixels para metros
 */
export const pixelsToMeters = (px: number): Length => px / 100;

/**
 * Ajusta um ponto para o nearest grid point.
 * @param point ponto original
 * @param gridSize tamanho da grade em metros
 */
export const snapToGrid = (point: Point, gridSize: Length): Point => {
  const sizePx = metersToPixels(gridSize);
  return {
    x: Math.round(point.x / sizePx) * sizePx,
    y: Math.round(point.y / sizePx) * sizePx,
  };
};

/**
 * Calcula a área de um polígono simples (método do sapato).
 * Os pontos devem estar em metros.
 */
export const polygonArea = (points: Point[]): Length => {
  if (points.length < 3) return 0;
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const p1 = points[i];
    const p2 = points[(i + 1) % points.length];
    area += p1.x * p2.y - p2.x * p1.y;
  }
  return Math.abs(area) / 2;
};

/**
 * Valida se uma nova parede intersecta alguma parede existente (simplificado).
 * Para MVP, retornamos true (permite) – pode ser aprimorado depois.
 */
export const validateWall = (newWall: Point[], _existing: Point[][]): boolean =>
  true;
