"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  CheckCircle2,
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

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
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-10 max-w-5xl"
    >
      {/* Header Section */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter">Configurações</h1>
          <p className="text-muted-foreground font-medium">
            Gerencie seu perfil, equipe e integrações de automação.
          </p>
        </div>
        <Button className="shadow-lg shadow-primary/20 h-12 px-8 rounded-2xl font-black uppercase text-[10px] tracking-widest">
          <Save className="w-4 h-4 mr-2" /> Salvar Alterações
        </Button>
      </motion.div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Tabs */}
        <motion.div variants={itemVariants} className="lg:col-span-1 space-y-2">
          {tabs.map((tab, idx) => (
            <motion.div
              key={tab.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <SettingsTab
                icon={tab.icon}
                label={tab.label}
                active={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Content Area */}
        <div className="lg:col-span-3 space-y-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <TabContent activeTab={activeTab} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
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
    <motion.button
      whileHover={{ x: active ? 0 : 4 }}
      whileTap={{ scale: 0.98 }}
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
    </motion.button>
  );
}

function TabContent({ activeTab }: { activeTab: TabType }) {
  const [showPassword, setShowPassword] = useState(false);

  switch (activeTab) {
    case "profile":
      return (
        <div className="glass border-none rounded-[2rem] p-8 space-y-8">
          <div className="flex items-center gap-6">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-24 h-24 rounded-3xl bg-primary flex items-center justify-center relative group cursor-pointer overflow-hidden"
            >
              <span className="text-4xl font-black text-white">LC</span>
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
            </motion.div>
            <div>
              <h3 className="text-xl font-bold">Foto do Perfil</h3>
              <p className="text-muted-foreground text-sm font-medium">
                PNG ou JPG. Recomendado 512x512px.
              </p>
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline" className="glass border-none h-10 px-4 rounded-xl text-xs font-bold uppercase">
                  Upload
                </Button>
                <Button size="sm" variant="ghost" className="h-10 px-4 rounded-xl text-xs font-bold uppercase text-red-400 hover:text-red-500 hover:bg-red-500/10">
                  Remover
                </Button>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { label: "Nome Completo", placeholder: "Seu nome", defaultValue: "Leonardo Camargo" },
              { label: "Email Profissional", placeholder: "seu@email.com", defaultValue: "leonardo@imobweb.ai", type: "email" },
              { label: "Telefone WhatsApp", placeholder: "+55 11 99999-9999", defaultValue: "+55 11 99999-9999" },
              { label: "CRECI / Registo", placeholder: "000.000-F", defaultValue: "123.456-F" },
            ].map((field, idx) => (
              <motion.div
                key={field.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className="space-y-2"
              >
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                  {field.label}
                </label>
                <Input
                  placeholder={field.placeholder}
                  defaultValue={field.defaultValue}
                  type={(field as any).type}
                  className="glass border-none h-14 rounded-2xl font-bold shadow-inner"
                />
              </motion.div>
            ))}
          </div>
        </div>
      );

    case "agency":
      return (
        <div className="glass border-none rounded-[2rem] p-8 space-y-8">
          <div className="flex items-center gap-6">
            <motion.div
              whileHover={{ rotate: 5 }}
              className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center"
            >
              <Building2 className="w-12 h-12 text-white" />
            </motion.div>
            <div>
              <h3 className="text-xl font-bold">Logo da Imobiliária</h3>
              <p className="text-muted-foreground text-sm font-medium">PNG ou JPG. Recomendado 512x512px.</p>
              <Button size="sm" variant="outline" className="glass border-none h-10 px-4 rounded-xl text-xs font-bold uppercase mt-3">
                Upload
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { label: "Nome da Imobiliária", defaultValue: "ImobWeb Imóveis", colSpan: true },
              { label: "CNPJ", defaultValue: "12.345.678/0001-90" },
              { label: "Telefone Fixo", defaultValue: "(11) 3000-0000" },
              { label: "Endereço", defaultValue: "Av. Paulista, 1000 - São Paulo - SP", colSpan: true },
            ].map((field, idx) => (
              <motion.div
                key={field.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className={cn("space-y-2", field.colSpan && "col-span-2")}
              >
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                  {field.label}
                </label>
                <Input
                  defaultValue={field.defaultValue}
                  className="glass border-none h-14 rounded-2xl font-bold shadow-inner"
                />
              </motion.div>
            ))}
          </div>
        </div>
      );

    case "integrations":
      return (
        <div className="glass border-none rounded-[2rem] p-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-xl font-black tracking-tighter">Integração WhatsApp IA</h3>
              <p className="text-sm text-muted-foreground font-medium">A automação atende seus leads 24/7.</p>
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
            <Button variant="outline" className="w-full glass border-none h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest group">
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
            <h3 className="text-xl font-black tracking-tighter">Preferências de Notificações</h3>
            <p className="text-sm text-muted-foreground font-medium">Escolha como deseja ser notificado.</p>
          </div>
          <div className="space-y-4">
            {[
              { label: "Notificações Push", description: "Receba notificações no navegador.", checked: true },
              { label: "E-mail", description: "Receba resumo diário por e-mail.", checked: true },
              { label: "WhatsApp", description: "Receba alertas importantes no WhatsApp.", checked: true },
              { label: "Novo Lead", description: "Notificação imediata quando um novo lead entrar em contato.", checked: true },
              { label: "Proposta Recebida", description: "Quando alguém enviar uma proposta.", checked: true },
              { label: "Visita Agendada", description: "Lembrete 1 hora antes de visitas.", checked: true },
            ].map((setting, idx) => (
              <motion.div
                key={setting.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <ToggleSetting {...setting} />
              </motion.div>
            ))}
          </div>
        </div>
      );

    case "security":
      return (
        <div className="glass border-none rounded-[2rem] p-8 space-y-8">
          <div>
            <h3 className="text-xl font-black tracking-tighter">Segurança</h3>
            <p className="text-sm text-muted-foreground font-medium">Gerencie sua segurança.</p>
          </div>
          <div className="space-y-6">
            <div className="p-6 bg-white/5 rounded-2xl space-y-4">
              <h4 className="font-bold">Alterar Senha</h4>
              <div className="space-y-3">
                <Input type="password" placeholder="Senha atual" className="h-12 rounded-xl" />
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
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <Input type="password" placeholder="Confirmar nova senha" className="h-12 rounded-xl" />
              </div>
              <Button className="h-10 rounded-xl font-bold text-xs uppercase">Atualizar Senha</Button>
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
            <h3 className="text-xl font-black tracking-tighter">Website & SEO</h3>
            <p className="text-sm text-muted-foreground font-medium">Configure seu site e configurações de busca.</p>
          </div>
          <div className="space-y-4">
            {[
              { label: "URL do Seu Site", defaultValue: "https://imobweb.com.br/seu-nome", placeholder: "https://" },
              { label: "Título do Site", defaultValue: "ImobWeb Imóveis - Sua Imobiliária de Confiança", placeholder: "Título" },
            ].map((field, idx) => (
              <motion.div
                key={field.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className="space-y-2"
              >
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                  {field.label}
                </label>
                <Input
                  placeholder={field.placeholder}
                  defaultValue={field.defaultValue}
                  className="glass border-none h-14 rounded-2xl font-bold shadow-inner"
                />
              </motion.div>
            ))}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                Descrição
              </label>
              <textarea
                className="glass border-none h-24 rounded-2xl p-4 font-bold shadow-inner resize-none w-full"
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
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors"
    >
      <div className="max-w-[70%]">
        <p className="font-bold text-sm leading-tight">{label}</p>
        <p className="text-[10px] text-muted-foreground font-medium mt-1 uppercase tracking-tighter">
          {description}
        </p>
      </div>
      <Switch checked={checked} />
    </motion.div>
  );
}
