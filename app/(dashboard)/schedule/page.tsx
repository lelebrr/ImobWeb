'use client'

import React from 'react'
import { Calendar as CalendarIcon, Clock, MapPin, Users, Plus, ChevronLeft, ChevronRight, Video } from 'lucide-react'
import { Button } from '@/components/design-system/button'
import { Badge } from '@/components/design-system/badge'
import { cn } from '@/lib/responsive/tailwind-utils'

export default function SchedulePage() {
  return (
    <div className="space-y-8 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter">Agenda & Visitas</h1>
          <p className="text-muted-foreground font-medium">Gerencie seus horários e compromissos com leads e proprietários.</p>
        </div>
        <Button className="shadow-lg shadow-primary/20 h-12 px-8 rounded-2xl font-black uppercase text-[10px] tracking-widest">
           <Plus className="w-4 h-4 mr-2" /> Agendar Visita
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Calendar Column */}
        <div className="lg:col-span-2 space-y-6">
           <div className="glass border-none rounded-[2.5rem] p-8">
              <div className="flex justify-between items-center mb-8">
                 <h2 className="text-xl font-black tracking-tighter">Abril 2026</h2>
                 <div className="flex gap-2">
                    <Button variant="outline" size="icon" className="glass border-none rounded-xl"><ChevronLeft className="w-4 h-4" /></Button>
                    <Button variant="outline" size="icon" className="glass border-none rounded-xl"><ChevronRight className="w-4 h-4" /></Button>
                 </div>
              </div>

              {/* Day Grid */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                 {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                   <div key={day} className="text-center text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-2 opacity-50">{day}</div>
                 ))}
                 {Array.from({ length: 30 }).map((_, i) => (
                   <div 
                    key={i} 
                    className={cn(
                        "aspect-square rounded-2xl flex items-center justify-center font-bold text-sm cursor-pointer transition-all border border-transparent hover:bg-white/5 hover:border-white/10",
                        i + 1 === 11 ? "bg-primary text-white shadow-lg shadow-primary/20" : "glass border-none"
                    )}
                   >
                     {i + 1}
                     {/* Event Dot */}
                     {(i + 1) % 5 === 0 && (
                        <div className="absolute w-1 h-1 bg-blue-400 rounded-full mt-6" />
                     )}
                   </div>
                 ))}
              </div>
           </div>

           {/* Today Appointments */}
           <div className="space-y-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-2">Próximos Hoje</h3>
              <AppointmentCard 
                time="10:00" 
                title="Visita: Cobertura Itaim" 
                lead="Roberto Camargo" 
                location="Rua Amauri, 450" 
                type="VISIT"
              />
              <AppointmentCard 
                time="14:30" 
                title="Call: Negociação Loft" 
                lead="Juliana Mendes" 
                location="Google Meet" 
                type="VIRTUAL" 
                isVirtual
              />
           </div>
        </div>

        {/* Pending Tasks / Recommendations */}
        <div className="space-y-8">
           <div className="glass border-none rounded-[2rem] p-8">
              <h3 className="text-xl font-black tracking-tighter mb-2">Lembretes</h3>
              <p className="text-sm text-muted-foreground font-medium mb-6">Tarefas prioritárias para hoje.</p>
              <div className="space-y-4">
                 <TaskItem label="Enviar contrato para Carlos" checked={false} />
                 <TaskItem label="Confirmar visita Pâmela" checked />
                 <TaskItem label="Atualizar fotos Mansão" checked={false} />
              </div>
           </div>

           <div className="bg-primary/5 rounded-[2rem] p-8 border border-primary/10">
              <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center mb-6">
                 <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-black tracking-tighter mb-2 italic">Insights do Dia</h3>
              <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                 Você tem 3 visitas agendadas hoje. Roberto é um lead "quente" com 95% de chance de fechamento.
              </p>
           </div>
        </div>

      </div>
    </div>
  )
}

function AppointmentCard({ time, title, lead, location, isVirtual }: any) {
  return (
    <div className="glass border-none rounded-3xl p-6 flex gap-6 items-center group hover:bg-white/10 transition-all cursor-pointer">
       <div className="flex flex-col items-center justify-center min-w-[60px]">
          <span className="text-xl font-black tracking-tighter">{time}</span>
          <span className="text-[10px] uppercase font-bold text-primary">AM</span>
       </div>
       <div className="w-px h-12 bg-white/5" />
       <div className="flex-1">
          <h4 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">{title}</h4>
          <div className="flex flex-wrap gap-4 mt-2">
             <div className="flex items-center text-xs text-muted-foreground font-medium">
                <Users className="w-3.5 h-3.5 mr-1.5 text-primary" /> {lead}
             </div>
             <div className="flex items-center text-xs text-muted-foreground font-medium">
                {isVirtual ? <Video className="w-3.5 h-3.5 mr-1.5 text-blue-400" /> : <MapPin className="w-3.5 h-3.5 mr-1.5 text-blue-400" />}
                {location}
             </div>
          </div>
       </div>
       <Badge variant="outline" className="glass border-none font-black text-[10px] tracking-widest uppercase py-1 px-4 hidden md:block">Confirmado</Badge>
    </div>
  )
}

function TaskItem({ label, checked }: any) {
  return (
    <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5 group border-transparent hover:border-white/10 transition-all">
       <div className={cn(
         "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
         checked ? "bg-emerald-500 border-emerald-500" : "border-white/20 group-hover:border-primary"
       )}>
          {checked && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
       </div>
       <span className={cn("text-sm font-medium", checked && "line-through text-muted-foreground")}>{label}</span>
    </div>
  )
}
