'use client';

import { useState } from 'react';
import { 
  Send, 
  MessageCircle, 
  Mail, 
  Phone, 
  FileText, 
  CheckCircle, 
  XCircle,
  Clock,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface InviteData {
  email: string;
  name: string;
  phone?: string;
  role: string;
}

interface BulkInviteFormProps {
  teamId: string;
  onSubmit: (invites: InviteData[]) => Promise<void>;
  onCancel?: () => void;
}

export function BulkInviteForm({ teamId, onSubmit, onCancel }: BulkInviteFormProps) {
  const [invites, setInvites] = useState<InviteData[]>([
    { email: '', name: '', phone: '', role: 'agent' }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const addInviteRow = () => {
    setInvites([...invites, { email: '', name: '', phone: '', role: 'agent' }]);
  };

  const removeInviteRow = (index: number) => {
    if (invites.length > 1) {
      setInvites(invites.filter((_, i) => i !== index));
    }
  };

  const updateInvite = (index: number, field: keyof InviteData, value: string) => {
    const newInvites = [...invites];
    newInvites[index] = { ...newInvites[index], [field]: value };
    setInvites(newInvites);
  };

  const validateInvites = (): boolean => {
    const newErrors: string[] = [];
    
    invites.forEach((invite, index) => {
      if (!invite.email || !invite.email.includes('@')) {
        newErrors.push(`Linha ${index + 1}: Email inválido`);
      }
      if (!invite.name) {
        newErrors.push(`Linha ${index + 1}: Nome é obrigatório`);
      }
    });

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async () => {
    if (!validateInvites()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(invites);
      setInvites([{ email: '', name: '', phone: '', role: 'agent' }]);
    } catch (error) {
      console.error('Failed to send invites:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Convidar Membros</h4>
        <button
          type="button"
          onClick={addInviteRow}
          className="text-sm text-primary hover:underline"
        >
          + Adicionar linha
        </button>
      </div>

      {errors.length > 0 && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          {errors.map((error, i) => (
            <div key={i} className="text-sm text-red-600">{error}</div>
          ))}
        </div>
      )}

      <div className="space-y-3">
        {invites.map((invite, index) => (
          <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
            <div className="flex-1 grid grid-cols-4 gap-3">
              <input
                type="text"
                placeholder="Nome completo"
                value={invite.name}
                onChange={(e) => updateInvite(index, 'name', e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              />
              <input
                type="email"
                placeholder="Email"
                value={invite.email}
                onChange={(e) => updateInvite(index, 'email', e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              />
              <input
                type="tel"
                placeholder="WhatsApp (opcional)"
                value={invite.phone || ''}
                onChange={(e) => updateInvite(index, 'phone', e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              />
              <select
                value={invite.role}
                onChange={(e) => updateInvite(index, 'role', e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="agent">Corretor</option>
                <option value="assistant">Assistente</option>
                <option value="supervisor">Supervisor</option>
                <option value="trainee">Estagiário</option>
              </select>
            </div>
            
            {invites.length > 1 && (
              <button
                type="button"
                onClick={() => removeInviteRow(index)}
                className="p-2 text-muted-foreground hover:text-red-500"
              >
                <XCircle className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 pt-4">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Enviar Convites
            </>
          )}
        </button>
        
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border rounded-md hover:bg-muted"
          >
            Cancelar
          </button>
        )}
      </div>
    </div>
  );
}

export function InviteMethodSelector({ 
  onSelect 
}: { 
  onSelect: (method: 'email' | 'whatsapp' | 'link') => void 
}) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <button
        onClick={() => onSelect('email')}
        className="p-4 border rounded-lg hover:border-primary/50 transition-all text-left"
      >
        <Mail className="w-8 h-8 text-blue-500 mb-2" />
        <h4 className="font-medium">Email</h4>
        <p className="text-sm text-muted-foreground">
          Enviar convite por email
        </p>
      </button>

      <button
        onClick={() => onSelect('whatsapp')}
        className="p-4 border rounded-lg hover:border-primary/50 transition-all text-left"
      >
        <MessageCircle className="w-8 h-8 text-green-500 mb-2" />
        <h4 className="font-medium">WhatsApp</h4>
        <p className="text-sm text-muted-foreground">
          Enviar link por WhatsApp
        </p>
      </button>

      <button
        onClick={() => onSelect('link')}
        className="p-4 border rounded-lg hover:border-primary/50 transition-all text-left"
      >
        <FileText className="w-8 h-8 text-purple-500 mb-2" />
        <h4 className="font-medium">Link Único</h4>
        <p className="text-sm text-muted-foreground">
          Gerar link de convite
        </p>
      </button>
    </div>
  );
}

export function InviteStatusBadge({ 
  status 
}: { 
  status: 'pending' | 'accepted' | 'expired' | 'cancelled' 
}) {
  const config = {
    pending: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Pendente' },
    accepted: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', label: 'Aceito' },
    expired: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100', label: 'Expirado' },
    cancelled: { icon: XCircle, color: 'text-gray-600', bg: 'bg-gray-100', label: 'Cancelado' },
  };

  const { icon: Icon, color, bg, label } = config[status];

  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium", bg, color)}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}

export function BulkInviteStats({ 
  total, 
  pending, 
  accepted, 
  expired 
}: { 
  total: number; 
  pending: number; 
  accepted: number; 
  expired: number;
}) {
  return (
    <div className="flex items-center gap-6 p-4 bg-muted/30 rounded-lg">
      <div className="text-center">
        <div className="text-2xl font-bold">{total}</div>
        <div className="text-xs text-muted-foreground">Total</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-yellow-600">{pending}</div>
        <div className="text-xs text-muted-foreground">Pendentes</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-green-600">{accepted}</div>
        <div className="text-xs text-muted-foreground">Aceitos</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-red-600">{expired}</div>
        <div className="text-xs text-muted-foreground">Expirados</div>
      </div>
    </div>
  );
}

export default BulkInviteForm;
