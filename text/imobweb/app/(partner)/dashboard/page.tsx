import React from "react";
import { PartnerDashboard } from "../../../components/partner/PartnerDashboard";

/**
 * PÁGINA DO PORTAL DO PARCEIRO - imobWeb
 * 2026 - Hub de Resell e Royalties
 */

export default function PartnerPortalPage() {
  return (
    <div className="min-h-screen bg-slate-50/30 dark:bg-slate-950 p-8 pt-24">
      <div className="mx-auto max-w-7xl">
        <PartnerDashboard />
      </div>
    </div>
  );
}
