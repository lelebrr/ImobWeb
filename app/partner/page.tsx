"use client";

import React from "react";
import { 
  Rocket, 
  ShieldCheck, 
  PieChart, 
  Zap, 
  ArrowRight,
  ChevronRight,
  Globe,
  Award,
  Users
} from "lucide-react";

/**
 * PÁGINA PÚBLICA DO PROGRAMA DE PARCEIROS - imobWeb 2026
 * Landing page de alta conversão para atrair novos revendedores e franquias.
 */

export default function PartnerProgramPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar Minimalista */}
      <nav className="flex h-20 items-center justify-between px-10 border-b border-slate-50">
         <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-600"></div>
            <span className="font-extrabold tracking-tighter text-xl text-slate-900">imobWeb <span className="text-indigo-600 leading-none">Partners</span></span>
         </div>
         <div className="flex items-center gap-8">
            <button className="text-sm font-bold text-slate-600 hover:text-indigo-600">Planos</button>
            <button className="text-sm font-bold text-slate-600 hover:text-indigo-600">Login Parceiro</button>
            <button className="rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-bold text-white hover:bg-slate-800">Seja um Parceiro</button>
         </div>
      </nav>

      {/* Hero Section */}
      <section className="py-24 px-10 text-center space-y-8">
         <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-indigo-600">
            <Rocket size={14} fill="currentColor" /> Nova Era do CRM Imobiliário
         </div>
         <h1 className="text-7xl font-black tracking-tight text-slate-900 max-w-4xl mx-auto leading-[1.05]">
           Crie seu Próprio <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Império SaaS</span> Imobiliário
         </h1>
         <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
           Revenda a tecnologia do imobWeb com sua marca, seu domínio e suporte total. Escalabilidade radical para redes de franquias e agências de marketing.
         </p>
         <div className="flex items-center justify-center gap-4">
            <button className="rounded-2xl bg-indigo-600 px-10 py-5 text-lg font-black text-white shadow-2xl shadow-indigo-500/30 hover:bg-slate-900 transition-all flex items-center gap-2">
              QUERO SER PARCEIRO <ArrowRight size={20} />
            </button>
            <button className="rounded-2xl border border-slate-200 px-10 py-5 text-lg font-bold text-slate-700 hover:bg-slate-50 transition-all">
              Agendar Demo
            </button>
         </div>
      </section>

      {/* Stats Grid */}
      <section className="bg-slate-50 py-20 px-10">
         <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { label: "Comissão Recorrente", value: "Até 30%", icon: <PieChart className="text-indigo-600" /> },
              { label: "Preço de Revenda", value: "White Label", icon: <ShieldCheck className="text-indigo-600" /> },
              { label: "Configuração", value: "Express", icon: <Zap className="text-indigo-600" /> },
            ].map((stat, i) => (
              <div key={i} className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100 space-y-4">
                 <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center">{stat.icon}</div>
                 <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">{stat.label}</h3>
                 <p className="text-3xl font-black text-slate-900">{stat.value}</p>
              </div>
            ))}
         </div>
      </section>

      {/* Extreme White Label Callout */}
      <section className="py-24 px-10 max-w-7xl mx-auto grid md:grid-cols-2 gap-20 items-center">
         <div className="space-y-6">
            <h2 className="text-5xl font-black tracking-tight text-slate-900 uppercase">White Label <br/><span className="text-indigo-600">Extremo</span></h2>
            <p className="text-lg text-slate-500 leading-relaxed">
              Nós desaparecemos para que você brilhe. Seus clientes nunca saberão que o imobWeb existe. Personalize tudo:
            </p>
            <ul className="space-y-4">
               {[
                 "Domínio próprio (crm.seu-site.com.br)",
                 "E-mails Transacionais com seu SMTP",
                 "Logo, Favicon e Cores 100% Brandeadas",
                 "Termos de Uso e Contratos Customizados"
               ].map((item, i) => (
                 <li key={i} className="flex items-center gap-3 font-bold text-slate-700">
                    <CheckCircleIcon /> {item}
                 </li>
               ))}
            </ul>
         </div>
         <div className="rounded-[3rem] bg-gradient-to-br from-indigo-600 to-violet-800 p-12 text-white shadow-2xl aspect-video flex flex-col justify-center">
            <div className="flex gap-2 mb-6 text-amber-400"><Award size={32} fill="currentColor" /></div>
            <h3 className="text-3xl font-black mb-4 uppercase tracking-tighter">O CRM número #1 para grandes redes.</h3>
            <p className="text-indigo-100 opacity-80 italic">"Com o imobWeb White Label, triplicamos nossa receita de serviços de marketing oferecendo o software como se fosse nosso."</p>
            <p className="mt-8 font-black text-sm uppercase tracking-widest">— Diretor, Rede Alpha Imobiliárias</p>
         </div>
      </section>
    </div>
  );
}

function CheckCircleIcon() {
  return (
    <div className="h-6 w-6 rounded-full bg-emerald-500 flex items-center justify-center text-white">
      <ChevronRight size={14} strokeWidth={4} />
    </div>
  );
}
