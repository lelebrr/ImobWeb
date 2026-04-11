import React from 'react';
import { 
  TrendingUp, 
  Users, 
  Building2, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  TrendingDown
} from 'lucide-react';
import { cn } from '../../../lib/utils';

interface KPIProps {
  title: string;
  value: string;
  change: number; // Percentage
  icon: any;
  trend: 'up' | 'down' | 'neutral';
}

/**
 * KPI WIDGET - IMOBWEB 2026
 * Interactive and visually rich metrics card
 */
const KPICard: React.FC<KPIProps> = ({ title, value, change, icon: Icon, trend }) => {
  return (
    <div className="bg-slate-900 shadow-xl p-6 rounded-3xl border border-slate-800 hover:border-indigo-500/50 transition-all group overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 blur-[80px] rounded-full pointer-events-none" />
      
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-slate-800 rounded-2xl text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
          <Icon size={24} />
        </div>
        <div className={cn(
          "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
          trend === 'up' ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
        )}>
          {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {change}%
        </div>
      </div>
      
      <div className="space-y-1">
        <p className="text-slate-500 text-sm font-medium">{title}</p>
        <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
      </div>
      
      {/* Visual Indicator of trend */}
      <div className="mt-6 flex items-end gap-1 h-8">
        {[...Array(6)].map((_, i) => (
          <div 
            key={i} 
            className={cn(
              "flex-1 rounded-t-sm transition-all duration-500",
              trend === 'up' ? "bg-emerald-500/20" : "bg-rose-500/20"
            )} 
            style={{ height: `${20 + Math.random() * 80}%`, opacity: 0.1 * (i + 1) }}
          />
        ))}
      </div>
    </div>
  );
};

export const AdminKPIs: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <KPICard 
        title="Faturamento (MRR)" 
        value="R$ 1.250.000" 
        change={12.5} 
        icon={DollarSign} 
        trend="up" 
      />
      <KPICard 
        title="Imobiliárias Ativas" 
        value="1.420" 
        change={8.2} 
        icon={Building2} 
        trend="up" 
      />
      <KPICard 
        title="Usuários Ativos (MAU)" 
        value="85.400" 
        change={-2.1} 
        icon={Users} 
        trend="down" 
      />
      <KPICard 
        title="Taxa de Churn" 
        value="1.8%" 
        change={-0.4} 
        icon={TrendingDown} 
        trend="up" // Up because low churn is good
      />
    </div>
  );
};
