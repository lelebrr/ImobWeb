// lib/finance/fiscal-service.ts
// Serviço de integração contábil brasileira: NFS-e, exportações e retenções

import { Invoice, FiscalReport, FiscalReportType } from "@/types/finance";

/**
 * Emite uma Nota Fiscal de Serviços Eletrônica (NFS-e)
 * @param invoice Dados da fatura a ser emitida
 * @returns Objeto com número da NFS-e e XML (simulado)
 */
export async function issueNFSe(invoice: Invoice): Promise<{
  nfsNumber: string;
  xmlData: string;
  status: "SUCCESS" | "ERROR";
  message?: string;
}> {
  // Simulação de chamada a webservice da prefeitura
  // Em produção, integrar com o webservice da cidade (ex: São Paulo, Rio de Janeiro, etc.)
  try {
    // Aqui seria a chamada real
    const nfsNumber = `NFSE${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const xmlData = `<?xml version="1.0" encoding="UTF-8"?>
<NFe xmlns="http://www.portalfiscal.inf.br/nfe">
  <infNFe Id="NFe${nfsNumber}" versao="4.00">
    <ide>
      <cUF>35</cUF>
      <cNF>${Math.floor(Math.random() * 999999999)}</cNF>
      <natOp>Serviços</natOp>
      <mod>55</mod>
      <serie>1</serie>
      <nNF>${Math.floor(Math.random() * 9999)}</nNF>
      <dhEmi>${new Date().toISOString()}</dhEmi>
      <tpNF>1</tpNF>
      <idDest>1</idDest>
      <cMunFG>3550308</cMunFG>
      <tpImp>1</tpImp>
      <tpEmis>1</tpEmis>
      <cDV>${Math.floor(Math.random() * 10)}</cDV>
      <tpAmb>2</tpAmb>
      <finNFe>1</finNFe>
      <indFinal>1</indFinal>
      <indPres>1</indPres>
      <procEmi>0</procEmi>
      <verProc>1.0.0</verProc>
    </ide>
    <emit>
      <CNPJ>${invoice.agencyId.padStart(14, "0")}</CNPJ>
      <xNome>ImobWeb Ltda.</xNome>
      <xFant>ImobWeb</xFant>
      <enderEmit>
        <xLgr>Av. das Nações</xLgr>
        <nro>123</nro>
        <xBairro>Centro</xBairro>
        <cMun>3550308</cMun>
        <xMun>São Paulo</xMun>
        <UF>SP</UF>
        <CEP>01000000</CEP>
        <cPais>1058</cPais>
        <xPais>BRASIL</xPais>
        <fone>1133334444</fone>
      </enderEmit>
      <IE>123456789</IE>
      <CRT>3</CRT>
    </emit>
    <dest>
      <CNPJ>${"00000000000000".padStart(14, "0")}</CNPJ>
      <xNome>Cliente Exemplo</xNome>
      <enderDest>
        <xLgr>Rua Exemplo</xLgr>
        <nro>456</nro>
        <xBairro>Jardim</xBairro>
        <cMun>3550308</cMun>
        <xMun>São Paulo</xMun>
        <UF>SP</UF>
        <CEP>01000000</CEP>
        <cPais>1058</cPais>
        <xPais>BRASIL</xPais>
        <fone>11999998888</fone>
      </enderDest>
      <indIEDest>9</indIEDest>
    </dest>
    <det nItem="1">
      <prod>
        <cProd>SERV001</cProd>
        <xDesc>Serviço de intermediação imobiliária</xDesc>
        <NCM>00000000</NCM>
        <CFOP>6.93</CFOP>
        <uCom>UN</uCom>
        <qCom>1</qCom>
        <vUnCom>${invoice.value.toFixed(2)}</vUnCom>
        <vProd>${invoice.value.toFixed(2)}</vProd>
        <cEANTrib>SEM GTIN</cEANTrib>
        <uTrib>UN</uTrib>
        <qTrib>1</qTrib>
        <vUnTrib>${invoice.value.toFixed(2)}</vUnTrib>
        <vTrib>${invoice.value.toFixed(2)}</vTrib>
        <indTot>1</indTot>
      </prod>
      <imposto>
        <ISSQN>
          <vBC>${invoice.value.toFixed(2)}</vBC>
          <vAliq>${((invoice.taxes.iss / invoice.value) * 100).toFixed(2)}</vAliq>
          <vISSQN>${invoice.taxes.iss.toFixed(2)}</vISSQN>
        </ISSQN>
      </imposto>
    </det>
    <total>
      <ICMSTot>
        <vBC>${invoice.value.toFixed(2)}</vBC>
        <vICMS>0.00</vICMS>
        <vICMSDeson>0.00</vICMSDeson>
        <vFCP>0.00</vFCP>
        <vBCST>0.00</vBCST>
        <vST>0.00</vST>
        <vFCPST>0.00</vFCPST>
        <vST>0.00</vST>
        <vProd>${invoice.value.toFixed(2)}</vProd>
        <vFrete>0.00</vFrete>
        <vSeg>0.00</vSeg>
        <vDesc>0.00</vDesc>
        <vII>0.00</vII>
        <vIPI>0.00</vIPI>
        <vIPIDevol>0.00</vIPIDevol>
        <vPIS>${invoice.taxes.pis.toFixed(2)}</vPIS>
        vCOFINS>${invoice.taxes.cofins.toFixed(2)}</vCOFINS>
        <vOutro>0.00</vOutro>
        <vNF>${invoice.totalValue.toFixed(2)}</vNF>
      </ICMSTot>
    </total>
    <transp>
      <modFrete>9</modFrete>
    </transp>
    <pag>
      <detPag>
        <tPag>01</tPag>
        <vPag>${invoice.totalValue.toFixed(2)}</vPag>
      </detPag>
    </pag>
    <infAdic>
      <infCpl>Nota fiscal eletrônica de serviços emitida pelo sistema ImobWeb.</infCpl>
    </infAdic>
  </infNFe>
</NFe>`;
    return {
      nfsNumber,
      xmlData,
      status: "SUCCESS",
    };
  } catch (error) {
    console.error("Erro ao emitir NFS-e:", error);
    return {
      nfsNumber: "",
      xmlData: "",
      status: "ERROR",
      message: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

/**
 * Exporta dados para o sistema Omie (contabilidade)
 * @param data Dados a serem exportados (faturas, comissões, etc.)
 */
export async function exportToOmie(data: any): Promise<{
  success: boolean;
  response?: any;
  error?: string;
}> {
  try {
    // Simulação de chamada à API do Omie
    // Real: POST https://app.omie.com.br/api/v1/geral/financas/
    const response = {
      codigo: 0,
      mensagem: "Dados importados com sucesso",
      dados: {
        cod_lancamento: Math.floor(Math.random() * 1000000),
      },
    };
    return { success: true, response };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

/**
 * Exporta dados para o ContaAzul
 */
export async function exportToContaAzul(data: any): Promise<{
  success: boolean;
  response?: any;
  error?: string;
}> {
  try {
    // Simulação de chamada à API do ContaAzul
    const response = {
      id: Math.floor(Math.random() * 1000000),
      status: "imported",
    };
    return { success: true, response };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

/**
 * Exporta dados para o Nibo
 */
export async function exportToNibo(data: any): Promise<{
  success: boolean;
  response?: any;
  error?: string;
}> {
  try {
    // Simulação de chamada à API do Nibo
    const response = {
      receipt_id: Math.floor(Math.random() * 1000000),
      message: "Importado com sucesso",
    };
    return { success: true, response };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

/**
 * Exporta dados para o QuickBooks Online
 */
export async function exportToQuickBooks(data: any): Promise<{
  success: boolean;
  response?: any;
  error?: string;
}> {
  try {
    // Simulação de chamada à API do QuickBooks
    const response = {
      Invoice: {
        Id: Math.floor(Math.random() * 1000000).toString(),
        SyncToken: "0",
        metadata: {
          CreateTime: new Date().toISOString(),
          LastUpdatedTime: new Date().toISOString(),
        },
      },
    };
    return { success: true, response };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

/**
 * Calcula retenções fiscais com base no valor e na legislação vigente
 * @param valorBruto Valor bruto do serviço
 * @param cidade Código da cidade (IBGE) para determinar alíquota de ISS
 * @returns Objeto com valores das retenções
 */
export function calculateRetentions(
  valorBruto: number,
  cidadeCodigoIBGE: number,
): {
  iss: number;
  irrf: number;
  pis: number;
  cofins: number;
  csll: number;
  totalRetencoes: number;
  valorLiquido: number;
} {
  // Alíquotas simplificadas (variam por cidade e regime)
  // ISS: geralmente entre 2% e 5%
  let issAliquota = 0.03; // 3% padrão
  if (cidadeCodigoIBGE === 3550308) {
    // São Paulo
    issAliquota = 0.02; // 2% para serviços em SP (exemplo)
  } else if (cidadeCodigoIBGE === 3304557) {
    // Rio de Janeiro
    issAliquota = 0.05; // 5%
  }

  const iss = valorBruto * issAliquota;

  // IRRF: tributação apenas se valor > R$ 1.903,98 e conforme tabela progressiva simplificada
  let irrf = 0;
  if (valorBruto > 1903.98) {
    // Alíquota simplificada de 7,5% para faixa até R$ 2.826,65 (exemplo)
    irrf = valorBruto * 0.075;
    // Pode deduzir parcela a deduzir, mas simplificamos
  }

  // PIS: 0,65% sobre receita bruta (regime cumulativo ou não cumulativo)
  const pis = valorBruto * 0.0065;

  // COFINS: 3% sobre receita bruta
  const cofins = valorBruto * 0.03;

  // CSLL: 1% sobre receita bruta (exemplo)
  const csll = valorBruto * 0.01;

  const totalRetencoes = iss + irrf + pis + cofins + csll;
  const valorLiquido = valorBruto - totalRetencoes;

  return {
    iss,
    irrf,
    pis,
    cofins,
    csll,
    totalRetencoes,
    valorLiquido,
  };
}

/**
 * Gera relatório fiscal para entrega ao contador
 * @param agencyId ID da imobiliária
 * @param type Tipo do relatório
 * @param referenceMonth Mês de referência (1-12)
 * @param referenceYear Ano de referência
 * @param generatedBy ID do usuário que gerou
 */
export async function generateFiscalReport(
  agencyId: string,
  type: FiscalReportType,
  referenceMonth: number,
  referenceYear: number,
  generatedBy: string,
): Promise<FiscalReport> {
  // Simulação: buscar dados do banco e gerar relatório
  // Aqui seria chamada a serviços de relatório ou consulta direta ao Prisma
  const report: FiscalReport = {
    id: "", // será preenchido pelo banco
    agencyId,
    type,
    referenceMonth,
    referenceYear,
    generatedAt: new Date(),
    generatedBy,
    data: {
      // Estrutura varia conforme o tipo
      // Exemplo simplificado
      resumo: {
        totalFaturado: 0,
        totalRetido: 0,
        totalIss: 0,
        totalIrrf: 0,
        totalPis: 0,
        totalCofins: 0,
        totalCsll: 0,
      },
      lancamentos: [], // seria preenchido com os lançamentos do período
    },
    fileUrl: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  return report;
}

/**
 * Salva o relatório fiscal no banco de dados (via Prisma)
 * @param report Objeto FiscalReport a ser salvo
 */
export async function saveFiscalReport(
  report: FiscalReport,
): Promise<FiscalReport> {
  // Em integração real, usar Prisma client
  // Exemplo: return await prisma.fiscalReport.create({ data: report });
  // Simulação:
  report.id = `FR${Date.now()}`;
  report.createdAt = new Date();
  report.updatedAt = new Date();
  return report;
}

/**
 * Busca relatórios fiscais já gerados
 * @param agencyId ID da imobiliária
 * @param type Tipo do relatório (opcional)
 * @param limit Número máximo de resultados
 */
export async function listFiscalReports(
  agencyId: string,
  type?: FiscalReportType,
  limit: number = 10,
): Promise<FiscalReport[]> {
  // Simulação
  const reports: FiscalReport[] = [];
  for (let i = 0; i < Math.min(limit, 3); i++) {
    reports.push({
      id: `FR${Date.now() - i * 10000}`,
      agencyId,
      type: type ?? "SALES",
      referenceMonth: ((new Date().getMonth() - i) % 12) + 1,
      referenceYear: new Date().getFullYear() - Math.floor(i / 12),
      generatedAt: new Date(Date.now() - i * 86400000),
      generatedBy: "system",
      data: {},
      createdAt: new Date(Date.now() - i * 86400000),
      updatedAt: new Date(Date.now() - i * 86400000),
    });
  }
  return reports;
}
