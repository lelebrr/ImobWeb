"use client";

import { useState } from "react";
import {
  FileText,
  Send,
  MessageCircle,
  Mail,
  Pen,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Download,
  Eye,
} from "lucide-react";
import { Button } from "@/components/design-system/button";
import { Card } from "@/components/design-system/card";
import { cn } from "@/lib/utils";
import {
  Contract,
  Party,
  SignatureStatus,
  SignatureMethod,
} from "@/types/contracts";

interface DigitalSignaturePanelProps {
  contract: Contract;
  onSendForSignature?: (method: SignatureMethod, partyId: string) => void;
  onViewDocument?: () => void;
  onDownloadDocument?: () => void;
  onCancelSignature?: (requestId: string) => void;
}

interface PartySignatureStatus {
  partyId: string;
  name: string;
  status: SignatureStatus;
  signedAt?: Date;
  method?: SignatureMethod;
}

export function DigitalSignaturePanel({
  contract,
  onSendForSignature,
  onViewDocument,
  onDownloadDocument,
  onCancelSignature,
}: DigitalSignaturePanelProps) {
  const [selectedMethod, setSelectedMethod] = useState<SignatureMethod>(
    SignatureMethod.SIMPLE,
  );
  const [sending, setSending] = useState<string | null>(null);

  // Mock signature statuses based on contract parties
  // In a real implementation, this would come from the Signature model
  const mockSignatureStatuses: PartySignatureStatus[] = contract.parties.map(
    (party) => ({
      partyId: party.id,
      name: party.name,
      status: SignatureStatus.PENDING, // Default status
      signedAt: undefined,
      method: undefined,
    }),
  );

  const getStatusIcon = (status: SignatureStatus) => {
    switch (status) {
      case SignatureStatus.SIGNED:
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case SignatureStatus.PENDING:
      case SignatureStatus.SENT:
        return <Clock className="w-5 h-5 text-amber-500" />;
      case SignatureStatus.REJECTED:
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusText = (status: SignatureStatus) => {
    switch (status) {
      case SignatureStatus.SIGNED:
        return "Assinado";
      case SignatureStatus.PENDING:
        return "Pendente";
      case SignatureStatus.SENT:
        return "Enviado";
      case SignatureStatus.REJECTED:
        return "Recusado";
      default:
        return "Desconhecido";
    }
  };

  const getStatusColor = (status: SignatureStatus) => {
    switch (status) {
      case SignatureStatus.SIGNED:
        return "bg-green-50 border-green-200 text-green-700";
      case SignatureStatus.PENDING:
        return "bg-gray-50 border-gray-200 text-gray-600";
      case SignatureStatus.SENT:
        return "bg-blue-50 border-blue-200 text-blue-700";
      case SignatureStatus.REJECTED:
        return "bg-red-50 border-red-200 text-red-700";
      default:
        return "bg-gray-50 border-gray-200 text-gray-600";
    }
  };

  const handleSendSignature = (partyId: string) => {
    setSending(partyId);
    setTimeout(() => {
      onSendForSignature?.(selectedMethod, partyId);
      setSending(null);
    }, 1000);
  };

  // Convert mock statuses to match our enum values for comparison
  const overallStatus = mockSignatureStatuses.every(
    (s) => s.status === SignatureStatus.SIGNED,
  )
    ? "fully_signed"
    : mockSignatureStatuses.some((s) => s.status === SignatureStatus.SIGNED)
      ? "partially_signed"
      : mockSignatureStatuses.some((s) => s.status !== SignatureStatus.PENDING)
        ? "pending_signature"
        : "pending";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Assinatura Digital
          </h3>
          <p className="text-sm text-gray-500">
            Gerencie a assinatura do contrato
          </p>
        </div>
        <div
          className={cn(
            "px-3 py-1 rounded-full text-sm font-medium",
            overallStatus === "fully_signed" && "bg-green-100 text-green-700",
            overallStatus === "partially_signed" && "bg-blue-100 text-blue-700",
            overallStatus === "pending_signature" &&
              "bg-amber-100 text-amber-700",
            overallStatus === "pending" && "bg-gray-100 text-gray-600",
          )}
        >
          {overallStatus === "fully_signed" && "Totalmente Assinado"}
          {overallStatus === "partially_signed" && "Parcialmente Assinado"}
          {overallStatus === "pending_signature" && "Aguardando Assinatura"}
          {overallStatus === "pending" && "Pendente"}
        </div>
      </div>

      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              {/* Using a placeholder title since Contract type doesn't have title yet */}
              <p className="font-medium text-gray-900">
                Contrato #{contract.id}
              </p>
              <p className="text-sm text-gray-500">
                {contract.parties.length} parte
                {contract.parties.length > 1 ? "s" : ""} envolvida
                {contract.parties.length > 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onViewDocument}>
              <Eye className="w-4 h-4 mr-1" />
              Visualizar
            </Button>
            <Button variant="outline" size="sm" onClick={onDownloadDocument}>
              <Download className="w-4 h-4 mr-1" />
              Baixar
            </Button>
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Partes que devem assinar</h4>

        {mockSignatureStatuses.map((party, index) => (
          <div
            key={party.partyId}
            className={cn(
              "rounded-lg border p-4",
              getStatusColor(party.status),
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon(party.status)}
                <div>
                  <p className="font-medium text-gray-900">{party.name}</p>
                  <p className="text-sm text-gray-500">
                    {getStatusText(party.status)}
                    {party.signedAt && (
                      <>
                        {" "}
                        • {new Date(party.signedAt).toLocaleDateString("pt-BR")}
                      </>
                    )}
                    {party.method && (
                      <>
                        {" "}
                        •{" "}
                        {party.method === SignatureMethod.SIMPLE
                          ? "Link Simples"
                          : "Certificado Digital"}
                      </>
                    )}
                  </p>
                </div>
              </div>

              {party.status === SignatureStatus.PENDING && (
                <div className="flex gap-2">
                  <select
                    value={selectedMethod}
                    onChange={(e) =>
                      setSelectedMethod(e.target.value as SignatureMethod)
                    }
                    className="text-sm border rounded-md px-2 py-1 bg-white"
                  >
                    <option value={SignatureMethod.SIMPLE}>Link Simples</option>
                    <option value={SignatureMethod.DIGITAL_CERTIFICATE}>
                      Certificado Digital
                    </option>
                  </select>
                  <Button
                    size="sm"
                    onClick={() => handleSendSignature(party.partyId)}
                    disabled={sending === party.partyId}
                  >
                    {sending === party.partyId ? (
                      <Clock className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 mr-1" />
                    )}
                    Enviar
                  </Button>
                </div>
              )}

              {party.status === SignatureStatus.SENT && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onCancelSignature?.(party.partyId)}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Cancelar
                  </Button>
                </div>
              )}

              {party.status === SignatureStatus.SIGNED && (
                <div className="flex items-center gap-1 text-green-600">
                  <Pen className="w-4 h-4" />
                  <span className="text-sm font-medium">Assinado</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">
          Métodos de assinatura disponíveis
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => setSelectedMethod(SignatureMethod.SIMPLE)}
            className={cn(
              "flex items-center gap-2 p-3 rounded-lg border transition-colors",
              selectedMethod === SignatureMethod.SIMPLE
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300",
            )}
          >
            <Mail className="w-5 h-5 text-gray-600" />
            <div className="text-left">
              <p className="font-medium text-sm">Link Simples</p>
              <p className="text-xs text-gray-500">Por e-mail ou WhatsApp</p>
            </div>
          </button>

          <button
            onClick={() =>
              setSelectedMethod(SignatureMethod.DIGITAL_CERTIFICATE)
            }
            className={cn(
              "flex items-center gap-2 p-3 rounded-lg border transition-colors",
              selectedMethod === SignatureMethod.DIGITAL_CERTIFICATE
                ? "border-purple-500 bg-purple-50"
                : "border-gray-200 hover:border-gray-300",
            )}
          >
            <Pen className="w-5 h-5 text-gray-600" />
            <div className="text-left">
              <p className="font-medium text-sm">Certificado</p>
              <p className="text-xs text-gray-500">ICP-Brasil</p>
            </div>
          </button>
        </div>
      </div>

      <div className="text-sm text-gray-500">
        <p>
          Ao clicar em "Enviar", um link de assinatura será enviado para o
          e-mail ou WhatsApp do assinante. O documento será aberto em uma nova
          aba para assinatura digital.
        </p>
      </div>
    </div>
  );
}
