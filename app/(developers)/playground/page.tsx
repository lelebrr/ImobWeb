"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "swagger-ui-react/swagger-ui.css";
import { Terminal, Shield, RefreshCw } from "lucide-react";

// Import SwaggerUI dinamicamente para evitar erros de SSR com window
const SwaggerUI = dynamic(() => import("swagger-ui-react"), { 
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center min-h-[600px] gap-4">
      <RefreshCw className="animate-spin text-indigo-500" size={40} />
      <p className="text-slate-500 animate-pulse">Carregando API Playground...</p>
    </div>
  )
});

/**
 * API Playground - Explorador Interativo de API (Swagger)
 * 2026 imobWeb Engineering
 */
export default function ApiPlayground() {
  const [spec, setSpec] = useState<any>(null);

  useEffect(() => {
    // Simula o fetch do openapi.json gerado pelo servidor
    const fetchSpec = async () => {
      try {
        const response = await fetch("/api/v1/openapi.json");
        const data = await response.json();
        setSpec(data);
      } catch (e) {
        // Mock fallback para demonstração imediata
        setSpec({
          openapi: "3.0.0",
          info: { title: "imobWeb API (Preview)", version: "1.0.0" },
          paths: {}
        });
      }
    };
    fetchSpec();
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="mx-auto max-w-7xl px-6 py-6 lg:px-8">
          <div className="flex items-center gap-3 mb-2">
            <Terminal className="text-indigo-500" size={20} />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">API Playground</h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400">
            Experimente nossos endpoints em tempo real. Você precisará de uma <span className="text-indigo-500 font-medium">API Key</span> válida para realizar testes.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
          {spec && (
            <div className="swagger-container dark:invert-[0.05] dark:hue-rotate-180">
              <SwaggerUI spec={spec} />
            </div>
          )}
        </div>

        <div className="mt-8 flex items-center gap-4 p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30">
          <Shield className="text-indigo-600 dark:text-indigo-400 flex-shrink-0" size={24} />
          <div className="text-sm text-indigo-900 dark:text-indigo-300">
            <p className="font-semibold">Ambiente de Testes</p>
            <p>O Playground utiliza dados reais da organização ativa. Tome cuidado ao realizar mutações via POST ou DELETE em ambientes de produção.</p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        /* Ajustes finos para o Swagger UI no tema do site */
        .swagger-ui .topbar { display: none; }
        .swagger-ui .info { margin: 20px 0; }
        .swagger-ui .scheme-container { 
          padding: 10px 0; 
          background: transparent; 
          box-shadow: none;
          border-bottom: 1px solid #e2e8f0;
        }
        .swagger-ui .opblock.opblock-get { border-color: #3b82f6; background: rgba(59, 130, 246, 0.05); }
        .swagger-ui .opblock.opblock-post { border-color: #10b981; background: rgba(16, 185, 129, 0.05); }
        /* Adicionar suporte a Dark Mode para Swagger exigiria uma folha de estilos customizada mais extensa */
      `}</style>
    </div>
  );
}
