'use client';

import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowUpRight, 
  AlertCircle, 
  TrendingUp, 
  TrendingDown,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PropertyInsightRow {
  id: string;
  title: string;
  neighborhood: string;
  healthScore: number;
  churnRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  leadsCount: number;
  views: number;
}

const mockProperties: PropertyInsightRow[] = [
  { id: '1', title: 'Apartamento High-End Jardins', neighborhood: 'Jardins', healthScore: 84, churnRisk: 'LOW', leadsCount: 24, views: 1250 },
  { id: '2', title: 'Cobertura Duplex Pinheiros', neighborhood: 'Pinheiros', healthScore: 45, churnRisk: 'HIGH', leadsCount: 2, views: 890 },
  { id: '3', title: 'Casa de Condomínio Alphaville', neighborhood: 'Alphaville', healthScore: 92, churnRisk: 'LOW', leadsCount: 15, views: 2100 },
  { id: '4', title: 'Studio Premium Itaim', neighborhood: 'Itaim Bibi', healthScore: 30, churnRisk: 'CRITICAL', leadsCount: 0, views: 450 },
  { id: '5', title: 'Loft Industrial Vila Madalena', neighborhood: 'Vila Madalena', healthScore: 68, churnRisk: 'MEDIUM', leadsCount: 8, views: 720 },
];

/**
 * Tabela de Portfólio com Insights de Saúde e Risco.
 */
export const PortfolioTable: React.FC = () => {
  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'CRITICAL': return <Badge className="bg-rose-500 font-bold">Crítico</Badge>;
      case 'HIGH': return <Badge className="bg-orange-500 font-bold">Alto</Badge>;
      case 'MEDIUM': return <Badge className="bg-amber-500 font-bold">Médio</Badge>;
      default: return <Badge className="bg-emerald-500 font-bold">Baixo</Badge>;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 50) return 'text-amber-500';
    return 'text-rose-500';
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl">
      <Table>
        <TableHeader className="bg-slate-900/50">
          <TableRow className="border-slate-800 hover:bg-transparent">
            <TableHead className="text-slate-400 font-bold">Imóvel</TableHead>
            <TableHead className="text-slate-400 font-bold">Health Score</TableHead>
            <TableHead className="text-slate-400 font-bold text-center">Atividade</TableHead>
            <TableHead className="text-slate-400 font-bold">Risco Churn</TableHead>
            <TableHead className="text-right text-slate-400 font-bold">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockProperties.map((prop) => (
            <TableRow key={prop.id} className="border-slate-800 hover:bg-slate-900/40 transition-colors">
              <TableCell>
                <div className="flex flex-col">
                  <span className="text-white font-bold">{prop.title}</span>
                  <span className="text-xs text-slate-500">{prop.neighborhood}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3 w-[150px]">
                  <Progress value={prop.healthScore} className="h-1.5 flex-1" />
                  <span className={`text-xs font-black w-8 ${getScoreColor(prop.healthScore)}`}>
                    {prop.healthScore}%
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-4">
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-400">Views</span>
                    <span className="text-sm font-bold text-white">{prop.views}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-400">Leads</span>
                    <span className="text-sm font-bold text-white">{prop.leadsCount}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {getRiskBadge(prop.churnRisk)}
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-400/10">
                  <ArrowUpRight className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-slate-800">
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
