export { ZapAdapter, createZapAdapter } from './zap-adapter';

import { createZapAdapter } from './zap-adapter';
import type { PortalId } from '@/types/portals';
import type { PortalAdapter } from '../sync-engine';

const adapters: Partial<Record<PortalId, (config: Record<string, string>) => PortalAdapter>> = {
  zap: (config: Record<string, string>) => createZapAdapter({ 
    apiKey: config.apiKey || '', 
    endpoint: config.endpoint,
    clientId: config.clientId 
  })
};

export function getPortalAdapter(portalId: PortalId, config: Record<string, string>): PortalAdapter | null {
  const factory = adapters[portalId];
  if (!factory) {
    console.warn(`No adapter found for portal: ${portalId}`);
    return null;
  }
  return factory(config);
}
