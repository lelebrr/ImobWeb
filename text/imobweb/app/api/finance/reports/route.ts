/**
 * Finance Reports API - ImobWeb 2026
 * 
 * Gera exportações de faturamento em formatos aceitos por contadores.
 * Suporta CSV e XML (NFS-e padrão nacional).
 */

import { NextRequest, NextResponse } from "next/server";
import { AccountingManager } from "../../../lib/integrations/accounting-manager";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const format = searchParams.get("format") || "csv";
  const month = searchParams.get("month");

  const manager = new AccountingManager();

  // Mock de faturas para exportação
  const invoices = [
    { 
      id: "INV-100", 
      customerName: "Imobiliária Alpha", 
      customerDocument: "12345678000199", 
      value: 1500.00, 
      dueDate: "2026-04-01", 
      serviceDescription: "Licença ImobWeb",
      fiscalInfo: { issRate: 0.05, irrfValue: 22.5, csrfValue: 0 }
    },
    { 
      id: "INV-101", 
      customerName: "Broker Beta", 
      customerDocument: "98765432000100", 
      value: 800.00, 
      dueDate: "2026-04-02", 
      serviceDescription: "Licença ImobWeb",
      fiscalInfo: { issRate: 0.05, irrfValue: 12.0, csrfValue: 0 }
    }
  ];

  if (format === "csv") {
    const csvData = manager.exportToCSV(invoices);
    return new NextResponse(csvData, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename=relatorio_contabil_${month || 'mensal'}.csv`
      }
    });
  }

  if (format === "xml") {
    // Geração simplificada de XML para demonstração do padrão NFSe
    const xmlData = `<?xml version="1.0" encoding="UTF-8"?>
<EnviarLoteRpsEnvio xmlns="http://www.abrasf.org.br/nfse.xsd">
  <LoteRps Id="L1" versao="2.02">
    ${invoices.map(inv => `
    <Rps>
      <Descricao>${inv.serviceDescription}</Descricao>
      <Valor>${inv.value}</Valor>
      <Documento>${inv.customerDocument}</Documento>
    </Rps>`).join('')}
  </LoteRps>
</EnviarLoteRpsEnvio>`;

    return new NextResponse(xmlData, {
      headers: {
        "Content-Type": "application/xml",
        "Content-Disposition": `attachment; filename=nfse_lote_${month || 'mensal'}.xml`
      }
    });
  }

  return NextResponse.json({ error: "Formato inválido" }, { status: 400 });
}
