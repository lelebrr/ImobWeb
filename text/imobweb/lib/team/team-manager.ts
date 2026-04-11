import { z } from 'zod';

export const TeamRoleSchema = z.enum(['manager', 'supervisor', 'agent', 'assistant', 'trainee']);
export type TeamRole = z.infer<typeof TeamRoleSchema>;

export const TeamMemberStatusSchema = z.enum(['active', 'inactive', 'on_vacation', 'onboarding']);
export type TeamMemberStatus = z.infer<typeof TeamMemberStatusSchema>;

export const TeamSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  franchiseId: z.string().optional(),
  branchId: z.string().optional(),
  organizationId: z.string(),
  managerId: z.string().optional(),
  color: z.string().optional(),
  emoji: z.string().optional(),
  settings: z.object({
    maxMembers: z.number().default(20),
    allowInvites: z.boolean().default(true),
    requireApproval: z.boolean().default(false),
  }).optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type Team = z.infer<typeof TeamSchema>;

export const TeamMemberSchema = z.object({
  id: z.string(),
  userId: z.string(),
  teamId: z.string(),
  role: TeamRoleSchema,
  status: TeamMemberStatusSchema.default('active'),
  joinedAt: z.number(),
  leftAt: z.number().optional(),
  performance: z.object({
    propertiesCreated: z.number().default(0),
    propertiesUpdated: z.number().default(0),
    leadsGenerated: z.number().default(0),
    leadsConverted: z.number().default(0),
    revenue: z.number().default(0),
    score: z.number().default(0),
    ranking: z.number().optional(),
  }).optional(),
  badges: z.array(z.string()).optional(),
  stats: z.object({
    totalProperties: z.number().default(0),
    activeProperties: z.number().default(0),
    totalLeads: z.number().default(0),
    activeLeads: z.number().default(0),
    convertedLeads: z.number().default(0),
    totalConversations: z.number().default(0),
    avgResponseTime: z.number().optional(),
  }).optional(),
});

export type TeamMember = z.infer<typeof TeamMemberSchema>;

export interface TeamInvite {
  id: string;
  teamId: string;
  email: string;
  name: string;
  phone?: string;
  role: TeamRole;
  invitedBy: string;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  expiresAt: number;
  createdAt: number;
}

export interface TeamPerformance {
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

export class TeamManager {
  private static teams: Map<string, Team> = new Map();
  private static members: Map<string, TeamMember[]> = new Map();
  private static invites: Map<string, TeamInvite[]> = new Map();

  static async createTeam(team: Omit<Team, 'id' | 'createdAt' | 'updatedAt'>): Promise<Team> {
    const newTeam: Team = {
      ...team,
      id: `team_${Date.now()}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    this.teams.set(newTeam.id, newTeam);
    this.members.set(newTeam.id, []);
    
    return newTeam;
  }

  static async getTeam(teamId: string): Promise<Team | undefined> {
    return this.teams.get(teamId);
  }

  static async updateTeam(teamId: string, updates: Partial<Team>): Promise<Team | null> {
    const team = this.teams.get(teamId);
    if (!team) return null;
    
    const updated: Team = {
      ...team,
      ...updates,
      updatedAt: Date.now(),
    };
    
    this.teams.set(teamId, updated);
    return updated;
  }

  static async deleteTeam(teamId: string): Promise<boolean> {
    this.members.delete(teamId);
    this.invites.delete(teamId);
    return this.teams.delete(teamId);
  }

  static async getAllTeams(organizationId: string): Promise<Team[]> {
    return Array.from(this.teams.values()).filter(t => t.organizationId === organizationId);
  }

  static async getTeamsByBranch(branchId: string): Promise<Team[]> {
    return Array.from(this.teams.values()).filter(t => t.branchId === branchId);
  }

  static async addMember(member: Omit<TeamMember, 'id' | 'joinedAt'>): Promise<TeamMember> {
    const newMember: TeamMember = {
      ...member,
      id: `member_${Date.now()}`,
      joinedAt: Date.now(),
    };
    
    const members = this.members.get(member.teamId) || [];
    members.push(newMember);
    this.members.set(member.teamId, members);
    
    return newMember;
  }

  static async removeMember(memberId: string, teamId: string): Promise<boolean> {
    const members = this.members.get(teamId);
    if (!members) return false;
    
    const index = members.findIndex(m => m.id === memberId);
    if (index === -1) return false;
    
    const member = members[index];
    member.leftAt = Date.now();
    member.status = 'inactive';
    
    return true;
  }

  static async getMembers(teamId: string): Promise<TeamMember[]> {
    return this.members.get(teamId) || [];
  }

  static async getMemberByUser(userId: string, teamId: string): Promise<TeamMember | undefined> {
    const members = this.members.get(teamId) || [];
    return members.find(m => m.userId === userId);
  }

  static async updateMember(memberId: string, teamId: string, updates: Partial<TeamMember>): Promise<TeamMember | null> {
    const members = this.members.get(teamId);
    if (!members) return null;
    
    const index = members.findIndex(m => m.id === memberId);
    if (index === -1) return null;
    
    members[index] = { ...members[index], ...updates };
    this.members.set(teamId, members);
    
    return members[index];
  }

  static async updatePerformance(memberId: string, teamId: string, performance: Partial<TeamMember['performance']>): Promise<void> {
    const members = this.members.get(teamId);
    if (!members) return;
    
    const member = members.find(m => m.id === memberId);
    if (member) {
      member.performance = {
        ...member.performance,
        ...performance,
      };
    }
  }

  static async inviteMember(invite: Omit<TeamInvite, 'id' | 'createdAt' | 'status'>): Promise<TeamInvite> {
    const newInvite: TeamInvite = {
      ...invite,
      id: `invite_${Date.now()}`,
      status: 'pending',
      createdAt: Date.now(),
    };
    
    const invites = this.invites.get(invite.teamId) || [];
    invites.push(newInvite);
    this.invites.set(invite.teamId, invites);
    
    return newInvite;
  }

  static async bulkInvite(teamId: string, invites: Omit<TeamInvite, 'id' | 'teamId' | 'createdAt' | 'status'>[]): Promise<TeamInvite[]> {
    const results: TeamInvite[] = [];
    
    for (const invite of invites) {
      const newInvite = await this.inviteMember({
        ...invite,
        teamId,
      });
      results.push(newInvite);
    }
    
    return results;
  }

  static async getPendingInvites(teamId: string): Promise<TeamInvite[]> {
    const invites = this.invites.get(teamId) || [];
    return invites.filter(i => i.status === 'pending' && i.expiresAt > Date.now());
  }

  static async cancelInvite(inviteId: string, teamId: string): Promise<boolean> {
    const invites = this.invites.get(teamId);
    if (!invites) return false;
    
    const index = invites.findIndex(i => i.id === inviteId);
    if (index === -1) return false;
    
    invites[index].status = 'cancelled';
    return true;
  }

  static async getTeamPerformance(teamId: string, period: string): Promise<TeamPerformance> {
    const members = await this.getMembers(teamId);
    const activeMembers = members.filter(m => m.status === 'active');
    
    let totalProperties = 0;
    let totalLeads = 0;
    let convertedLeads = 0;
    let totalScore = 0;
    
    for (const member of activeMembers) {
      totalProperties += member.performance?.propertiesCreated || 0;
      totalLeads += member.performance?.leadsGenerated || 0;
      convertedLeads += member.performance?.leadsConverted || 0;
      totalScore += member.performance?.score || 0;
    }
    
    return {
      teamId,
      period,
      totalProperties,
      newProperties: Math.floor(totalProperties * 0.3),
      updatedProperties: Math.floor(totalProperties * 0.5),
      totalLeads,
      newLeads: Math.floor(totalLeads * 0.4),
      convertedLeads,
      conversionRate: totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0,
      totalRevenue: members.reduce((sum, m) => sum + (m.performance?.revenue || 0), 0),
      avgScore: activeMembers.length > 0 ? totalScore / activeMembers.length : 0,
      ranking: 1,
      previousRanking: 2,
    };
  }

  static async getAllTeamPerformance(organizationId: string, period: string): Promise<TeamPerformance[]> {
    const teams = await this.getAllTeams(organizationId);
    const performances: TeamPerformance[] = [];
    
    for (const team of teams) {
      const perf = await this.getTeamPerformance(team.id, period);
      performances.push(perf);
    }
    
    return performances.sort((a, b) => b.avgScore - a.avgScore);
  }

  static async getTeamHierarchy(teamId: string): Promise<{
    manager?: TeamMember;
    supervisors: TeamMember[];
    agents: TeamMember[];
    assistants: TeamMember[];
    trainees: TeamMember[];
  }> {
    const members = await this.getMembers(teamId);
    
    return {
      manager: members.find(m => m.role === 'manager'),
      supervisors: members.filter(m => m.role === 'supervisor'),
      agents: members.filter(m => m.role === 'agent'),
      assistants: members.filter(m => m.role === 'assistant'),
      trainees: members.filter(m => m.role === 'trainee'),
    };
  }

  static async getRanking(teamId: string): Promise<TeamMember[]> {
    const members = await this.getMembers(teamId);
    return members
      .filter(m => m.status === 'active')
      .sort((a, b) => (b.performance?.score || 0) - (a.performance?.score || 0));
  }

  static async addBadge(memberId: string, teamId: string, badge: string): Promise<void> {
    const members = this.members.get(teamId);
    if (!members) return;
    
    const member = members.find(m => m.id === memberId);
    if (member) {
      member.badges = [...(member.badges || []), badge];
    }
  }

  static async removeBadge(memberId: string, teamId: string, badge: string): Promise<void> {
    const members = this.members.get(teamId);
    if (!members) return;
    
    const member = members.find(m => m.id === memberId);
    if (member && member.badges) {
      member.badges = member.badges.filter(b => b !== badge);
    }
  }

  static async transferProperty(fromUserId: string, toUserId: string, propertyIds: string[]): Promise<{
    success: boolean;
    transferred: number;
    failed: number;
  }> {
    // In production, this would update the database
    console.log(`Transferring ${propertyIds.length} properties from ${fromUserId} to ${toUserId}`);
    
    return {
      success: true,
      transferred: propertyIds.length,
      failed: 0,
    };
  }
}

export const teamManager = TeamManager;

export async function createTeam(team: Omit<Team, 'id' | 'createdAt' | 'updatedAt'>): Promise<Team> {
  return TeamManager.createTeam(team);
}

export async function getTeam(teamId: string): Promise<Team | undefined> {
  return TeamManager.getTeam(teamId);
}

export async function getAllTeams(organizationId: string): Promise<Team[]> {
  return TeamManager.getAllTeams(organizationId);
}

export async function addTeamMember(member: Omit<TeamMember, 'id' | 'joinedAt'>): Promise<TeamMember> {
  return TeamManager.addMember(member);
}

export async function getTeamMembers(teamId: string): Promise<TeamMember[]> {
  return TeamManager.getMembers(teamId);
}

export async function inviteTeamMembers(teamId: string, invites: Omit<TeamInvite, 'id' | 'teamId' | 'createdAt' | 'status'>[]): Promise<TeamInvite[]> {
  return TeamManager.bulkInvite(teamId, invites);
}

export async function getTeamPerformance(teamId: string, period: string): Promise<TeamPerformance> {
  return TeamManager.getTeamPerformance(teamId, period);
}

export async function getTeamRanking(teamId: string): Promise<TeamMember[]> {
  return TeamManager.getRanking(teamId);
}

export async function transferProperties(fromUserId: string, toUserId: string, propertyIds: string[]): Promise<ReturnType<typeof TeamManager.transferProperty>> {
  return TeamManager.transferProperty(fromUserId, toUserId, propertyIds);
}
