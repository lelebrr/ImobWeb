"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Rocket, ShieldAlert, Zap, Search } from "lucide-react";

/**
 * DASHBOARD DE FEATURE FLAGS - imobWeb (Superadmin)
 * Permite gerenciar o rollout de novas funcionalidades
 */

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    // Carregar flags da API (Simulado para o exemplo)
    fetch("/api/settings/feature-flags")
      .then((res) => res.json())
      .then((data) => setFlags(data.flags))
      .catch(() => {
         // Mock para visualização inicial caso API não esteja pronta
         setFlags([
           { key: "white-label-v2", enabled: true, type: "release", percentage: 100, description: "Novo sistema de White Label com subdomínios SSL." },
           { key: "ai-price-suggestion", enabled: false, type: "experiment", percentage: 10, description: "Sugestão de preço baseada em IA para imóveis." },
           { key: "whatsapp-bulk-v2", enabled: true, type: "operational", percentage: 50, description: "Envio de mensagens em massa via WhatsApp." },
         ]);
      });
  }, []);

  const filteredFlags = flags.filter(f => f.key.includes(search.toLowerCase()));

  return (
    <div className="p-8 space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Feature Flags</h1>
          <p className="text-muted-foreground">Controle o rollout de funcionalidades em tempo real.</p>
        </div>
        <Button className="gap-2">
          <Zap className="h-4 w-4" /> Nova Flag
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Pesquisar por chave da flag..." 
          className="pl-10" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid gap-4">
        {filteredFlags.map((flag) => (
          <Card key={flag.key} className={flag.enabled ? "border-l-4 border-l-green-500" : "border-l-4 border-l-gray-300 opacity-75"}>
            <CardHeader className="flex flex-row items-center justify-between py-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">{flag.key}</CardTitle>
                  <Badge variant={flag.type === "release" ? "default" : "outline"}>
                    {flag.type.toUpperCase()}
                  </Badge>
                  {flag.percentage < 100 && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {flag.percentage}% ROLLOUT
                    </Badge>
                  )}
                </div>
                <CardDescription>{flag.description}</CardDescription>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right flex flex-col items-end gap-1">
                  <span className="text-xs font-medium text-muted-foreground uppercase">Status</span>
                  <Switch checked={flag.enabled} />
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {filteredFlags.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <ShieldAlert className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Nenhuma flag encontrada</h3>
          <p className="text-muted-foreground">Tente um termo de busca diferente ou crie uma nova flag.</p>
        </div>
      )}
    </div>
  );
}
