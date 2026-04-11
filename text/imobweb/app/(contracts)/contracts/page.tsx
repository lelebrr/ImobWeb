'use client';

import { useState } from 'react';
import { FileText, Plus, Search, Filter, Download, Eye, Edit, Trash2, MoreHorizontal, Pen, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/design-system/card';
import { Button } from '@/components/design-system/button';
import { Input } from '@/components/design-system/input';
import { cn } from '@/lib/utils';

const MOCK_CONTRACTS = [
  { id: '1', title: 'Contrato de Compra e Venda - Rua das Flores', type: 'sale', status: 'pending_signature', parties: 2, value: 450000, createdAt: '2026-04-08' },
  { id: '2', title: 'Contrato de Locação - Av. Paulista', type: 'rent', status: 'fully_signed', parties: 2, value: 5000, createdAt: '2026-04-05' },
  { id: '3', title: 'Proposta Comercial - Rua Augusta', type: 'proposal', status: 'pending_signature', parties: 1, value: 380000, createdAt: '2026-04-07' },
  { id: '4', title: 'Contrato de Compra e Venda - Av. Brigadeiro', type: 'sale', status: 'draft', parties: 2, value: 620000, createdAt: '2026-04-09' },
  { id: '5', title: 'Autorização de Venda - Rua Oscar Freire', type: 'authorization', status: 'fully_signed', parties: 1, value: 0, createdAt: '2026-04-04' }
];

export default function ContractsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'fully_signed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending_signature': return <Clock className="h-4 w-4 text-amber-500" />;
      case 'draft': return <FileText className="h-4 w-4 text-gray-400" />;
      default: return <FileText className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'fully_signed': return 'Assinado';
      case 'pending_signature': return 'Aguardando Assinatura';
      case 'draft': return 'Rascunho';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'fully_signed': return 'bg-green-100 text-green-700';
      case 'pending_signature': return 'bg-amber-100 text-amber-700';
      case 'draft': return 'bg-gray-100 text-gray-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'sale': return 'Venda';
      case 'rent': return 'Locação';
      case 'proposal': return 'Proposta';
      case 'authorization': return 'Autorização';
      default: return type;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Contratos</h1>
            <p className="text-gray-500">Gerencie contratos e assinaturas digitais</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Contrato
          </Button>
        </div>

        <div className="mb-6 flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar contratos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="all">Todos os status</option>
            <option value="draft">Rascunho</option>
            <option value="pending_signature">Aguardando Assinatura</option>
            <option value="fully_signed">Assinado</option>
            <option value="cancelled">Cancelado</option>
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="all">Todos os tipos</option>
            <option value="sale">Venda</option>
            <option value="rent">Locação</option>
            <option value="proposal">Proposta</option>
            <option value="authorization">Autorização</option>
          </select>
        </div>

        <div className="grid gap-4">
          {MOCK_CONTRACTS.map((contract) => (
            <Card key={contract.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{contract.title}</h3>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span>{getTypeText(contract.type)}</span>
                        <span>•</span>
                        <span>{contract.parties} parte{contract.parties > 1 ? 's' : ''}</span>
                        <span>•</span>
                        <span>{formatCurrency(contract.value)}</span>
                        <span>•</span>
                        <span>{contract.createdAt}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className={cn('flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium', getStatusColor(contract.status))}>
                      {getStatusIcon(contract.status)}
                      {getStatusText(contract.status)}
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {MOCK_CONTRACTS.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <FileText className="mb-4 h-12 w-12" />
            <p>Nenhum contrato encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
}
