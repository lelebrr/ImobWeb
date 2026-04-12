'use client';

import { useState, useMemo } from 'react';
import { 
  Users, 
  User, 
  ChevronDown, 
  ChevronRight, 
  Mail, 
  Phone, 
  Building2,
  Award,
  TrendingUp,
  MoreHorizontal,
  Star,
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'on_vacation';
  level: number;
  children?: TeamMember[];
  performance?: {
    propertiesCreated: number;
    leadsConverted: number;
    revenue: number;
    score: number;
  };
  badges?: string[];
  managerId?: string;
}

interface TeamHierarchyProps {
  members: TeamMember[];
  onMemberClick?: (member: TeamMember) => void;
  onInviteClick?: () => void;
  onManageClick?: (member: TeamMember) => void;
  className?: string;
}

export function TeamHierarchy({ 
  members, 
  onMemberClick,
  onInviteClick,
  onManageClick,
  className 
}: TeamHierarchyProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [selectedMember, setSelectedMember] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleMemberClick = (member: TeamMember) => {
    setSelectedMember(member.id === selectedMember ? null : member.id);
    onMemberClick?.(member);
  };

  const renderMember = (member: TeamMember, index: number) => {
    const hasChildren = member.children && member.children.length > 0;
    const isExpanded = expandedIds.has(member.id);
    const isSelected = selectedMember === member.id;

    return (
      <div key={member.id} className="relative">
        <div className={cn(
          "flex items-center gap-3 p-3 rounded-lg transition-all cursor-pointer",
          "hover:bg-muted/50",
          isSelected && "bg-primary/10 border border-primary/30",
          index === 0 && "ml-0"
        )}>
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(member.id);
              }}
              className="p-1 hover:bg-muted rounded"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          )}
          
          {!hasChildren && <div className="w-6" />}

          <div 
            onClick={() => handleMemberClick(member)}
            className="flex items-center gap-3 flex-1 min-w-0"
          >
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium",
              member.level === 0 && "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
              member.level === 1 && "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
              member.level === 2 && "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
              member.level === 3 && "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
            )}>
              {member.avatar ? (
                <img src={member.avatar} alt={member.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                member.name.charAt(0).toUpperCase()
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm truncate">{member.name}</span>
                {member.badges && member.badges.length > 0 && (
                  <div className="flex gap-1">
                    {member.badges.map((badge, i) => (
                      <span key={i} className="text-xs">🏆</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{member.role}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  {member.status === 'active' && <span className="w-2 h-2 rounded-full bg-green-500" />}
                  {member.status === 'inactive' && <span className="w-2 h-2 rounded-full bg-gray-400" />}
                  {member.status === 'on_vacation' && <span className="w-2 h-2 rounded-full bg-yellow-500" />}
                  {member.status === 'active' ? 'Ativo' : member.status === 'inactive' ? 'Inativo' : 'Férias'}
                </span>
              </div>
            </div>

            {member.performance && (
              <div className="hidden md:flex items-center gap-3 text-xs">
                <div className="text-center">
                  <div className="font-medium">{member.performance.propertiesCreated}</div>
                  <div className="text-muted-foreground">Imóveis</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">{member.performance.leadsConverted}</div>
                  <div className="text-muted-foreground">Leads</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-green-600">
                    {member.performance.score.toFixed(0)}
                  </div>
                  <div className="text-muted-foreground">Score</div>
                </div>
              </div>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                onManageClick?.(member);
              }}
              className="p-2 hover:bg-muted rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="ml-6 border-l-2 border-muted pl-4 mt-2 space-y-2">
            {member.children!.map((child, childIndex) => renderMember(child, childIndex))}
          </div>
        )}
      </div>
    );
  };

  const stats = useMemo(() => {
    const total = members.length;
    const active = members.filter(m => m.status === 'active').length;
    const topPerformer = members.reduce((best, m) => 
      (!best.performance || (m.performance && m.performance.score > best.performance.score)) ? m : best, 
      members[0]
    );
    
    return { total, active, topPerformer };
  }, [members]);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Organograma da Equipe</h3>
        </div>
        <button
          onClick={onInviteClick}
          className="text-sm text-primary hover:text-primary/80 font-medium"
        >
          + Convidar
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="text-xs text-muted-foreground">Total Membros</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          <div className="text-xs text-muted-foreground">Ativos</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold flex items-center justify-center gap-1">
            <Star className="w-4 h-4 text-yellow-500" />
            {stats.topPerformer?.name.split(' ')[0]}
          </div>
          <div className="text-xs text-muted-foreground">Melhor Performance</div>
        </div>
      </div>

      <div className="space-y-2">
        {members.map((member, index) => renderMember(member, index))}
      </div>

      {members.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Nenhum membro na equipe</p>
          <button
            onClick={onInviteClick}
            className="text-primary hover:text-primary/80 text-sm font-medium mt-2"
          >
            Convidar primeiro membro
          </button>
        </div>
      )}
    </div>
  );
}

export function TeamMemberCard({ member, onClick }: { member: TeamMember; onClick?: () => void }) {
  return (
    <div 
      onClick={onClick}
      className="p-4 border rounded-lg hover:border-primary/50 transition-all cursor-pointer bg-card"
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold",
          member.level === 0 && "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
          member.level === 1 && "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
          member.level === 2 && "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
          member.level === 3 && "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
        )}>
          {member.avatar ? (
            <img src={member.avatar} alt={member.name} className="w-full h-full rounded-full object-cover" />
          ) : (
            member.name.charAt(0).toUpperCase()
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium truncate">{member.name}</h4>
            {member.badges && member.badges.length > 0 && (
              <div className="flex">
                {member.badges.slice(0, 2).map((badge, i) => (
                  <span key={i} className="text-sm" title={badge}>🏆</span>
                ))}
              </div>
            )}
          </div>
          
          <p className="text-sm text-muted-foreground">{member.role}</p>

          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Mail className="w-3 h-3" />
              {member.email}
            </span>
            {member.phone && (
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3" />
                {member.phone}
              </span>
            )}
          </div>

          {member.performance && (
            <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t">
              <div className="text-center">
                <div className="text-sm font-semibold">{member.performance.propertiesCreated}</div>
                <div className="text-xs text-muted-foreground">Imóveis</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold">{member.performance.leadsConverted}</div>
                <div className="text-xs text-muted-foreground">Leads</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-green-600">{member.performance.score.toFixed(0)}</div>
                <div className="text-xs text-muted-foreground">Score</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function TeamStatsGrid({ members }: { members: TeamMember[] }) {
  const stats = useMemo(() => {
    const active = members.filter(m => m.status === 'active');
    
    const totalProperties = active.reduce((sum, m) => sum + (m.performance?.propertiesCreated || 0), 0);
    const totalLeads = active.reduce((sum, m) => sum + (m.performance?.leadsConverted || 0), 0);
    const avgScore = active.length > 0 
      ? active.reduce((sum, m) => sum + (m.performance?.score || 0), 0) / active.length 
      : 0;
    const totalRevenue = active.reduce((sum, m) => sum + (m.performance?.revenue || 0), 0);

    return { totalProperties, totalLeads, avgScore, totalRevenue, activeCount: active.length };
  }, [members]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="p-4 bg-card border rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Building2 className="w-4 h-4 text-primary" />
          <span className="text-sm text-muted-foreground">Imóveis Criados</span>
        </div>
        <div className="text-2xl font-bold">{stats.totalProperties}</div>
      </div>

      <div className="p-4 bg-card border rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Users className="w-4 h-4 text-blue-500" />
          <span className="text-sm text-muted-foreground">Leads Convertidos</span>
        </div>
        <div className="text-2xl font-bold">{stats.totalLeads}</div>
      </div>

      <div className="p-4 bg-card border rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-4 h-4 text-green-500" />
          <span className="text-sm text-muted-foreground">Score Médio</span>
        </div>
        <div className="text-2xl font-bold">{stats.avgScore.toFixed(0)}</div>
      </div>

      <div className="p-4 bg-card border rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Award className="w-4 h-4 text-yellow-500" />
          <span className="text-sm text-muted-foreground">Membros Ativos</span>
        </div>
        <div className="text-2xl font-bold">{stats.activeCount}</div>
      </div>
    </div>
  );
}

export default TeamHierarchy;
