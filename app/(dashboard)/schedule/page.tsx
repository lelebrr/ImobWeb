'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar as CalendarIcon, Clock, MapPin, Users, Plus, ChevronLeft, ChevronRight, Video, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/design-system/button'
import { Badge } from '@/components/design-system/badge'
import { cn } from '@/lib/responsive/tailwind-utils'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
}

export default function SchedulePage() {
  const [selectedDay, setSelectedDay] = useState(11)
  const [tasks, setTasks] = useState([
    { id: 1, label: 'Enviar contrato para Carlos', checked: false },
    { id: 2, label: 'Confirmar visita Pâmela', checked: true },
    { id: 3, label: 'Atualizar fotos Mansão', checked: false },
  ])

  const toggleTask = (id: number) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, checked: !t.checked } : t))
  }

  const daysInMonth = 30
  const firstDayOffset = 2 // Wednesday offset for April 2026

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-10"
    >
      {/* Header Section */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter">Agenda & Visitas</h1>
          <p className="text-muted-foreground font-medium">Gerencie seus horários e compromissos com leads e proprietários.</p>
        </div>
        <Button className="shadow-lg shadow-primary/20 h-12 px-8 rounded-2xl font-black uppercase text-[10px] tracking-widest">
           <Plus className="w-4 h-4 mr-2" /> Agendar Visita
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar Column */}
        <div className="lg:col-span-2 space-y-6">
           <motion.div variants={itemVariants} className="glass border-none rounded-[2.5rem] p-8">
              <div className="flex justify-between items-center mb-8">
                 <h2 className="text-xl font-black tracking-tighter">Abril 2026</h2>
                 <div className="flex gap-2">
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Button variant="outline" size="icon" className="glass border-none rounded-xl"><ChevronLeft className="w-4 h-4" /></Button>
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Button variant="outline" size="icon" className="glass border-none rounded-xl"><ChevronRight className="w-4 h-4" /></Button>
                    </motion.button>
                 </div>
              </div>

              {/* Day Grid */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                 {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                   <div key={day} className="text-center text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-2 opacity-50">{day}</div>
                 ))}
                 {/* Empty cells for offset */}
                 {Array.from({ length: firstDayOffset }).map((_, i) => (
                   <div key={`empty-${i}`} />
                 ))}
                 {Array.from({ length: daysInMonth }).map((_, i) => {
                   const day = i + 1
                   const hasEvents = day % 5 === 0
                   const isSelected = day === selectedDay
                   return (
                     <motion.button
                       key={day}
                       whileHover={{ scale: 1.1 }}
                       whileTap={{ scale: 0.9 }}
                       onClick={() => setSelectedDay(day)}
                       className={cn(
                         "aspect-square rounded-2xl flex flex-col items-center justify-center font-bold text-sm cursor-pointer transition-all border relative",
                         isSelected
                           ? "bg-primary text-white shadow-lg shadow-primary/20 border-primary"
                           : "glass border-none hover:bg-white/5 hover:border-white/10"
                       )}
                     >
                       {day}
                       {hasEvents && (
                         <div className="absolute bottom-1.5 w-1 h-1 bg-blue-400 rounded-full" />
                       )}
                     </motion.button>
                   )
                 })}
              </div>
           </motion.div>

           {/* Today Appointments */}
           <div className="space-y-4">
              <motion.h3 variants={itemVariants} className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-2">
                Próximos Hoje
              </motion.h3>
              <motion.div variants={itemVariants} whileHover={{ scale: 1.01, x: 4 }}>
                <AppointmentCard
                  time="10:00"
                  title="Visita: Cobertura Itaim"
                  lead="Roberto Camargo"
                  location="Rua Amauri, 450"
                  isVirtual={false}
                />
              </motion.div>
              <motion.div variants={itemVariants} whileHover={{ scale: 1.01, x: 4 }}>
                <AppointmentCard
                  time="14:30"
                  title="Call: Negociação Loft"
                  lead="Juliana Mendes"
                  location="Google Meet"
                  isVirtual={true}
                />
              </motion.div>
           </div>
        </div>

        {/* Pending Tasks / Recommendations */}
        <div className="space-y-8">
           <motion.div variants={itemVariants} className="glass border-none rounded-[2rem] p-8">
              <h3 className="text-xl font-black tracking-tighter mb-2">Lembretes</h3>
              <p className="text-sm text-muted-foreground font-medium mb-6">Tarefas prioritárias para hoje.</p>
              <div className="space-y-3">
                 {tasks.map((task, idx) => (
                   <motion.div
                     key={task.id}
                     initial={{ opacity: 0, x: -20 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ delay: idx * 0.1 }}
                     whileHover={{ scale: 1.02 }}
                     whileTap={{ scale: 0.98 }}
                     onClick={() => toggleTask(task.id)}
                     className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5 group hover:border-white/10 transition-all cursor-pointer"
                   >
                     <motion.div
                       animate={{ scale: task.checked ? 1.1 : 1 }}
                       className={cn(
                         "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors shrink-0",
                         task.checked ? "bg-emerald-500 border-emerald-500" : "border-white/20 group-hover:border-primary"
                       )}
                     >
                       {task.checked && (
                         <motion.div
                           initial={{ scale: 0 }}
                           animate={{ scale: 1 }}
                           className="w-1.5 h-1.5 rounded-full bg-white"
                         />
                       )}
                     </motion.div>
                     <span className={cn("text-sm font-medium transition-all", task.checked && "line-through text-muted-foreground")}>
                       {task.label}
                     </span>
                   </motion.div>
                 ))}
              </div>
           </motion.div>

           <motion.div variants={itemVariants} className="bg-primary/5 rounded-[2rem] p-8 border border-primary/10">
              <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center mb-6">
                 <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-black tracking-tighter mb-2 italic">Insights do Dia</h3>
              <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                 Você tem 3 visitas agendadas hoje. Roberto é um lead "quente" com 95% de chance de fechamento.
              </p>
           </motion.div>
        </div>
      </div>
    </motion.div>
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
       <Badge variant="outline" className="glass border-none font-black text-[10px] tracking-widest uppercase py-1 px-4 hidden md:flex items-center gap-1">
         <CheckCircle2 className="w-3 h-3" /> Confirmado
       </Badge>
    </div>
  )
}
