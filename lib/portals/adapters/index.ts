export { ZapAdapter, createZapAdapter } from './zap-adapter';
export { VivaRealAdapter, createVivaRealAdapter } from './vivareal-adapter';
export { OlxAdapter, createOlxAdapter } from './olx-adapter';
export { ImovelWebAdapter, createImovelWebAdapter } from './imovelweb-adapter';
export { ChavesNaMaoAdapter, createChavesNaMaoAdapter } from './chavesnamao-adapter';
export { MercadoLivreAdapter, createMercadoLivreAdapter } from './mercadolivre-adapter';
export { ProprietarioDiretoAdapter, createProprietarioDiretoAdapter } from './proprietario-direto-adapter';
export { ImobiBrasilAdapter, createImobiBrasilAdapter } from './imobibrasil-adapter';
export { LoftAdapter, createLoftAdapter } from './loft-adapter';
export { QuintoAndarAdapter, createQuintoAndarAdapter } from './quintoandar-adapter';

import { createZapAdapter } from './zap-adapter';
import { createVivaRealAdapter } from './vivareal-adapter';
import { createOlxAdapter } from './olx-adapter';
import { createImovelWebAdapter } from './imovelweb-adapter';
import { createChavesNaMaoAdapter } from './chavesnamao-adapter';
import { createMercadoLivreAdapter } from './mercadolivre-adapter';
import { createProprietarioDiretoAdapter } from './proprietario-direto-adapter';
import { createImobiBrasilAdapter } from './imobibrasil-adapter';
import { createLoftAdapter } from './loft-adapter';
import { createQuintoAndarAdapter } from './quintoandar-adapter';
import type { PortalId } from '@/types/portals';
import type { PortalAdapter } from '../sync-engine';

const adapters: Partial<Record<PortalId, (config: Record<string, any>) => PortalAdapter>> = {
  zap: (config: Record<string, any>) => createZapAdapter(config),
  viva: (config: Record<string, any>) => createVivaRealAdapter(config),
  olx: (config: Record<string, any>) => createOlxAdapter(config),
  imovelweb: (config: Record<string, any>) => createImovelWebAdapter(config),
  chaves: (config: Record<string, any>) => createChavesNaMaoAdapter(config),
  mercado_livre: (config: Record<string, any>) => createMercadoLivreAdapter(config),
  proprietario_direto: (config: Record<string, any>) => createProprietarioDiretoAdapter(config),
  imobibrasil: (config: Record<string, any>) => createImobiBrasilAdapter(config),
  loft: (config: Record<string, any>) => createLoftAdapter(config),
  quinto_andar: (config: Record<string, any>) => createQuintoAndarAdapter(config),
};

export function getPortalAdapter(portalId: PortalId, config: Record<string, any>): PortalAdapter | null {
  const factory = adapters[portalId];
  if (!factory) {
    console.warn(`No adapter found for portal: ${portalId}`);
    return null;
  }
  return factory(config);
}

/**
 * Obtém todos os adaptadores disponíveis
 */
export function getAllAdapters(): Record<PortalId, (config: Record<string, any>) => PortalAdapter> {
  return adapters as Record<PortalId, (config: Record<string, any>) => PortalAdapter>;
}

/**
 * Verifica se um adaptador está disponível para um portal específico
 */
export function isAdapterAvailable(portalId: PortalId): boolean {
  return portalId in adapters;
}
