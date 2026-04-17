'use client';

import React from "react";
import { useAuth, useHasRole } from "@/providers/auth-provider";
import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/design-system/card";
import { ShieldAlert, Users, Building, Activity } from "lucide-react";

export default function AdminDashboardPage() {
  const { user, loading } = useAuth();
  const isAdmin = useHasRole(UserRole.PLATFORM_MASTER) || useHasRole(UserRole.ADMIN);

  if (loading) return <div>Carregando...</div>;

  if (!user || !isAdmin) {
    redirect("/dashboard");
    return null;
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-red-500/10 rounded-2xl">
          <ShieldAlert className="w-8 h-8 text-red-500" />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tighter">Painel de Controle da Plataforma</h1>
          <p className="text-muted-foreground font-medium">Gestão global do imobWeb (SuperAdmin)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass border-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold">Total de Agências</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black italic">--</div>
            <p className="text-xs text-muted-foreground font-medium">+0% desde o último mês</p>
          </CardContent>
        </Card>
        <Card className="glass border-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold">Usuários Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black italic">--</div>
            <p className="text-xs text-muted-foreground font-medium">Monitoramento em tempo real</p>
          </CardContent>
        </Card>
        <Card className="glass border-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold">Saúde do Sistema</CardTitle>
            <Activity className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-emerald-500">Operacional</div>
            <p className="text-xs text-muted-foreground font-medium">Todos os serviços OK</p>
          </CardContent>
        </Card>
      </div>

      <div className="p-12 border-2 border-dashed border-border/50 rounded-[2.5rem] flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center">
            <ShieldAlert className="w-8 h-8 text-muted-foreground" />
        </div>
        <div>
            <h2 className="text-xl font-bold">Área de Configuração Global</h2>
            <p className="text-muted-foreground max-w-sm mx-auto">Em breve: Gestão de planos, faturamento consolidado e monitoramento de infraestrutura.</p>
        </div>
      </div>
    </div>
  );
}
