import {
  LayoutDashboard,
  Users,
  Building,
  Building2,
  Key,
  Wallet,
  Settings,
  ShieldAlert,
  PercentCircle,
  FileSignature,
  FileText,
  Megaphone,
  Briefcase,
  Store,
  CreditCard,
  PieChart,
  Layers,
  Contact,
  Home,
  MessageSquare,
  HelpCircle,
  BarChart4
} from 'lucide-react';
import { NavSection, UserRole } from '@/types/navigation';

export const MENU_CONFIG: Record<UserRole, NavSection[]> = {
  SUPER_ADMIN: [
    {
      title: 'Plataforma',
      items: [
        { title: 'Overview', href: '/admin', icon: PieChart, roles: ['SUPER_ADMIN'] },
        { title: 'Tenants / Inquilinos', href: '/admin/tenants', icon: Layers, roles: ['SUPER_ADMIN'] },
        { title: 'Marketplace', href: '/admin/marketplace', icon: Store, roles: ['SUPER_ADMIN'] },
      ]
    },
    {
      title: 'Sistema & Segurança',
      items: [
        { title: 'Parceiros (White Label)', href: '/admin/partners', icon: Briefcase, roles: ['SUPER_ADMIN'] },
        { title: 'Auditoria & Logs', href: '/admin/audit', icon: ShieldAlert, roles: ['SUPER_ADMIN'] },
        { title: 'Configurações', href: '/admin/settings', icon: Settings, roles: ['SUPER_ADMIN'] },
      ]
    }
  ],
  PARTNER: [
    {
      title: 'Seu Negócio',
      items: [
        { title: 'Dashboard', href: '/partner', icon: LayoutDashboard, roles: ['PARTNER'] },
        { title: 'Imobiliárias (Tenants)', href: '/partner/tenants', icon: Building2, roles: ['PARTNER'] },
        { title: 'Royalties e Faturamento', href: '/partner/billing', icon: Wallet, roles: ['PARTNER'] },
      ]
    },
    {
      title: 'Ecosystem',
      items: [
        { title: 'Central de Ajuda (Seus Clientes)', href: '/partner/support', icon: HelpCircle, roles: ['PARTNER'] },
        { title: 'Configurações White Label', href: '/partner/whitelabel', icon: Settings, roles: ['PARTNER'] },
      ]
    }
  ],
  MANAGER: [
    {
      title: 'Gestão',
      items: [
        { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['MANAGER'] },
        { title: 'Imóveis', href: '/dashboard/properties', icon: Home, roles: ['MANAGER'] },
        { title: 'Leads & CRM', href: '/dashboard/leads', icon: Users, roles: ['MANAGER'] },
        { title: 'Equipe de Vendas', href: '/dashboard/team', icon: Contact, roles: ['MANAGER'] },
      ]
    },
    {
      title: 'Operacional',
      items: [
        { title: 'Contratos', href: '/dashboard/contracts', icon: FileSignature, roles: ['MANAGER'] },
        { title: 'Contratos e Operação', href: '/dashboard/contratos', icon: FileText, roles: ['MANAGER', 'BROKER', 'FINANCIAL'] },
        { title: 'Marketing & Portais', href: '/dashboard/marketing', icon: Megaphone, roles: ['MANAGER'] },
        { title: 'Comissões', href: '/dashboard/commissions', icon: PercentCircle, roles: ['MANAGER'] },
      ]
    },
    {
      title: 'Configurações',
      items: [
        { title: 'Minha Imobiliária', href: '/dashboard/settings', icon: Settings, roles: ['MANAGER'] },
      ]
    }
  ],
  BROKER: [
    {
      title: 'Meu Trabalho',
      items: [
        { title: 'Meu Painel', href: '/dashboard', icon: LayoutDashboard, roles: ['BROKER'] },
        { title: 'Meus Leads', href: '/dashboard/leads', icon: Users, roles: ['BROKER'] },
        { title: 'Catálogo de Imóveis', href: '/dashboard/properties', icon: Home, roles: ['BROKER'] },
      ]
    },
    {
      title: 'Negócios',
      items: [
        { title: 'Propostas & Contratos', href: '/dashboard/contracts', icon: FileSignature, roles: ['BROKER'] },
        { title: 'Contratos e Operação', href: '/dashboard/contratos', icon: FileText, roles: ['MANAGER', 'BROKER', 'FINANCIAL'] },
        { title: 'Minhas Comissões', href: '/dashboard/commissions', icon: PercentCircle, roles: ['BROKER'] },
      ]
    }
  ],
  OWNER: [
    {
      items: [
        { title: 'Resumo', href: '/portal', icon: LayoutDashboard, roles: ['OWNER'] },
        { title: 'Meus Imóveis', href: '/portal/properties', icon: Home, roles: ['OWNER'] },
        { title: 'Extratos & Repasses', href: '/portal/statements', icon: Wallet, roles: ['OWNER'] },
        { title: 'Atendimento', href: '/portal/support', icon: MessageSquare, roles: ['OWNER'] },
      ]
    }
  ],
  FINANCIAL: [
    {
      title: 'Financeiro',
      items: [
        { title: 'Visão Geral', href: '/dashboard/finance', icon: BarChart4, roles: ['FINANCIAL'] },
        { title: 'Contas a Pagar / Receber', href: '/dashboard/finance/transactions', icon: CreditCard, roles: ['FINANCIAL'] },
        { title: 'Repasses', href: '/dashboard/finance/transfers', icon: Wallet, roles: ['FINANCIAL'] },
        { title: 'Fechamento & Notas Fiscais', href: '/dashboard/finance/closing', icon: FileSignature, roles: ['FINANCIAL'] },
      ]
    }
  ]
};
