"use client";

import React, { useState } from "react";
import { 
  Palette, 
  Globe, 
  Mail, 
  Upload, 
  Eye, 
  Save, 
  CheckCircle2, 
  Info,
  Type,
  Layout
} from "lucide-react";

/**
 * PAINEL DE CONFIGURAÇÃO WHITE LABEL - imobWeb 2026
 * Interface para que o Parceiro/Revendedor configure sua própria infra.
 */

export const WhiteLabelSettings: React.FC = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 1500);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 p-2">
      <div className="flex items-center justify-between border-b border-slate-100 pb-8 dark:border-slate-800">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">White Label <span className="text-indigo-600">Pro</span></h1>
          <p className="text-slate-500 text-sm mt-1">Personalize cada detalhe da sua plataforma imobiliária independente.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-8 py-3.5 text-sm font-black text-white shadow-xl shadow-indigo-500/20 transition-all hover:bg-slate-900 disabled:opacity-50"
        >
          {isSaving ? "SALVANDO..." : success ? <><CheckCircle2 size={18}/> SALVO!</> : <><Save size={18}/> SALVAR ALTERAÇÕES</>}
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Branding Visual */}
        <div className="rounded-[2.5rem] border border-slate-200 bg-white p-10 dark:border-slate-800 dark:bg-slate-900/50 space-y-8">
          <div className="flex items-center gap-3">
             <Palette className="text-indigo-600" size={24} />
             <h3 className="text-xl font-bold text-slate-900 dark:text-white">Identidade Visual</h3>
          </div>

          <div className="space-y-6">
            <div className="grid gap-4">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Logo Principal (Light/Dark)</label>
              <div className="flex gap-4">
                <div className="flex-1 rounded-2xl border-2 border-dashed border-slate-100 p-8 flex flex-col items-center justify-center text-slate-400 hover:border-indigo-400 hover:bg-indigo-50/10 transition-all cursor-pointer">
                  <Upload size={24} className="mb-2" />
                  <span className="text-[10px] font-bold">PNG/SVG LIGHT</span>
                </div>
                <div className="flex-1 rounded-2xl border-2 border-dashed border-slate-100 p-8 flex flex-col items-center justify-center text-slate-400 hover:border-indigo-400 hover:bg-indigo-50/10 transition-all cursor-pointer bg-slate-100/50">
                  <Upload size={24} className="mb-2" />
                  <span className="text-[10px] font-bold">PNG/SVG DARK</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Cor Primária</label>
                <div className="flex items-center gap-3">
                  <input type="color" defaultValue="#6366f1" className="h-12 w-12 rounded-xl bg-transparent transition-all cursor-pointer" />
                  <span className="font-mono text-sm font-bold text-slate-600">#6366F1</span>
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Cor Accent</label>
                <div className="flex items-center gap-3">
                  <input type="color" defaultValue="#fbbf24" className="h-12 w-12 rounded-xl bg-transparent transition-all cursor-pointer" />
                  <span className="font-mono text-sm font-bold text-slate-600">#FBBF24</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Custom Domain & SEO */}
        <div className="rounded-[2.5rem] border border-slate-200 bg-white p-10 dark:border-slate-800 dark:bg-slate-900/50 space-y-8">
          <div className="flex items-center gap-3">
             <Globe className="text-indigo-600" size={24} />
             <h3 className="text-xl font-bold text-slate-900 dark:text-white">Infraestrutura Edge</h3>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Domínio Customizado</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="crm.suaimobiliaria.com.br"
                  className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 focus:bg-white transition-all dark:bg-slate-800 dark:border-slate-700"
                />
              </div>
              <div className="rounded-xl bg-indigo-50 p-4 border border-indigo-100 dark:bg-indigo-950/30 dark:border-indigo-900">
                <div className="flex gap-3">
                   <Info className="text-indigo-600 shrink-0" size={16} />
                   <p className="text-[10px] font-bold text-indigo-600 leading-relaxed uppercase tracking-tight">
                    APONTE UM REGISTRO 'CNAME' PARA 'edge-proxy.imobweb.com.br' NO SEU PROVEDOR DE DNS PARA ATIVAR O SSL AUTOMÁTICO.
                   </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Nome da Plataforma (Branding)</label>
              <input 
                type="text" 
                defaultValue="ImobMaster Pro"
                className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 focus:bg-white transition-all dark:bg-slate-800 dark:border-slate-700"
              />
            </div>
          </div>
        </div>

        {/* SMTP Dinâmico */}
        <div className="rounded-[2.5rem] border border-slate-200 bg-white p-10 dark:border-slate-800 dark:bg-slate-900/50 space-y-8 lg:col-span-2">
          <div className="flex items-center gap-3">
             <Mail className="text-indigo-600" size={24} />
             <h3 className="text-xl font-bold text-slate-900 dark:text-white">Servidor de E-mail (SMTP Próprio)</h3>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
             <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Host SMTP</label>
               <input className="w-full rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm font-bold outline-none focus:border-indigo-500 dark:bg-slate-800" placeholder="smtp.sendgrid.net" />
             </div>
             <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">E-mail Remetente</label>
               <input className="w-full rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm font-bold outline-none focus:border-indigo-500 dark:bg-slate-800" placeholder="contato@suamarca.com.br" />
             </div>
             <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Senha / API Key</label>
               <input type="password" className="w-full rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm font-bold outline-none focus:border-indigo-500 dark:bg-slate-800" defaultValue="**********" />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
