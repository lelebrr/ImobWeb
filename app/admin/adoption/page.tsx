'use client';

import React from 'react';
import { 
  Users, 
  Rocket, 
  MessageSquare, 
  Building2, 
  AlertCircle,
  TrendingUp,
  Download,
  Filter,
  MoreVertical
} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const teamAdoption = [
  { name: 'Ana Silva', role: 'Corretora', onboarding: 100, features: 85, status: 'ACTIVE' },
  { name: 'Bernardo Costa', role: 'Corretor', onboarding: 40, features: 20, status: 'STRUGGLING' },
  { name: 'Carla Lima', role: 'Gerente', onboarding: 100, features: 95, status: 'ACTIVE' },
  { name: 'Diego Neves', role: 'Corretor', onboarding: 15, features: 5, status: 'AT_RISK' },
];

/**
 * Dashboard de Adoção para Administradores.
 * Permite que donos de imobiliárias visualizem o engajamento do time.
 */
export default function AdoptionDashboardPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-white">Gestão de Adoção</h1>
          <p className="text-slate-500">Acompanhe como seu time está utilizando as ferramentas do imobWeb.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" className="border-slate-800 gap-2">
             <Download className="w-4 h-4" /> Exportar
           </Button>
           <Button className="bg-indigo-600 hover:bg-indigo-500 gap-2">
             <Rocket className="w-4 h-4" /> Agendar Treinamento
           </Button>
        </div>
      </header>

      {/* Global Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Ativação Média', value: '72%', icon: TrendingUp, color: 'text-emerald-400' },
          { title: 'Onboarding Concluído', value: '3/4', icon: Users, color: 'text-indigo-400' },
          { title: 'IA WhatsApp Ativa', value: '88%', icon: MessageSquare, color: 'text-cyan-400' },
          { title: 'Risco de Churn (Equipe)', value: '12%', icon: AlertCircle, color: 'text-rose-400' },
        ].map((stat, i) => (
          <Card key={i} className="bg-slate-900/50 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold text-slate-500 uppercase">{stat.title}</CardTitle>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-white">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Team List Table */}
        <Card className="lg:col-span-2 bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Saúde do Onboarding por Membro</CardTitle>
              <CardDescription>Métricas individuais de adoção de funcionalidades.</CardDescription>
            </div>
            <Button variant="ghost" size="icon"><Filter className="w-4 h-4" /></Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
               {teamAdoption.map((member, i) => (
                 <div key={i} className="flex items-center justify-between p-4 bg-slate-950/40 rounded-2xl border border-slate-800/60 transition-all hover:bg-slate-950/60">
                    <div className="flex items-center gap-4 min-w-[200px]">
                       <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-indigo-400">
                          {member.name[0]}
                       </div>
                       <div>
                          <p className="font-bold text-white text-sm">{member.name}</p>
                          <p className="text-xs text-slate-500">{member.role}</p>
                       </div>
                    </div>
                    
                    <div className="hidden md:flex flex-col gap-1 flex-1 px-8">
                       <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                          <span>Adoção</span>
                          <span>{member.features}%</span>
                       </div>
                       <Progress value={member.features} className="h-1.5" />
                    </div>

                    <div className="flex items-center gap-4">
                       <Badge className={
                         member.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                         member.status === 'STRUGGLING' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                         'bg-rose-500/10 text-rose-500 border-rose-500/20'
                       }>
                         {member.status}
                       </Badge>
                       <Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4 text-slate-600" /></Button>
                    </div>
                 </div>
               ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Center */}
        <div className="space-y-6">
           <Card className="bg-indigo-900/10 border-indigo-500/30">
              <CardHeader>
                 <CardTitle className="text-white flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-indigo-400" />
                    Intervenções Sugeridas
                 </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800 space-y-2">
                    <p className="text-sm font-bold text-slate-200">Diego Neves ainda não conectou o WhatsApp.</p>
                    <p className="text-xs text-slate-500">Usuários sem WhatsApp têm 78% menos leads.</p>
                    <Button variant="link" className="p-0 h-auto text-indigo-400 text-xs">Enviar lembrete proativo</Button>
                 </div>
                 <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800 space-y-2">
                    <p className="text-sm font-bold text-slate-200">Treinamento de Equipe</p>
                    <p className="text-xs text-slate-500">3 membros não viram o vídeo de gestão de portais.</p>
                    <Button variant="link" className="p-0 h-auto text-indigo-400 text-xs">Marcar webinar rápido</Button>
                 </div>
              </CardContent>
           </Card>

           <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                 <CardTitle className="text-sm">Configuração de Alertas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-xs">
                     <span className="text-slate-400">Notificar quando ativação &lt; 50%</span>
                     <div className="w-8 h-4 bg-indigo-600 rounded-full relative">
                        <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full" />
                     </div>
                  </div>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
