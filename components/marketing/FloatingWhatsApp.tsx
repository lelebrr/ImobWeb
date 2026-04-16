'use client'

import { motion } from 'framer-motion'
import { MessageCircle } from 'lucide-react'

/**
 * FloatingWhatsApp - Psicologia de Design:
 * - Familiaridade: O \u00edcone de WhatsApp \u00e9 o gatilho mais forte de comunica\u00e7\u00e3o no Brasil.
 * - Pulse Animation: Chama a aten\u00e7\u00e3o de forma n\u00e3o intrusiva.
 * - Trust Signal: "Falar com Especialista" transmite que h\u00e1 humanos reais por tr\u00e1s da IA.
 */
const FloatingWhatsApp = () => {
    const whatsappNumber = '5511999999999' // Exemplo
    const message = encodeURIComponent('Ol\u00e1! Estava navegando no site da imobWeb e gostaria de falar com um especialista.')

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 2, type: 'spring' }}
            className="fixed bottom-8 right-8 z-[100]"
        >
            <a
                href={`https://wa.me/${whatsappNumber}?text=${message}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex items-center gap-4"
            >
                {/* Tooltip on hover */}
                <div className="absolute right-full mr-4 px-4 py-2 bg-white text-brand-deep text-sm font-black rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-slate-100 italic">
                    Falar com Especialista
                </div>

                <div className="relative">
                    {/* Ripple Effect */}
                    <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-20" />
                    
                    <div className="relative w-16 h-16 bg-[#25D366] text-white flex items-center justify-center rounded-2xl shadow-glow-growth group-hover:scale-110 transition-transform duration-500 rotate-3 group-hover:rotate-0">
                        <MessageCircle className="h-8 w-8 fill-current" />
                    </div>
                </div>
            </a>
        </motion.div>
    )
}

export default FloatingWhatsApp
