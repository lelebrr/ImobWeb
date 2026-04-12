'use client';

import { useState } from 'react';
import { 
  ArrowRight, 
  Search, 
  Filter, 
  Building2,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Property {
  id: string;
  title: string;
  address: string;
  price: number;
  status: string;
}

interface TransferPropertiesProps {
  properties: Property[];
  fromUserId: string;
  fromUserName: string;
  onTransfer: (propertyIds: string[], toUserId: string) => Promise<{ success: boolean; transferred: number; failed: number }>;
}

export function TransferPropertiesForm({ 
  properties, 
  fromUserId, 
  fromUserName,
  onTransfer 
}: TransferPropertiesProps) {
  const [selectedProperties, setSelectedProperties] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);
  const [result, setResult] = useState<{ success: boolean; transferred: number; failed: number } | null>(null);

  const filteredProperties = properties.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleProperty = (id: string) => {
    const newSelected = new Set(selectedProperties);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedProperties(newSelected);
    setResult(null);
  };

  const toggleAll = () => {
    if (selectedProperties.size === filteredProperties.length) {
      setSelectedProperties(new Set());
    } else {
      setSelectedProperties(new Set(filteredProperties.map(p => p.id)));
    }
  };

  const handleTransfer = async () => {
    if (selectedProperties.size === 0) return;
    
    setIsTransferring(true);
    try {
      const res = await onTransfer(
        Array.from(selectedProperties),
        fromUserId
      );
      setResult(res);
      if (res.success) {
        setSelectedProperties(new Set());
      }
    } catch (error) {
      setResult({ success: false, transferred: 0, failed: selectedProperties.size });
    } finally {
      setIsTransferring(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 p-4 bg-muted/30 rounded-lg">
        <ArrowRight className="w-5 h-5 text-muted-foreground rotate-180" />
        <div>
          <div className="font-medium">Transferir de: {fromUserName}</div>
          <div className="text-sm text-muted-foreground">
            {selectedProperties.size} imóvel(is) selecionado(s)
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar imóveis..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-md"
          />
        </div>
        <button
          onClick={toggleAll}
          className="px-3 py-2 border rounded-md text-sm hover:bg-muted"
        >
          {selectedProperties.size === filteredProperties.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
        </button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="max-h-64 overflow-y-auto">
          {filteredProperties.map(property => (
            <div 
              key={property.id}
              className={cn(
                "flex items-center gap-3 p-3 border-b last:border-b-0 hover:bg-muted/30 cursor-pointer",
                selectedProperties.has(property.id) && "bg-primary/5"
              )}
              onClick={() => toggleProperty(property.id)}
            >
              <div className={cn(
                "w-5 h-5 rounded border flex items-center justify-center",
                selectedProperties.has(property.id) 
                  ? "bg-primary border-primary text-primary-foreground" 
                  : "border-gray-300"
              )}>
                {selectedProperties.has(property.id) && (
                  <CheckCircle className="w-3 h-3" />
                )}
              </div>
              
              <Building2 className="w-8 h-8 text-muted-foreground" />
              
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{property.title}</div>
                <div className="text-sm text-muted-foreground truncate">{property.address}</div>
              </div>
              
              <div className="text-right">
                <div className="font-medium">{formatPrice(property.price)}</div>
                <div className="text-xs text-muted-foreground capitalize">{property.status}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {filteredProperties.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>Nenhum imóvel encontrado</p>
        </div>
      )}

      {result && (
        <div className={cn(
          "p-4 rounded-lg",
          result.success 
            ? "bg-green-50 border border-green-200" 
            : "bg-red-50 border border-red-200"
        )}>
          <div className="flex items-center gap-2">
            {result.success ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            <div>
              <div className={result.success ? "text-green-700" : "text-red-700"}>
                {result.success 
                  ? `${result.transferred} imóvel(is) transferido(s) com sucesso`
                  : 'Erro ao transferir imóveis'
                }
              </div>
              {result.failed > 0 && (
                <div className="text-sm text-red-600">
                  {result.failed} imóvel(is) falharam
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end pt-4">
        <button
          onClick={handleTransfer}
          disabled={selectedProperties.size === 0 || isTransferring}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
        >
          {isTransferring ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Transferindo...
            </>
          ) : (
            <>
              <ArrowRight className="w-4 h-4" />
              Transferir {selectedProperties.size} imóvel(is)
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export function PropertyTransferCard({ 
  property,
  fromUser,
  toUser,
  onConfirm,
  onCancel
}: {
  property: { id: string; title: string; address: string };
  fromUser: { id: string; name: string };
  toUser: { id: string; name: string };
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1 text-right text-sm text-muted-foreground">
          {fromUser.name}
        </div>
        <ArrowRight className="w-5 h-5 text-primary" />
        <div className="flex-1 text-sm font-medium">
          {toUser.name}
        </div>
      </div>

      <div className="p-3 bg-muted/30 rounded-lg mb-4">
        <div className="font-medium">{property.title}</div>
        <div className="text-sm text-muted-foreground">{property.address}</div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2 border rounded-md hover:bg-muted"
        >
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Confirmar Transferência
        </button>
      </div>
    </div>
  );
}

export default TransferPropertiesForm;
