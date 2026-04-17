import { FieldModeDashboard } from '@/components/field-mode/FieldModeDashboard';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Modo Campo | ImobWeb 2026',
  description: 'Interface otimizada para corretores em campo - GPS, Voz e IA.',
};

/**
 * FIELD MODE PAGE - IMOBWEB 2026
 * Entry point for mobile-first field operations
 */
export default function FieldModePage() {
  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 lg:relative lg:z-0 lg:h-full lg:rounded-3xl lg:overflow-hidden lg:shadow-2xl">
      <FieldModeDashboard />
    </div>
  );
}
