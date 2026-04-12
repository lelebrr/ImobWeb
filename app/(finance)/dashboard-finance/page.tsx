import React from "react";
import FinancialDashboard from "@/components/finance/FinancialDashboard";

/**
 * Rota: /finance/dashboard
 * 
 * Página de entrada para o controle financeiro da imobiliária.
 */
export default function FinanceDashboardPage() {
  return (
    <div className="flex-1 overflow-auto bg-slate-50/50 dark:bg-slate-950/50">
      <FinancialDashboard />
    </div>
  );
}
