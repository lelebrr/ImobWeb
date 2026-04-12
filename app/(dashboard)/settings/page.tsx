'use client'

import React from 'react'
import { User, Building2, Bell, Shield, Smartphone, Globe, Save, Mail, Phone, MapPin, Zap, ExternalLink } from 'lucide-react'
import { Button } from '@/components/design-system/button'
import { Input } from '@/components/design-system/input'
import { Badge } from '@/components/design-system/badge'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

export default function SettingsPage() {
  return (
    <div className="space-y-8 pb-10 max-w-5xl">
       {/* Header Section */}
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter">Configurações</h1>
          <p className="text-muted-foreground font-medium">Gerencie seu perfil, equipe e integrações de automação.</p>
        </div>
        <Button className="shadow-lg shadow-primary/20 h-12 px-8 rounded-2xl font-black uppercase text-[10px] tracking-widest">
           <Save className="w-4 h-4 mr-2" /> Salvar Alterações
        </Button>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Tabs Mock */}
        <div className="lg:col-span-1 space-y-2">
           <SettingsTab icon={User} label="Meu Perfil" active />
           <SettingsTab icon={Building2} label="Imobiliária" />
           <SettingsTab icon={Zap} label="Integrações IA" />
           <SettingsTab icon={Bell} label="Notificações" />
           <SettingsTab icon={Shield} label="Segurança" />
           <SettingsTab icon={Globe} label="Website & SEO" />
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 space-y-8">
           
           {/* Section: Profile */}
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
                    <p className="text-muted-foreground text-sm font-medium">PNG ou JPG. Recomendado 512x512px.</p>
                    <div className="flex gap-2 mt-3">
                       <Button size="sm" variant="outline" className="glass border-none h-10 px-4 rounded-xl text-xs font-bold uppercase">Upload</Button>
                       <Button size="sm" variant="ghost" className="h-10 px-4 rounded-xl text-xs font-bold uppercase text-red-400 hover:text-red-500 hover:bg-red-500/10">Remover</Button>
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Nome Completo</label>
                    <Input placeholder="Seu nome" defaultValue="Leonardo Camargo" className="glass border-none h-14 rounded-2xl font-bold shadow-inner" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email Profissional</label>
                    <Input placeholder="seu@email.com" defaultValue="leonardo@imobweb.ai" className="glass border-none h-14 rounded-2xl font-bold shadow-inner" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Telefone WhatsApp</label>
                    <Input placeholder="+55 11 99999-9999" defaultValue="+55 11 99999-9999" className="glass border-none h-14 rounded-2xl font-bold shadow-inner" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">CRECI / Registo</label>
                    <Input placeholder="000.000-F" defaultValue="123.456-F" className="glass border-none h-14 rounded-2xl font-bold shadow-inner" />
                 </div>
              </div>
           </div>

           {/* Section: IA Integrations Preview */}
           <div className="glass border-none rounded-[2rem] p-8">
              <div className="flex justify-between items-start mb-8">
                 <div>
                    <h3 className="text-xl font-black tracking-tighter">Integração WhatsApp IA</h3>
                    <p className="text-sm text-muted-foreground font-medium">A automação atende seus leads 24/7.</p>
                 </div>
                 <Badge className="bg-emerald-500/20 text-emerald-400 border-none px-3 py-1 font-black uppercase text-[10px] tracking-widest">Conectado</Badge>
              </div>

              <div className="space-y-4">
                 <ToggleSetting label="Resposta Automática com IA" description="A IA iniciará conversas com leads de portais." checked />
                 <ToggleSetting label="Atendimento em Feriados" description="Manter IA ativa fora do horário comercial." checked />
                 <ToggleSetting label="Sugestão de Preços Ativa" description="A IA sugerirá valores baseados no mercado." />
              </div>

              <div className="mt-8 pt-8 border-t border-white/5">
                 <Button variant="outline" className="w-full glass border-none h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest group">
                    <Smartphone className="w-4 h-4 mr-3 text-primary group-hover:scale-110 transition-transform" /> 
                    Configurar Dispositivo WhatsApp <ExternalLink className="w-3.5 h-3.5 ml-auto opacity-40" />
                 </Button>
              </div>
           </div>

        </div>
      </div>
    </div>
  )
}

function SettingsTab({ icon: Icon, label, active }: any) {
  return (
    <div className={cn(
      "flex items-center gap-3 px-5 py-4 rounded-2xl cursor-pointer transition-all duration-300 font-bold text-sm",
      active 
        ? "bg-primary text-white shadow-lg shadow-primary/20" 
        : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
    )}>
       <Icon className="w-4 h-4" />
       {label}
    </div>
  )
}

function ToggleSetting({ label, description, checked }: any) {
  return (
    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
       <div className="max-w-[70%]">
          <p className="font-bold text-sm leading-tight">{label}</p>
          <p className="text-[10px] text-muted-foreground font-medium mt-1 uppercase tracking-tighter">{description}</p>
       </div>
       <Switch checked={checked} />
    </div>
  )
}
