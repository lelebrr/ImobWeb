import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  BarChart3, 
  CreditCard, 
  Settings, 
  Handshake, 
  Globe, 
  Zap, 
  ShieldAlert,
  FileText,
  DollarSign,
  TrendingUp,
  MessageSquare,
  Package,
  Key
} from 'lucide-react';

/**
 * ADMIN MENU CONFIGURATION - IMOBWEB 2026
 * Defines a deep hierarchical structure for the Super Admin panel.
 */

export interface MenuItem {
  id: string;
  label: string;
  href: string;
  icon?: any;
  badge?: string | number;
  roles?: string[];
  children?: MenuItem[];
  isNew?: boolean;
}

export const ADMIN_MENU_CONFIG: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard Executivo',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    id: 'organizations',
    label: 'Imobiliárias (Tenants)',
    href: '/admin/organizations',
    icon: Building2,
    badge: 12, // Ex: Novas solicitações
    children: [
      { id: 'org-list', label: 'Todas as Imobiliárias', href: '/admin/organizations' },
      { id: 'org-active', label: 'Imobiliárias Ativas', href: '/admin/organizations/active' },
      { id: 'org-suspended', label: 'Suspender / Bloquear', href: '/admin/organizations/suspended' },
      { id: 'org-metrics', label: 'Métricas por Tenant', href: '/admin/organizations/metrics' },
    ]
  },
  {
    id: 'users',
    label: 'Usuários Globais',
    href: '/admin/users',
    icon: Users,
    children: [
      { id: 'user-all', label: 'Todos os Usuários', href: '/admin/users' },
      { id: 'user-admins', label: 'Administradores Locais', href: '/admin/users/admins' },
      { id: 'user-sessions', label: 'Sessões Ativas', href: '/admin/users/sessions' },
      { id: 'user-impersonate', label: 'Acessar como Usuário', href: '/admin/users/impersonate', icon: Key },
    ]
  },
  {
    id: 'reports',
    label: 'Relatórios & BI',
    href: '/admin/reports',
    icon: BarChart3,
    children: [
      { 
        id: 'rep-financial', 
        label: 'Financeiro Executivo', 
        href: '/admin/reports/financial',
        icon: DollarSign,
        children: [
          { id: 'rep-mrr', label: 'MRR & Churn', href: '/admin/reports/financial/mrr' },
          { id: 'rep-tax', label: 'Impostos & Fiscal', href: '/admin/reports/financial/tax' },
        ]
      },
      { id: 'rep-usage', label: 'Uso da Plataforma', href: '/admin/reports/usage', icon: TrendingUp },
      { id: 'rep-portals', label: 'Eficiência de Portais', href: '/admin/reports/portals', icon: Globe },
      { id: 'rep-ai', label: 'Uso de IA & Tokens', href: '/admin/reports/ai', icon: Zap },
    ]
  },
  {
    id: 'billing',
    label: 'Faturamento Globais',
    href: '/admin/billing',
    icon: CreditCard,
    children: [
      { id: 'bill-subs', label: 'Assinaturas Ativas', href: '/admin/billing/subscriptions' },
      { id: 'bill-invoices', label: 'Invoices & Notas', href: '/admin/billing/invoices' },
      { id: 'bill-gateways', label: 'Gateways de Pagamento', href: '/admin/billing/gateways' },
    ]
  },
  {
    id: 'marketplace',
    label: 'Marketplace & Add-ons',
    href: '/admin/marketplace',
    icon: Package,
    isNew: true,
    children: [
      { id: 'mp-apps', label: 'Gerenciar Aplicativos', href: '/admin/marketplace/apps' },
      { id: 'mp-installs', label: 'Instalações por Tenant', href: '/admin/marketplace/installations' },
    ]
  },
  {
    id: 'partners',
    label: 'Parceiros & Revendas',
    href: '/admin/partners',
    icon: Handshake,
    children: [
      { id: 'part-list', label: 'Lista de Parceiros', href: '/admin/partners' },
      { id: 'part-com', label: 'Comissões & Royalties', href: '/admin/partners/commissions' },
    ]
  },
  {
    id: 'integrations',
    label: 'Infra & Integrações',
    href: '/admin/integrations',
    icon: Globe,
    children: [
      { id: 'int-whatsapp', label: 'Nodes de WhatsApp', href: '/admin/integrations/whatsapp' },
      { id: 'int-s3', label: 'Storage (S3/Supabase)', href: '/admin/integrations/storage' },
      { id: 'int-cdn', label: 'Status da CDN', href: '/admin/integrations/cdn' },
    ]
  },
  {
    id: 'security',
    label: 'Segurança & Auditoria',
    href: '/admin/security',
    icon: ShieldAlert,
    children: [
      { id: 'sec-logs', label: 'Logs de Auditoria', href: '/admin/security/logs' },
      { id: 'sec-ip', label: 'Bloqueio de IP', href: '/admin/security/ip-ban' },
      { id: 'sec-flags', label: 'Feature Flags', href: '/admin/security/feature-flags' },
    ]
  },
  {
    id: 'settings',
    label: 'Configurações do SaaS',
    href: '/admin/settings',
    icon: Settings,
    children: [
      { id: 'set-general', label: 'Geral', href: '/admin/settings/general' },
      { id: 'set-white-label', label: 'Padrões White Label', href: '/admin/settings/white-label' },
      { id: 'set-templates', label: 'Templates de Email', href: '/admin/settings/email-templates' },
    ]
  },
];
