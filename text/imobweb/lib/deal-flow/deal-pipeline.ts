import type { Deal, DealStage, DealActivity, DealPipeline, ContractType } from '@/types/contracts';

export const DEFAULT_STAGES: DealStage[] = [
  { id: 'proposal', name: 'Proposta', order: 1, color: '#3B82F6', isFinal: false },
  { id: 'negotiation', name: 'Negociação', order: 2, color: '#F59E0B', isFinal: false },
  { id: 'contract', name: 'Contrato', order: 3, color: '#8B5CF6', isFinal: false },
  { id: 'signature', name: 'Assinatura', order: 4, color: '#EC4899', isFinal: false },
  { id: 'payment', name: 'Pagamento', order: 5, color: '#10B981', isFinal: false },
  { id: 'completed', name: 'Concluído', order: 6, color: '#059669', isFinal: true },
  { id: 'lost', name: 'Perdido', order: 7, color: '#EF4444', isFinal: true }
];

export class DealPipelineManager {
  private stages: DealStage[];
  private deals: Map<string, Deal> = new Map();
  private listeners: Set<(pipeline: DealPipeline) => void> = new Set();

  constructor(stages: DealStage[] = DEFAULT_STAGES) {
    this.stages = stages;
  }

  getStages(): DealStage[] {
    return this.stages;
  }

  getStage(stageId: string): DealStage | undefined {
    return this.stages.find(s => s.id === stageId);
  }

  getDealsByStage(stageId: string): Deal[] {
    return Array.from(this.deals.values()).filter(d => d.stageId === stageId);
  }

  getAllDeals(): Deal[] {
    return Array.from(this.deals.values());
  }

  getDeal(dealId: string): Deal | undefined {
    return this.deals.get(dealId);
  }

  createDeal(deal: Omit<Deal, 'id' | 'createdAt' | 'updatedAt' | 'stage' | 'activities'>): Deal {
    const newDeal: Deal = {
      ...deal,
      id: `deal-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      stage: this.getStage(deal.stageId)!,
      activities: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.deals.set(newDeal.id, newDeal);
    this.notifyChange();
    return newDeal;
  }

  updateDeal(dealId: string, updates: Partial<Deal>): Deal | null {
    const deal = this.deals.get(dealId);
    if (!deal) return null;

    const updatedDeal = {
      ...deal,
      ...updates,
      updatedAt: new Date()
    };

    if (updates.stageId && updates.stageId !== deal.stageId) {
      updatedDeal.stage = this.getStage(updates.stageId)!;
      this.addActivity(dealId, {
        type: 'note',
        title: 'Mudança de etapa',
        description: `Negócio movido para ${updatedDeal.stage.name}`,
        createdBy: updates.updatedAt ? '' : ''
      });
    }

    this.deals.set(dealId, updatedDeal);
    this.notifyChange();
    return updatedDeal;
  }

  moveToStage(dealId: string, newStageId: string): Deal | null {
    return this.updateDeal(dealId, { stageId: newStageId });
  }

  deleteDeal(dealId: string): boolean {
    const deleted = this.deals.delete(dealId);
    if (deleted) {
      this.notifyChange();
    }
    return deleted;
  }

  addActivity(dealId: string, activity: Omit<DealActivity, 'id' | 'dealId'>): DealActivity | null {
    const deal = this.deals.get(dealId);
    if (!deal) return null;

    const newActivity: DealActivity = {
      ...activity,
      id: `activity-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      dealId,
      createdBy: activity.createdBy || ''
    };

    deal.activities.push(newActivity);
    this.updateDeal(dealId, {});
    return newActivity;
  }

  getPipeline(): DealPipeline {
    return {
      stages: this.stages,
      deals: this.getAllDeals()
    };
  }

  getDealsByProperty(propertyId: string): Deal[] {
    return Array.from(this.deals.values()).filter(d => d.propertyId === propertyId);
  }

  getDealsByClient(clientId: string): Deal[] {
    return Array.from(this.deals.values()).filter(d => d.clientId === clientId);
  }

  getOverdueDeals(): Deal[] {
    const now = new Date();
    return Array.from(this.deals.values()).filter(deal => {
      if (!deal.expectedCloseDate || deal.stage.isFinal) return false;
      return new Date(deal.expectedCloseDate) < now;
    });
  }

  calculateConversionMetrics(): {
    total: number;
    byStage: Record<string, number>;
    averageTimeToClose: number;
    winRate: number;
  } {
    const deals = this.getAllDeals();
    const wonDeals = deals.filter(d => d.stage.id === 'completed');
    const lostDeals = deals.filter(d => d.stage.id === 'lost');

    const byStage: Record<string, number> = {};
    this.stages.forEach(stage => {
      byStage[stage.id] = deals.filter(d => d.stageId === stage.id).length;
    });

    let totalTime = 0;
    let dealsWithTime = 0;

    deals.forEach(deal => {
      if (deal.actualCloseDate) {
        const diff = deal.actualCloseDate.getTime() - deal.createdAt.getTime();
        totalTime += diff;
        dealsWithTime++;
      }
    });

    return {
      total: deals.length,
      byStage,
      averageTimeToClose: dealsWithTime > 0 ? totalTime / dealsWithTime / (1000 * 60 * 60 * 24) : 0,
      winRate: deals.length > 0 ? (wonDeals.length / (wonDeals.length + lostDeals.length)) * 100 : 0
    };
  }

  onChange(callback: (pipeline: DealPipeline) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyChange(): void {
    const pipeline = this.getPipeline();
    this.listeners.forEach(cb => cb(pipeline));
  }

  setStages(stages: DealStage[]): void {
    this.stages = stages;
    this.notifyChange();
  }

  loadDeals(deals: Deal[]): void {
    deals.forEach(deal => {
      const stage = this.getStage(deal.stageId);
      if (stage) {
        this.deals.set(deal.id, { ...deal, stage });
      }
    });
  }

  exportData(): { stages: DealStage[]; deals: Deal[] } {
    return {
      stages: this.stages,
      deals: this.getAllDeals()
    };
  }
}

export const dealPipeline = new DealPipelineManager();

export function createDealFromProperty(
  propertyId: string,
  property: { address: string; value?: number },
  clientId: string,
  client: { name: string; document: string; email: string; phone: string },
  value: number,
  createdBy: string
): Deal {
  const deal = dealPipeline.createDeal({
    propertyId,
    property: {
      id: propertyId,
      address: property.address,
      type: 'house',
      city: '',
      state: '',
      zipCode: ''
    },
    clientId,
    client: {
      id: clientId,
      type: 'buyer',
      name: client.name,
      document: client.document,
      documentType: 'cpf',
      email: client.email,
      phone: client.phone
    },
    value,
    stageId: 'proposal',
    probability: 10,
    createdBy
  });

  dealPipeline.addActivity(deal.id, {
    type: 'note',
    title: 'Negócio criado',
    description: `Proposta criada para ${client.name}`,
    createdBy
  });

  return deal;
}

export function convertToContract(dealId: string, type: ContractType): string {
  const deal = dealPipeline.getDeal(dealId);
  if (!deal) throw new Error('Deal not found');

  const contractId = `contract-${Date.now()}-${Math.random().toString(36).substring(7)}`;

  dealPipeline.updateDeal(dealId, {
    stageId: 'contract',
    contractId
  });

  dealPipeline.addActivity(dealId, {
    type: 'document',
    title: 'Contrato gerado',
    description: `Contrato ${type} criado a partir do negócio`,
    createdBy: deal.createdBy
  });

  return contractId;
}
