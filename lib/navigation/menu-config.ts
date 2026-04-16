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
        { title: 'Overview', href: '/admin', icon: PieChart, roles: ['SUPER_ADMIN', 'PLATFORM_MASTER'] },
        { title: 'Tenants / Inquilinos', href: '/admin/tenants', icon: Layers, roles: ['SUPER_ADMIN', 'PLATFORM_MASTER'] },
        { title: 'Marketplace', href: '/admin/marketplace', icon: Store, roles: ['SUPER_ADMIN', 'PLATFORM_MASTER'] },
      ]
    },
    {
      title: 'Sistema & Segurança',
      items: [
        { title: 'Parceiros (White Label)', href: '/admin/partners', icon: Briefcase, roles: ['SUPER_ADMIN', 'PLATFORM_MASTER'] },
        { title: 'Auditoria & Logs', href: '/admin/audit', icon: ShieldAlert, roles: ['SUPER_ADMIN', 'PLATFORM_MASTER'] },
        { title: 'Configurações', href: '/admin/settings', icon: Settings, roles: ['SUPER_ADMIN', 'PLATFORM_MASTER'] },
      ]
    }
  ],
  PLATFORM_MASTER: [], // Inherits from SUPER_ADMIN via logic in Sidebar or we can map it directly
  AGENCY_MASTER: [],   // Will map to MANAGER
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
        { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['MANAGER', 'AGENCY_MASTER', 'ADMIN'] },
        { title: 'Imóveis', href: '/dashboard/properties', icon: Home, roles: ['MANAGER', 'AGENCY_MASTER', 'ADMIN'] },
        { title: 'Leads & CRM', href: '/dashboard/leads', icon: Users, roles: ['MANAGER', 'AGENCY_MASTER', 'ADMIN'] },
        { title: 'Equipe de Vendas', href: '/dashboard/team', icon: Contact, roles: ['MANAGER', 'AGENCY_MASTER', 'ADMIN'] },
      ]
    },
    {
      title: 'Operacional',
      items: [
        { title: 'Contratos', href: '/dashboard/contracts', icon: FileSignature, roles: ['MANAGER', 'AGENCY_MASTER', 'ADMIN'] },
        { title: 'Contratos e Operação', href: '/dashboard/contratos', icon: FileText, roles: ['MANAGER', 'AGENCY_MASTER', 'ADMIN', 'BROKER', 'FINANCIAL', 'AGENCY_SALES', 'AGENCY_FINANCE'] },
        { title: 'Marketing & Portais', href: '/dashboard/marketing', icon: Megaphone, roles: ['MANAGER', 'AGENCY_MASTER', 'ADMIN'] },
        { title: 'Comissões', href: '/dashboard/commissions', icon: PercentCircle, roles: ['MANAGER', 'AGENCY_MASTER', 'ADMIN'] },
      ]
    },
    {
      title: 'Configurações',
      items: [
        { title: 'Minha Imobiliária', href: '/dashboard/settings', icon: Settings, roles: ['MANAGER', 'AGENCY_MASTER', 'ADMIN'] },
      ]
    }
  ],
  BROKER: [
    {
      title: 'Meu Trabalho',
      items: [
        { title: 'Meu Painel', href: '/dashboard', icon: LayoutDashboard, roles: ['BROKER', 'AGENCY_SALES', 'CORRETOR'] },
        { title: 'Meus Leads', href: '/dashboard/leads', icon: Users, roles: ['BROKER', 'AGENCY_SALES', 'CORRETOR'] },
        { title: 'Catálogo de Imóveis', href: '/dashboard/properties', icon: Home, roles: ['BROKER', 'AGENCY_SALES', 'CORRETOR'] },
      ]
    },
    {
      title: 'Negócios',
      items: [
        { title: 'Propostas & Contratos', href: '/dashboard/contracts', icon: FileSignature, roles: ['BROKER', 'AGENCY_SALES', 'CORRETOR'] },
        { title: 'Contratos e Operação', href: '/dashboard/contratos', icon: FileText, roles: ['MANAGER', 'AGENCY_MASTER', 'ADMIN', 'BROKER', 'FINANCIAL', 'AGENCY_SALES', 'AGENCY_FINANCE'] },
        { title: 'Minhas Comissões', href: '/dashboard/commissions', icon: PercentCircle, roles: ['BROKER', 'AGENCY_SALES', 'CORRETOR'] },
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
        { title: 'Visão Geral', href: '/dashboard/finance', icon: BarChart4, roles: ['FINANCIAL', 'AGENCY_FINANCE'] },
        { title: 'Contas a Pagar / Receber', href: '/dashboard/finance/transactions', icon: CreditCard, roles: ['FINANCIAL', 'AGENCY_FINANCE'] },
        { title: 'Repasses', href: '/dashboard/finance/transfers', icon: Wallet, roles: ['FINANCIAL', 'AGENCY_FINANCE'] },
        { title: 'Fechamento & Notas Fiscais', href: '/dashboard/finance/closing', icon: FileSignature, roles: ['FINANCIAL', 'AGENCY_FINANCE'] },
      ]
    }
  ],
  // Mapping new roles to the existing lists to avoid massive duplication
  // The Sidebar component will use these as keys
  PLATFORM_MARKETING: [],
  PLATFORM_FINANCE: [],
  PLATFORM_SUPPORT: [],
  AGENCY_SALES: [],
  AGENCY_HR: [],
  AGENCY_MARKETING: [],
  AGENCY_FINANCE: [],
  AGENCY_SUPPORT: [],
  ADMIN: [],
  GERENTE: [],
  CORRETOR: [],
  ASSISTENTE: [],
};

// Aliases for better lookup performance
MENU_CONFIG.PLATFORM_MASTER = MENU_CONFIG.SUPER_ADMIN;
MENU_CONFIG.PLATFORM_MARKETING = MENU_CONFIG.SUPER_ADMIN;
MENU_CONFIG.PLATFORM_FINANCE = MENU_CONFIG.SUPER_ADMIN;
MENU_CONFIG.PLATFORM_SUPPORT = MENU_CONFIG.SUPER_ADMIN;

MENU_CONFIG.AGENCY_MASTER = MENU_CONFIG.MANAGER;
MENU_CONFIG.ADMIN = MENU_CONFIG.MANAGER;
MENU_CONFIG.GERENTE = MENU_CONFIG.MANAGER;

MENU_CONFIG.AGENCY_SALES = MENU_CONFIG.BROKER;
MENU_CONFIG.CORRETOR = MENU_CONFIG.BROKER;

MENU_CONFIG.AGENCY_FINANCE = MENU_CONFIG.FINANCIAL;
MENU_CONFIG.AGENCY_HR = MENU_CONFIG.MANAGER;
MENU_CONFIG.AGENCY_MARKETING = MENU_CONFIG.MANAGER;
MENU_CONFIG.AGENCY_SUPPORT = MENU_CONFIG.MANAGER;
MENU_CONFIG.ASSISTENTE = MENU_CONFIG.BROKER;

