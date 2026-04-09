/**
 * Advanced BI & ROI Logic for imobWeb
 * Calculates performance metrics per Real Estate Portal.
 */

export interface PortalPerformance {
  portalName: string;
  leadsCount: number;
  totalViews: number;
  convergenceRate: number; // % of views that become leads
  costPerLead: number;
  roi: number;
}

/**
 * Calculates efficiency metrics for a set of portals
 */
export function calculatePortalROI(
  portalData: { name: string; leads: number; views: number; cost: number }[]
): PortalPerformance[] {
  return portalData.map((data) => {
    const costPerLead = data.leads > 0 ? data.cost / data.leads : data.cost;
    const convergenceRate = data.views > 0 ? (data.leads / data.views) * 100 : 0;
    
    // Simplistic ROI calculation: (Leads * 100) / Cost - Placeholder for real commercial conversion
    const roi = data.cost > 0 ? (data.leads * 500 - data.cost) / data.cost : 0;

    return {
      portalName: data.name,
      leadsCount: data.leads,
      totalViews: data.views,
      convergenceRate,
      costPerLead,
      roi,
    };
  });
}

/**
 * Generates data for a Lead funnel visualization
 */
export function getLeadFunnelData(leads: any[]) {
  const stages = [
    { name: 'Novos', value: leads.filter(l => l.status === 'NOVO').length },
    { name: 'Contatados', value: leads.filter(l => l.status === 'CONTATADO').length },
    { name: 'Interessados', value: leads.filter(l => l.status === 'INTERESSADO').length },
    { name: 'Convertidos', value: leads.filter(l => l.status === 'CONVERTIDO').length },
  ];
  return stages;
}
