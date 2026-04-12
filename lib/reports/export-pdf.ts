/**
 * PDF Export Utility for imobWeb Reports
 * Uses a 'Print-First' strategy with specialized CSS for high-fidelity exports.
 * Avoids heavy client-side libraries by leveraging native browser capabilities.
 */

export function exportReportToPDF(reportId: string) {
  if (typeof window === "undefined") return;

  // Track the export event
  console.log(`[Export] Triggering PDF export for report ${reportId}`);
  
  const printContent = document.getElementById(reportId);
  if (!printContent) {
    console.error(`[Export] Report element #${reportId} not found.`);
    return;
  }

  // Trigger native print which users can save as PDF
  // This is the most performance-optimized way in 2026 to get high-res charts
  window.print();
}

/**
 * Global CSS for Reports (should be added to a global style or report page)
 */
export const reportPrintStyles = `
  @media print {
    body * {
      visibility: hidden;
    }
    #report-container, #report-container * {
      visibility: visible;
    }
    #report-container {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
    }
    .no-print {
      display: none !important;
    }
    .page-break {
      page-break-before: always;
    }
  }
`;
