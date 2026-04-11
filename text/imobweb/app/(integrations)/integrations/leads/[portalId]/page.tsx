'use client';

import { useState, use } from 'react';
import { Settings, Zap, Eye, MessageCircle, TrendingUp, Clock, RefreshCw, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/design-system/card';
import { Button } from '@/components/design-system/button';
import { cn } from '@/lib/utils';
import type { PortalId } from '@/types/portals';

interface PageProps {
  params: Promise<{ portalId: PortalId }>;
}

const MOCK_PORTAL_STATS: Record<string, any> = {
  zap: { leads: 234, views: 12500, contacts: 456, conversion: 8.5 },
  viva: { leads: 189, views: 9800, contacts: 345, conversion: 7.2 },
  olx: { leads: 156, views: 8200, contacts: 234, conversion: 5.8 },
  imovelweb: { leads: 89, views: 4200, contacts: 123, conversion: 4.5 },
  chaves: { leads: 45, views: 2800, contacts: 67, conversion: 3.2 }
};

export default function PortalLeadsDashboard({ params }: PageProps) {
  const { portalId } = use(params);
  const stats = MOCK_PORTAL_STATS[portalId] || { leads: 0, views: 0, contacts: 0, conversion: 0 };
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  const portalNames: Record<PortalId, string> = {
    zap: 'Zap Imóveis',
    viva: 'Viva Real',
    olx: 'OLX',
    imovelweb: 'ImovelWeb',
    chaves: 'Chaves na Mão',
    meta: 'Meta Catalog',
    vrsync: 'VRSync',
    custom: 'Custom Portal'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Leads - {portalNames[portalId]}</h2>
          <p className="text-gray-500">Gerencie os leads recebidos deste portal</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className={cn('mr-2 h-4 w-4', refreshing && 'animate-spin')} />
            Atualizar
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Configurar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <MessageCircle className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Leads</p>
                <p className="text-xl font-bold text-gray-900">{stats.leads}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                <Eye className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Visualizações</p>
                <p className="text-xl font-bold text-gray-900">{stats.views.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <MessageCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Contatos</p>
                <p className="text-xl font-bold text-gray-900">{stats.contacts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                <TrendingUp className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Conversão</p>
                <p className="text-xl font-bold text-gray-900">{stats.conversion}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Leads Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="pb-3 text-left text-sm font-medium text-gray-500">Nome</th>
                  <th className="pb-3 text-left text-sm font-medium text-gray-500">Email</th>
                  <th className="pb-3 text-left text-sm font-medium text-gray-500">Telefone</th>
                  <th className="pb-3 text-left text-sm font-medium text-gray-500">Imóvel</th>
                  <th className="pb-3 text-left text-sm font-medium text-gray-500">Status</th>
                  <th className="pb-3 text-left text-sm font-medium text-gray-500">Recebido</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Maria Santos', email: 'maria@email.com', phone: '(11) 98888-7777', property: 'Rua das Flores, 123', status: 'new', time: '5 min' },
                  { name: 'João Silva', email: 'joao@email.com', phone: '(11) 97777-6666', property: 'Av. Paulista, 500', status: 'contacted', time: '30 min' },
                  { name: 'Ana Costa', email: 'ana@email.com', phone: '(11) 96666-5555', property: 'Rua Augusta, 200', status: 'qualified', time: '2h' },
                  { name: 'Pedro Lima', email: 'pedro@email.com', phone: '(11) 95555-4444', property: 'Av. Brigadeiro, 300', status: 'visiting', time: '1 dia' },
                  { name: 'Carlos Oliveira', email: 'carlos@email.com', phone: '(11) 94444-3333', property: 'Rua Oscar Freire, 80', status: 'proposal', time: '2 dias' }
                ].map((lead, index) => (
                  <tr key={index} className="border-b last:border-0">
                    <td className="py-3 font-medium text-gray-900">{lead.name}</td>
                    <td className="py-3 text-gray-600">{lead.email}</td>
                    <td className="py-3 text-gray-600">{lead.phone}</td>
                    <td className="py-3 text-gray-600">{lead.property}</td>
                    <td className="py-3">
                      <span className={cn(
                        'rounded-full px-2 py-0.5 text-xs font-medium',
                        lead.status === 'new' && 'bg-blue-100 text-blue-700',
                        lead.status === 'contacted' && 'bg-purple-100 text-purple-700',
                        lead.status === 'qualified' && 'bg-green-100 text-green-700',
                        lead.status === 'visiting' && 'bg-amber-100 text-amber-700',
                        lead.status === 'proposal' && 'bg-emerald-100 text-emerald-700'
                      )}>
                        {lead.status === 'new' && 'Novo'}
                        {lead.status === 'contacted' && 'Contatado'}
                        {lead.status === 'qualified' && 'Qualificado'}
                        {lead.status === 'visiting' && 'Visitando'}
                        {lead.status === 'proposal' && 'Proposta'}
                      </span>
                    </td>
                    <td className="py-3 text-gray-500 text-sm">{lead.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}