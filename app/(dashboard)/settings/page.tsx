"use client";

import React, { useState } from "react";
import {
  User,
  Building2,
  Bell,
  Shield,
  Smartphone,
  Globe,
  Save,
  Mail,
  Phone,
  MapPin,
  Zap,
  ExternalLink,
  Key,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/design-system/button";
import { Input } from "@/components/design-system/input";
import { Badge } from "@/components/design-system/badge";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type TabType =
  | "profile"
  | "agency"
  | "integrations"
  | "notifications"
  | "security"
  | "seo";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("profile");

  const tabs = [
    { id: "profile" as const, icon: User, label: "Meu Perfil" },
    { id: "agency" as const, icon: Building2, label: "Imobiliária" },
    { id: "integrations" as const, icon: Zap, label: "Integrações IA" },
    { id: "notifications" as const, icon: Bell, label: "Notificações" },
    { id: "security" as const, icon: Shield, label: "Segurança" },
    { id: "seo" as const, icon: Globe, label: "Website & SEO" },
  ];

  return (
    <div className="space-y-8 pb-10 max-w-5xl">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter">
            Configurações
          </h1>
          <p className="text-muted-foreground font-medium">
            Gerencie seu perfil, equipe e integrações de automação.
          </p>
        </div>
        <Button className="shadow-lg shadow-primary/20 h-12 px-8 rounded-2xl font-black uppercase text-[10px] tracking-widest">
          <Save className="w-4 h-4 mr-2" /> Salvar Alterações
        </Button>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Tabs */}
        <div className="lg:col-span-1 space-y-2">
          {tabs.map((tab) => (
            <SettingsTab
              key={tab.id}
              icon={tab.icon}
              label={tab.label}
              active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            />
          ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 space-y-8">
          <TabContent activeTab={activeTab} />
        </div>
      </div>
    </div>
  );
}

function SettingsTab({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: any;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-5 py-4 rounded-2xl cursor-pointer transition-all duration-300 font-bold text-sm w-full text-left",
        active
          ? "bg-primary text-white shadow-lg shadow-primary/20"
          : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
      )}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

function TabContent({ activeTab }: { activeTab: TabType }) {
  const [showPassword, setShowPassword] = useState(false);

  switch (activeTab) {
    case "profile":
      return (
        <div className="glass border-none rounded-[2rem] p-8 space-y-8">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-3xl bg-primary flex items-center justify-center relative group cursor-pointer overflow-hidden">
              <span className="text-4xl font-black text-white">LC</span>
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold">Foto do Perfil</h3>
              <p className="text-muted-foreground text-sm font-medium">
                PNG ou JPG. Recomendado 512x512px.
              </p>
              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  variant="outline"
                  className="glass border-none h-10 px-4 rounded-xl text-xs font-bold uppercase"
                >
                  Upload
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-10 px-4 rounded-xl text-xs font-bold uppercase text-red-400 hover:text-red-500 hover:bg-red-500/10"
                >
                  Remover
                </Button>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                Nome Completo
              </label>
              <Input
                placeholder="Seu nome"
                defaultValue="Leonardo Camargo"
                className="glass border-none h-14 rounded-2xl font-bold shadow-inner"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                Email Profissional
              </label>
              <Input
                placeholder="seu@email.com"
                defaultValue="leonardo@imobweb.ai"
                className="glass border-none h-14 rounded-2xl font-bold shadow-inner"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                Telefone WhatsApp
              </label>
              <Input
                placeholder="+55 11 99999-9999"
                defaultValue="+55 11 99999-9999"
                className="glass border-none h-14 rounded-2xl font-bold shadow-inner"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                CRECI / Registo
              </label>
              <Input
                placeholder="000.000-F"
                defaultValue="123.456-F"
                className="glass border-none h-14 rounded-2xl font-bold shadow-inner"
              />
            </div>
          </div>
        </div>
      );

    case "agency":
      return (
        <div className="glass border-none rounded-[2rem] p-8 space-y-8">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center">
              <Building2 className="w-12 h-12 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Logo da Imobiliária</h3>
              <p className="text-muted-foreground text-sm font-medium">
                PNG ou JPG. Recomendado 512x512px.
              </p>
              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  variant="outline"
                  className="glass border-none h-10 px-4 rounded-xl text-xs font-bold uppercase"
                >
                  Upload
                </Button>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 col-span-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                Nome da Imobiliária
              </label>
              <Input
                placeholder="Nome da imobiliária"
                defaultValue="ImobWeb Imóveis"
                className="glass border-none h-14 rounded-2xl font-bold shadow-inner"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                CNPJ
              </label>
              <Input
                placeholder="00.000.000/0001-00"
                defaultValue="12.345.678/0001-90"
                className="glass border-none h-14 rounded-2xl font-bold shadow-inner"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                Telefone Fixo
              </label>
              <Input
                placeholder="(11) 3000-0000"
                defaultValue="(11) 3000-0000"
                className="glass border-none h-14 rounded-2xl font-bold shadow-inner"
              />
            </div>
            <div className="space-y-2 col-span-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                Endereço
              </label>
              <Input
                placeholder="Rua Example, 123 - Cidade - Estado"
                defaultValue="Av. Paulista, 1000 - São Paulo - SP"
                className="glass border-none h-14 rounded-2xl font-bold shadow-inner"
              />
            </div>
          </div>
        </div>
      );

    case "integrations":
      return (
        <div className="glass border-none rounded-[2rem] p-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-xl font-black tracking-tighter">
                Integração WhatsApp IA
              </h3>
              <p className="text-sm text-muted-foreground font-medium">
                A automação atende seus leads 24/7.
              </p>
            </div>
            <Badge className="bg-emerald-500/20 text-emerald-400 border-none px-3 py-1 font-black uppercase text-[10px] tracking-widest">
              Conectado
            </Badge>
          </div>
          <div className="space-y-4">
            <ToggleSetting
              label="Resposta Automática com IA"
              description="A IA incluirá conversas com leads de portais."
              checked
            />
            <ToggleSetting
              label="Atendimento em Feriados"
              description="Manter IA ativa fora do horário comercial."
              checked
            />
            <ToggleSetting
              label="Sugestão de Preços Ativa"
              description="A IA sugerirá valores baseados no mercado."
            />
          </div>
          <div className="mt-8 pt-8 border-t border-white/5">
            <Button
              variant="outline"
              className="w-full glass border-none h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest group"
            >
              <Smartphone className="w-4 h-4 mr-3 text-primary group-hover:scale-110 transition-transform" />
              Configurar Dispositivo WhatsApp{" "}
              <ExternalLink className="w-3.5 h-3.5 ml-auto opacity-40" />
            </Button>
          </div>
        </div>
      );

    case "notifications":
      return (
        <div className="glass border-none rounded-[2rem] p-8 space-y-8">
          <div>
            <h3 className="text-xl font-black tracking-tighter">
              Preferências de Notificações
            </h3>
            <p className="text-sm text-muted-foreground font-medium">
              Escolha como deseja ser notificado.
            </p>
          </div>
          <div className="space-y-4">
            <ToggleSetting
              label="Notificações Push"
              description="Receba notificações no navegador."
              checked
            />
            <ToggleSetting
              label="E-mail"
              description="Receba resumo diário por e-mail."
              checked
            />
            <ToggleSetting
              label="WhatsApp"
              description="Receba alertas importantes no WhatsApp."
              checked
            />
            <ToggleSetting
              label="Novo Lead"
              description="Notificação imediata quando um novo lead entrar em contato."
              checked
            />
            <ToggleSetting
              label="Proposta Recebida"
              description="Quando alguém enviar uma proposta."
              checked
            />
            <ToggleSetting
              label="Visita Agendada"
              description="Lembrete 1 hora antes de visitas."
              checked
            />
          </div>
        </div>
      );

    case "security":
      return (
        <div className="glass border-none rounded-[2rem] p-8 space-y-8">
          <div>
            <h3 className="text-xl font-black tracking-tighter">Segurança</h3>
            <p className="text-sm text-muted-foreground font-medium">
              Gerencie sua segurança.
            </p>
          </div>
          <div className="space-y-6">
            <div className="p-6 bg-white/5 rounded-2xl space-y-4">
              <h4 className="font-bold">Alterar Senha</h4>
              <div className="space-y-3">
                <Input
                  type="password"
                  placeholder="Senha atual"
                  className="h-12 rounded-xl"
                />
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Nova senha"
                    className="h-12 rounded-xl pr-10"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <Input
                  type="password"
                  placeholder="Confirmar nova senha"
                  className="h-12 rounded-xl"
                />
              </div>
              <Button className="h-10 rounded-xl font-bold text-xs uppercase">
                Atualizar Senha
              </Button>
            </div>
            <ToggleSetting
              label="Autenticação em 2 Fatores (2FA)"
              description="Adicione uma camada extra de segurança."
            />
            <ToggleSetting
              label="Login com Google"
              description="Permitir login com conta Google."
            />
          </div>
        </div>
      );

    case "seo":
      return (
        <div className="glass border-none rounded-[2rem] p-8 space-y-8">
          <div>
            <h3 className="text-xl font-black tracking-tighter">
              Website & SEO
            </h3>
            <p className="text-sm text-muted-foreground font-medium">
              Configure seu site e configurações de busca.
            </p>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                URL do Seu Site
              </label>
              <Input
                placeholder="https://"
                defaultValue="https://imobweb.com.br/seu-nome"
                className="glass border-none h-14 rounded-2xl font-bold shadow-inner"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                Título do Site
              </label>
              <Input
                placeholder="Título"
                defaultValue="ImobWeb Imóveis - Sua Imobiliária de Confiança"
                className="glass border-none h-14 rounded-2xl font-bold shadow-inner"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                Descrição
              </label>
              <textarea
                className="glass border-none h-24 rounded-2xl p-4 font-bold shadow-inner resize-none"
                placeholder="Descrição do seu site para buscas..."
                defaultValue="Especializada em imóveis para compra e venda. Encontre o imóvel dos seus sonhos com a melhor consultoria do mercado."
              />
            </div>
            <ToggleSetting
              label="Modo White Label"
              description="Remova a marca ImobWeb do seu site."
            />
            <ToggleSetting
              label="Domínio Próprio"
              description="Use seu próprio domínio."
            />
          </div>
        </div>
      );

    default:
      return null;
  }
}

function ToggleSetting({ label, description, checked }: any) {
  return (
    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
      <div className="max-w-[70%]">
        <p className="font-bold text-sm leading-tight">{label}</p>
        <p className="text-[10px] text-muted-foreground font-medium mt-1 uppercase tracking-tighter">
          {description}
        </p>
      </div>
      <Switch checked={checked} />
    </div>
  );
}
