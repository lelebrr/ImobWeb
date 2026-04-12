'use client';

import { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Building2, 
  Target,
  Award,
  Calendar,
  BarChart3,
  PieChart,
  ArrowUp,
  ArrowDown,
  Filter,
  Download
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PerformanceData {
  teamId: string;
  period: string;
  totalProperties: number;
  newProperties: number;
  updatedProperties: number;
  totalLeads: number;
  newLeads: number;
  convertedLeads: number;
  conversionRate: number;
  totalRevenue: number;
  avgScore: number;
  ranking: number;
  previousRanking: number;
}

interface TeamPerformanceDashboardProps {
  teams: PerformanceData[];
  className?: string;
}

export function TeamPerformanceDashboard({ teams, className }: TeamPerformanceDashboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('month');
  const [filterTeam, setFilterTeam] = useState<string>('all');

  const filteredTeams = useMemo(() => {
    if (filterTeam === 'all') return teams;
    return teams.filter(t => t.teamId === filterTeam);
  }, [teams, filterTeam]);

  const totals = useMemo(() => {
    return filteredTeams.reduce((acc, team) => ({
      properties: acc.properties + team.totalProperties,
      newProperties: acc.newProperties + team.newProperties,
      leads: acc.leads + team.totalLeads,
      converted: acc.converted + team.convertedLeads,
      revenue: acc.revenue + team.totalRevenue,
      avgScore: acc.avgScore + team.avgScore,
    }), { properties: 0, newProperties: 0, leads: 0, converted: 0, revenue: 0, avgScore: 0 });
  }, [filteredTeams]);

  const avgScore = filteredTeams.length > 0 ? totals.avgScore / filteredTeams.length : 0;
  const avgConversion = totals.leads > 0 ? (totals.converted / totals.leads) * 100 : 0;

  const getRankingChange = (current: number, previous: number) => {
    const diff = previous - current;
    if (diff > 0) return { icon: ArrowUp, color: 'text-green-500', text: `${diff} posições` };
    if (diff < 0) return { icon: ArrowDown, color: 'text-red-500', text: `${Math.abs(diff)} posições` };
    return { icon: null, color: 'text-muted-foreground', text: 'Sem alteração' };
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Performance por Equipe</h3>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filterTeam}
            onChange={(e) => setFilterTeam(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="all">Todas as Equipes</option>
            {teams.map(team => (
              <option key={team.teamId} value={team.teamId}>
                Equipe {team.teamId}
              </option>
            ))}
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
            <span className="text-xs text-muted-foreground">Imóveis</span>
          </div>
          <div className="text-2xl font-bold">{totals.properties}</div>
          <div className="text-xs text-green-600">+{totals.newProperties} novos</div>
        </div>

        <div className="p-4 bg-card border rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-purple-500" />
            <span className="text-xs text-muted-foreground">Leads</span>
          </div>
          <div className="text-2xl font-bold">{totals.leads}</div>
          <div className="text-xs text-muted-foreground">{avgConversion.toFixed(1)}% conversão</div>
        </div>

        <div className="p-4 bg-card border rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-green-500" />
            <span className="text-xs text-muted-foreground">Convertidos</span>
          </div>
          <div className="text-2xl font-bold">{totals.converted}</div>
          <div className="text-xs text-green-600">Convertidos</div>
        </div>

        <div className="p-4 bg-card border rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-orange-500" />
            <span className="text-xs text-muted-foreground">Receita</span>
          </div>
          <div className="text-2xl font-bold">R$ {(totals.revenue / 1000).toFixed(1)}k</div>
          <div className="text-xs text-muted-foreground">Total gerado</div>
        </div>

        <div className="p-4 bg-card border rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-4 h-4 text-yellow-500" />
            <span className="text-xs text-muted-foreground">Score Médio</span>
          </div>
          <div className="text-2xl font-bold">{avgScore.toFixed(0)}</div>
          <div className="text-xs text-muted-foreground">Média das equipes</div>
        </div>

        <div className="p-4 bg-card border rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <PieChart className="w-4 h-4 text-cyan-500" />
            <span className="text-xs text-muted-foreground">Equipes</span>
          </div>
          <div className="text-2xl font-bold">{filteredTeams.length}</div>
          <div className="text-xs text-muted-foreground">Ativas no período</div>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium">Posição</th>
              <th className="px-4 py-3 text-left text-xs font-medium">Equipe</th>
              <th className="px-4 py-3 text-center text-xs font-medium">Imóveis</th>
              <th className="px-4 py-3 text-center text-xs font-medium">Leads</th>
              <th className="px-4 py-3 text-center text-xs font-medium">Conversão</th>
              <th className="px-4 py-3 text-center text-xs font-medium">Receita</th>
              <th className="px-4 py-3 text-center text-xs font-medium">Score</th>
              <th className="px-4 py-3 text-center text-xs font-medium">Variação</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredTeams
              .sort((a, b) => b.avgScore - a.avgScore)
              .map((team, index) => {
                const ranking = getRankingChange(team.ranking, team.previousRanking);
                
                return (
                  <tr key={team.teamId} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                        index === 0 && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
                        index === 1 && "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
                        index === 2 && "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
                        index > 2 && "bg-muted text-muted-foreground"
                      )}>
                        {team.ranking}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">
                      Equipe {team.teamId.slice(-4)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="text-sm font-medium">{team.totalProperties}</div>
                      <div className="text-xs text-green-600">+{team.newProperties}</div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="text-sm font-medium">{team.totalLeads}</div>
                      <div className="text-xs text-muted-foreground">+{team.newLeads}</div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn(
                        "text-sm font-medium",
                        team.conversionRate >= 20 && "text-green-600",
                        team.conversionRate >= 10 && team.conversionRate < 20 && "text-yellow-600",
                        team.conversionRate < 10 && "text-red-600"
                      )}>
                        {team.conversionRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-sm font-medium">
                      R$ {(team.totalRevenue / 1000).toFixed(1)}k
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full",
                              team.avgScore >= 80 && "bg-green-500",
                              team.avgScore >= 60 && team.avgScore < 80 && "bg-yellow-500",
                              team.avgScore < 60 && "bg-red-500"
                            )}
                            style={{ width: `${Math.min(team.avgScore, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{team.avgScore.toFixed(0)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {ranking.icon && (
                        <div className={cn("flex items-center justify-center gap-1", ranking.color)}>
                          <ranking.icon className="w-4 h-4" />
                          <span className="text-xs">{ranking.text}</span>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          Mostrando {filteredTeams.length} equipes
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded" />
            <span>Acima de 80%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-500 rounded" />
            <span>60% - 80%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded" />
            <span>Abaixo de 60%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TeamRankingWidget({ teams }: { teams: PerformanceData[] }) {
  const top3 = teams
    .sort((a, b) => b.avgScore - a.avgScore)
    .slice(0, 3);

  return (
    <div className="p-4 border rounded-lg">
      <h4 className="font-semibold mb-4 flex items-center gap-2">
        <Award className="w-4 h-4 text-yellow-500" />
        Top 3 Equipes
      </h4>
      
      <div className="space-y-3">
        {top3.map((team, index) => (
          <div key={team.teamId} className="flex items-center gap-3">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
              index === 0 && "bg-yellow-100 text-yellow-700",
              index === 1 && "bg-gray-100 text-gray-700",
              index === 2 && "bg-orange-100 text-orange-700"
            )}>
              {index + 1}
            </div>
            
            <div className="flex-1">
              <div className="font-medium text-sm">Equipe {team.teamId.slice(-4)}</div>
              <div className="text-xs text-muted-foreground">
                {team.totalProperties} imóveis • {team.conversionRate.toFixed(1)}% conversão
              </div>
            </div>
            
            <div className="text-right">
              <div className="font-bold">{team.avgScore.toFixed(0)}</div>
              <div className="text-xs text-muted-foreground">score</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TeamPerformanceDashboard;
