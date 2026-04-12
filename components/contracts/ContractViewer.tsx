'use client';

import { useState } from 'react';
import { FileText, Download, Printer, Share2, Edit, Trash2, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/design-system/button';
import { cn } from '@/lib/utils';
import type { Contract } from '@/types/contracts';

interface ContractViewerProps {
  contract: Contract;
  onEdit?: () => void;
  onDownload?: () => void;
  onPrint?: () => void;
  onShare?: () => void;
  onDelete?: () => void;
}

export function ContractViewer({
  contract,
  onEdit,
  onDownload,
  onPrint,
  onShare,
  onDelete
}: ContractViewerProps) {
  const [expandedClauses, setExpandedClauses] = useState<Set<string>>(
    new Set(contract.clauses.map(c => c.id))
  );

  const toggleClause = (clauseId: string) => {
    const newExpanded = new Set(expandedClauses);
    if (newExpanded.has(clauseId)) {
      newExpanded.delete(clauseId);
    } else {
      newExpanded.add(clauseId);
    }
    setExpandedClauses(newExpanded);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusColor = (status: Contract['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-700';
      case 'pending_review': return 'bg-yellow-100 text-yellow-700';
      case 'pending_signature': return 'bg-blue-100 text-blue-700';
      case 'partially_signed': return 'bg-purple-100 text-purple-700';
      case 'fully_signed': return 'bg-green-100 text-green-700';
      case 'expired': return 'bg-red-100 text-red-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      case 'completed': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: Contract['status']) => {
    const labels: Record<Contract['status'], string> = {
      draft: 'Rascunho',
      pending_review: 'Em Revisão',
      pending_signature: 'Aguardando Assinatura',
      partially_signed: 'Parcialmente Assinado',
      fully_signed: 'Totalmente Assinado',
      expired: 'Expirado',
      cancelled: 'Cancelado',
      completed: 'Concluído'
    };
    return labels[status] || status;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{contract.title}</h2>
            <p className="text-sm text-gray-500">
              {contract.type === 'sale' && 'Contrato de Compra e Venda'}
              {contract.type === 'rent' && 'Contrato de Locação'}
              {contract.type === 'proposal' && 'Proposta Comercial'}
              {contract.type === 'authorization' && 'Autorização'}
              {contract.type === 'commercial' && 'Contrato Comercial'}
            </p>
          </div>
        </div>
        <div className={cn('rounded-full px-3 py-1 text-sm font-medium', getStatusColor(contract.status))}>
          {getStatusText(contract.status)}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-gray-500">Valor Total</p>
          <p className="text-lg font-semibold text-gray-900">{formatCurrency(contract.totalValue)}</p>
        </div>
        {contract.installments && (
          <div className="rounded-lg border bg-white p-4">
            <p className="text-sm text-gray-500">Parcelas</p>
            <p className="text-lg font-semibold text-gray-900">{contract.installments}x de {formatCurrency(contract.totalValue / contract.installments)}</p>
          </div>
        )}
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-gray-500">Partes</p>
          <p className="text-lg font-semibold text-gray-900">{contract.parties.length}</p>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-4">
        <h3 className="mb-3 font-medium text-gray-900">Imóvel</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Endereço:</span>
            <span className="ml-2 text-gray-900">{contract.property.address}</span>
          </div>
          <div>
            <span className="text-gray-500">Cidade:</span>
            <span className="ml-2 text-gray-900">{contract.property.city}-{contract.property.state}</span>
          </div>
          {contract.property.area && (
            <div>
              <span className="text-gray-500">Área:</span>
              <span className="ml-2 text-gray-900">{contract.property.area} m²</span>
            </div>
          )}
          {contract.property.bedrooms !== undefined && (
            <div>
              <span className="text-gray-500">Quartos:</span>
              <span className="ml-2 text-gray-900">{contract.property.bedrooms}</span>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-lg border bg-white p-4">
        <h3 className="mb-3 font-medium text-gray-900">Partes Envolvidas</h3>
        <div className="space-y-3">
          {contract.parties.map((party) => (
            <div key={party.id} className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
              <div>
                <p className="font-medium text-gray-900">{party.name}</p>
                <p className="text-sm text-gray-500">
                  {party.type === 'buyer' && 'Comprador'}
                  {party.type === 'seller' && 'Vendedor'}
                  {party.type === 'tenant' && 'Locatário'}
                  {party.type === 'landlord' && 'Locador'}
                  {party.type === 'witness' && 'Testemunha'}
                  {party.type === 'guarantor' && 'Fiador'}
                  {' - '}{party.documentType.toUpperCase()}: {party.document}
                </p>
              </div>
              <div className="text-right text-sm">
                <p className="text-gray-500">{party.email}</p>
                <p className="text-gray-500">{party.phone}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border bg-white p-4">
        <h3 className="mb-3 font-medium text-gray-900">Cláusulas do Contrato</h3>
        <div className="space-y-2">
          {contract.clauses.map((clause) => (
            <div key={clause.id} className="rounded-lg border">
              <button
                onClick={() => toggleClause(clause.id)}
                className="flex w-full items-center justify-between p-3 text-left hover:bg-gray-50"
              >
                <span className="font-medium text-gray-900">
                  {clause.order}. {clause.title}
                </span>
                {expandedClauses.has(clause.id) ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </button>
              {expandedClauses.has(clause.id) && (
                <div className="border-t p-3 text-sm text-gray-600">
                  {clause.content.split('\n').map((line, i) => (
                    <p key={i} className="mb-1">{line}</p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between border-t pt-4">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit className="mr-1 h-4 w-4" />
            Editar
          </Button>
          <Button variant="outline" size="sm" onClick={onDownload}>
            <Download className="mr-1 h-4 w-4" />
            Baixar
          </Button>
          <Button variant="outline" size="sm" onClick={onPrint}>
            <Printer className="mr-1 h-4 w-4" />
            Imprimir
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onShare}>
            <Share2 className="mr-1 h-4 w-4" />
            Compartilhar
          </Button>
          <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50" onClick={onDelete}>
            <Trash2 className="mr-1 h-4 w-4" />
            Excluir
          </Button>
        </div>
      </div>
    </div>
  );
}
