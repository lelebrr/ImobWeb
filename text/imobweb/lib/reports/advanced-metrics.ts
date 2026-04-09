/**
 * Advanced Metrics Engine for imobWeb
 * Calculates LTV, Churn, and Property Freshness.
 */

export interface AdvancedMetrics {
  ltv: number;            // Lifetime Value
  churnRate: number;      // % of lost users/customers
  avgTicket: number;      // Average transaction value
  freshnessScore: number; // 0-100 score of how updated the properties are
}

/**
 * Calculates metrics based on raw data
 */
export function calculateAdvancedBusinessMetrics(
  transactions: { value: number; date: Date; userId: string }[],
  totalUsers: number,
  lostUsers: number,
  properties: { lastUpdate: Date }[]
): AdvancedMetrics {
  // LTV = (Avg Ticket * Avg Purchase Frequency) * Avg Lifespan
  const totalRevenue = transactions.reduce((sum, t) => sum + t.value, 0);
  const avgTicket = transactions.length > 0 ? totalRevenue / transactions.length : 0;
  const ltv = avgTicket * 12; // Simplistic LTV assuming 12 transactions lifespan

  const churnRate = totalUsers > 0 ? (lostUsers / totalUsers) * 100 : 0;

  // Freshness Score: High if properties updated in the last 15 days
  const now = new Date();
  const fifteenDaysAgo = new Date(now.setDate(now.getDate() - 15));
  
  const updatedProperties = properties.filter(p => new Date(p.lastUpdate) >= fifteenDaysAgo).length;
  const freshnessScore = properties.length > 0 ? (updatedProperties / properties.length) * 100 : 100;

  return {
    ltv,
    churnRate,
    avgTicket,
    freshnessScore,
  };
}

/**
 * Predicts next month revenue based on current trends
 */
export function predictRevenue(currentRevenue: number, growthRate: number) {
  return currentRevenue * (1 + growthRate);
}
