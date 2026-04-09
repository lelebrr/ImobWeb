'use client';

import { useState, useMemo } from 'react';
import { 
  Building2, 
  Users, 
  TrendingUp, 
  DollarSign, 
  Home,
  UserPlus,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Filter,
  Download,
  CreditCard
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FranchiseData {
  id: string;
  name: string;
  cnpj?: string;
  city?: string;
  state?: string;
  status: 'active' | 'inactive' | 'suspended' | 'pending_approval';
  metrics: {
    totalProperties: number;
    totalLeads: number;
    convertedLeads: number;
    mrr: number;
    activeUsers: number;
  };
  royalties: {
    percentage: number;
    pendingAmount: number;
  };
}

interface FranchiseDashboardProps {
  franchises: FranchiseData[];
  className?: string;
}

export function FranchiseDashboard({ franchises, className }: FranchiseDashboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('month');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredFranchises = useMemo(() => {
    if (statusFilter === 'all') return franchises;
    return franchises.filter(f => f.status === statusFilter);
  }, [franchises, statusFilter]);

  const totals = useMemo(() => {
    return filteredFranchises.reduce((acc, f) => ({
      properties: acc.properties + f.metrics.totalProperties,
      leads: acc.leads + f.metrics.totalLeads,
      converted: acc.converted + f.metrics.convertedLeads,
      mrr: acc.mrr + f.metrics.mrr,
      royalties: acc.royalties + (f.metrics.mrr * (f.royalties.percentage / 100)),
      users: acc.users + f.metrics.activeUsers,
    }), { properties: 0, leads: 0, converted: 0, mrr: 0, royalties: 0, users: 0 });
  }, [filteredFranchises]);

  const activeFranchises = franchises.filter(f => f.status === 'active').length;
  const pendingRoyalties = filteredFranchises.reduce((acc, f) => acc + f.royalties.pendingAmount, 0);

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Dashboard de Franquias</h3>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="all">Todas as Status</option>
            <option value="active">Ativas</option>
            <option value="inactive">Inativas</option>
            <option value="suspended">Suspensas</option>
            <option value="pending_approval">Pendentes</option>
          </select>

          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="week">Esta Semana</option>
            <option value="month">Este Mês</option>
            <option value="quarter">Este Trimestre</option>
            <option value="year">Este Ano</option>
          </select>

          <button className="flex items-center gap-2 px-3 py-2 border rounded-md text-sm hover:bg-muted">
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="p-4 bg-card border rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-4 h-4 text-blue-500" />
            <span className="text-xs text-muted-foreground">Franquias</span>
          </div>
          <div className="text-2xl font-bold">{filteredFranchises.length}</div>
          <div className="text-xs text-green-600">{activeFranchises} ativas</div>
        </div>

        <div className="p-4 bg-card border rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Home className="w-4 h-4 text-purple-500" />
            <span className="text-xs text-muted-foreground">Imóveis</span>
          </div>
          <div className="text-2xl font-bold">{totals.properties.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">Total no réseau</div>
        </div>

        <div className="p-4 bg-card border rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-cyan-500" />
            <span className="text-xs text-muted-foreground">Usuários</span>
          </div>
          <div className="text-2xl font-bold">{totals.users}</div>
          <div className="text-xs text-muted-foreground">Corretores ativos</div>
        </div>

        <div className="p-4 bg-card border rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-xs text-muted-foreground">MRR Total</span>
          </div>
          <div className="text-2xl font-bold">R$ {(totals.mrr / 1000).toFixed(1)}k</div>
          <div className="text-xs text-green-600 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" />
            +12% vs período anterior
          </div>
        </div>

        <div className="p-4 bg-card border rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-yellow-500" />
            <span className="text-xs text-muted-foreground">Royalties</span>
          </div>
          <div className="text-2xl font-bold">R$ {(totals.royalties / 1000).toFixed(1)}k</div>
          <div className="text-xs text-muted-foreground">Este período</div>
        </div>

        <div className="p-4 bg-card border rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="w-4 h-4 text-orange-500" />
            <span className="text-xs text-muted-foreground">Pendente</span>
          </div>
          <div className="text-2xl font-bold">R$ {(pendingRoyalties / 1000).toFixed(1)}k</div>
          <div className="text-xs text-red-600">A receber</div>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium">Franquia</th>
              <th className="px-4 py-3 text-left text-xs font-medium">Localização</th>
              <th className="px-4 py-3 text-center text-xs font-medium">Status</th>
              <th className="px-4 py-3 text-center text-xs font-medium">Imóveis</th>
              <th className="px-4 py-3 text-center text-xs font-medium">Usuários</th>
              <th className="px-4 py-3 text-center text-xs font-medium">MRR</th>
              <th className="px-4 py-3 text-center text-xs font-medium">Royalties</th>
              <th className="px-4 py-3 text-center text-xs font-medium">% Taxa</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredFranchises.map((franchise) => {
              const royaltyAmount = franchise.metrics.mrr * (franchise.royalties.percentage / 100);
              
              return (
                <tr key={franchise.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium">{franchise.name}</div>
                      {franchise.cnpj && (
                        <div className="text-xs text-muted-foreground">
                          CNPJ: {franchise.cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm">
                      {franchise.city}, {franchise.state}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
                      franchise.status === 'active' && "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
                      franchise.status === 'inactive' && "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
                      franchise.status === 'suspended' && "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
                      franchise.status === 'pending_approval' && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                    )}>
                      {franchise.status === 'active' && 'Ativa'}
                      {franchise.status === 'inactive' && 'Inativa'}
                      {franchise.status === 'suspended' && 'Suspensa'}
                      {franchise.status === 'pending_approval' && 'Pendente'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-sm">
                    {franchise.metrics.totalProperties.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-center text-sm">
                    {franchise.metrics.activeUsers}
                  </td>
                  <td className="px-4 py-3 text-center text-sm font-medium">
                    R$ {franchise.metrics.mrr.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-center text-sm font-medium text-yellow-600">
                    R$ {royaltyAmount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-center text-sm">
                    {franchise.royalties.percentage}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function FranchiseCard({ franchise, onClick }: { 
  franchise: FranchiseData; 
  onClick?: () => void;
}) {
  const royaltyAmount = franchise.metrics.mrr * (franchise.royalties.percentage / 100);

  return (
    <div 
      onClick={onClick}
      className="p-4 border rounded-lg hover:border-primary/50 cursor-pointer transition-all"
    >
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-medium">{franchise.name}</h4>
          <p className="text-sm text-muted-foreground">
            {franchise.city}, {franchise.state}
          </p>
        </div>
        <span className={cn(
          "px-2 py-0.5 rounded text-xs font-medium",
          franchise.status === 'active' && "bg-green-100 text-green-700",
          franchise.status === 'inactive' && "bg-gray-100 text-gray-700",
          franchise.status === 'suspended' && "bg-red-100 text-red-700"
        )}>
          {franchise.status}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t">
        <div className="text-center">
          <div className="text-lg font-bold">{franchise.metrics.totalProperties}</div>
          <div className="text-xs text-muted-foreground">Imóveis</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold">{franchise.metrics.activeUsers}</div>
          <div className="text-xs text-muted-foreground">Usuários</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-yellow-600">R$ {(royaltyAmount / 1000).toFixed(1)}k</div>
          <div className="text-xs text-muted-foreground">Royalties</div>
        </div>
      </div>
    </div>
  );
}

export default FranchiseDashboard;