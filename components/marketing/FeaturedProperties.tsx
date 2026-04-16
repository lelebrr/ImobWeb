'use client';

import React from 'react';
import { PropertyCard } from '../properties/PropertyCard';
import { MOCK_PROPERTIES } from '../../lib/data/mock-properties';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function FeaturedProperties() {
  return (
    <section className="py-24 relative overflow-hidden bg-slate-950">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-2 text-indigo-400 font-black uppercase tracking-[0.2em] text-xs mb-4"
            >
              <Sparkles className="w-4 h-4" />
              Curadoria Exclusiva
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none mb-6"
            >
              Imóveis que Redefinem <br />
              o Conceito de <span className="text-gradient">Viver Bem</span>.
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-slate-400 text-lg font-medium max-w-xl"
            >
              Explorar nossa seleção de propriedades de alto padrão, escolhidas a dedo por nossa inteligência artificial para garantir a melhor experiência e retorno.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <Link 
              href="/marketplace"
              className="group flex items-center gap-3 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 px-8 py-4 rounded-2xl text-white font-bold transition-all hover:border-indigo-500/50"
            >
              Ver Catálogo Completo
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {MOCK_PROPERTIES.map((property, index) => (
            <motion.div
              key={property.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <PropertyCard property={property} />
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA for Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center"
        >
          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">
            + DE 1.200 IMÓVEIS DISPONÍVEIS NA PLATAFORMA
          </p>
        </motion.div>
      </div>
    </section>
  );
}
