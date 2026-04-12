import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utilitário padrão para fundir classes Tailwind de forma segura com suporte a design fluido.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Helper para valores fluidos via in-line CSS caso o Tailwind clamp seja bypassado 
 * Retorna uma função clamp com interpolação precisa
 */
export function getFluidValue(minSize: number, maxSize: number, minVw: number = 320, maxVw: number = 1440) {
  return `clamp(${minSize}px, calc(${minSize}px + (${maxSize} - ${minSize}) * ((100vw - ${minVw}px) / (${maxVw} - ${minVw}))), ${maxSize}px)`;
}
