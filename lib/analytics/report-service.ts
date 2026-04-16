import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export class ReportService {
  /**
   * Exporta dados para Excel (.xlsx)
   */
  static exportToExcel(data: any[], fileName: string = 'relatorio-imobweb.xlsx') {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Dados');
    XLSX.writeFile(wb, fileName);
  }

  /**
   * Exporta a visualização atual para PDF
   * Captura o elemento HTML e gera um PDF WYSIWYG
   */
  static async exportToPdf(elementId: string, fileName: string = 'dashboard-imobweb.pdf') {
    const element = document.getElementById(elementId);
    if (!element) {
      console.error('Elemento para exportação PDF não encontrado:', elementId);
      return;
    }

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#f9fafb' // bg-gray-50
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(fileName);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
    }
  }

  /**
   * Gera um conjunto de dados mockados formatados para Excel
   */
  static prepareExcelData(stats: any) {
    // Formata os dados para serem amigáveis ao Excel
    return [
      { Métrica: 'Faturamento Total', Valor: stats.totalRevenue, Unidade: 'BRL' },
      { Métrica: 'Leads Totais', Valor: stats.totalLeads, Unidade: 'un' },
      { Métrica: 'Taxa de Conversão', Valor: stats.conversionRate, Unidade: '%' },
      { Métrica: 'Ticket Médio', Valor: stats.averageTicket, Unidade: 'BRL' },
    ];
  }
}
