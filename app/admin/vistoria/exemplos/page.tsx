'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Loader2, ArrowLeft, Eye, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ExemplosPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const generatePdf = async (example: string) => {
    setLoading(example);
    try {
      const res = await fetch('/api/admin/vistoria/examples');
      const data = await res.json();

      if (data.success) {
        const exampleData = example === '1' ? data.examples[0].data : data.examples[1].data;

        const pdfRes = await fetch('/api/admin/vistoria/generate-pdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(exampleData),
        });

        const pdfData = await pdfRes.json();

        if (pdfData.success && pdfData.html) {
          const w = window.open('', '_blank');
          if (w) {
            w.document.write(pdfData.html);
            w.document.close();
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/10 flex items-center justify-center border border-purple-500/10">
              <Eye className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">Exemplos de Laudo</h1>
              <p className="text-xs text-slate-500">Gere 2 laudos de exemplo para visualizar o resultado</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Example 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-3xl border border-white/5 bg-white/[0.02] overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 flex items-center justify-center border border-cyan-500/10">
                    <FileText className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Exemplo 1</h3>
                    <p className="text-[11px] text-slate-500">Sala Comercial</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-400 mb-4">
                  <p><span className="text-slate-500">Imóvel:</span> EDIFÍCIO COLUMBUS TOWER I</p>
                  <p><span className="text-slate-500">Tipo:</span> Sala Comercial · 35m²</p>
                  <p><span className="text-slate-500">Cômodos:</span> Sala, Copa, Banheiro</p>
                  <p><span className="text-slate-500">Fotos:</span> 13 (com anotações)</p>
                  <p><span className="text-slate-500">Vistoriadora:</span> Mônica Barbosa</p>
                </div>

                <Button
                  onClick={() => generatePdf('1')}
                  disabled={loading === '1'}
                  className="w-full rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-xs font-bold h-10"
                >
                  {loading === '1' ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Eye className="w-3.5 h-3.5 mr-1.5" />}
                  {loading === '1' ? 'Gerando...' : 'Gerar e Visualizar'}
                </Button>
              </div>
            </motion.div>

            {/* Example 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-3xl border border-white/5 bg-white/[0.02] overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 flex items-center justify-center border border-amber-500/10">
                    <FileText className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Exemplo 2</h3>
                    <p className="text-[11px] text-slate-500">Apartamento Residencial</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-400 mb-4">
                  <p><span className="text-slate-500">Imóvel:</span> CONDOMÍNIO SAINT PIERRE</p>
                  <p><span className="text-slate-500">Tipo:</span> Apartamento · 87m² · 18º andar</p>
                  <p><span className="text-slate-500">Cômodos:</span> 8 (Entrada, Sala, Cozinha, etc.)</p>
                  <p><span className="text-slate-500">Fotos:</span> 27 (com anotações)</p>
                  <p><span className="text-slate-500">Vistoriadora:</span> Mônica Barbosa</p>
                </div>

                <Button
                  onClick={() => generatePdf('2')}
                  disabled={loading === '2'}
                  className="w-full rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white text-xs font-bold h-10"
                >
                  {loading === '2' ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Eye className="w-3.5 h-3.5 mr-1.5" />}
                  {loading === '2' ? 'Gerando...' : 'Gerar e Visualizar'}
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
