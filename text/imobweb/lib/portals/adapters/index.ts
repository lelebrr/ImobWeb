export { ZapAdapter, createZapAdapter } from './zap-adapter';

import { createZapAdapter } from './zap-adapter';
import type { PortalAdapter, PortalId } from '../sync-engine';

const adapters: Partial<Record<PortalId, (config: Record<string, string>) => PortalAdapter>> = {
  zap: createZapAdapter
};

export function getPortalAdapter(portalId: PortalId, config: Record<string, string>): PortalAdapter | null {
  const factory = adapters[portalId];
  if (!factory) {
    console.warn(`No adapter found for portal: ${portalId}`);
    return null;
  }
  return factory(config);
}
