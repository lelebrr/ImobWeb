'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Clock,
  Tag,
  ChevronRight,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Printer,
  Copy,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { HelpCenterEngine } from '@/lib/help/help-center';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ImageOptimized } from '@/components/performance/ImageOptimized';

/**
 * Página de Detalhe do Artigo de Ajuda.
 * Suporta MDX-like rendering e metadados.
 */
export default function ArticleDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [article, setArticle] = useState<any>(null);
  const [liked, setLiked] = useState<boolean | null>(null);

  useEffect(() => {
    if (slug) {
      const data = HelpCenterEngine.getBySlug(slug as string);
      setArticle(data);
    }
  }, [slug]);

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <p className="text-slate-400">Carregando artigo...</p>
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copiado para a área de transferência!');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="p-0 hover:bg-transparent text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <ChevronRight className="w-4 h-4" />
          <span>Help Center</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-indigo-400 font-medium">{article.category}</span>
        </nav>

        {/* Article Header */}
        <header className="space-y-6">
          <div className="flex gap-2">
            {article.tags.map((tag: string) => (
              <Badge key={tag} variant="outline" className="border-slate-800 text-slate-400 text-[10px] uppercase font-bold px-2 py-0">
                {tag}
              </Badge>
            ))}
          </div>
          <h1 className="text-5xl font-black tracking-tight text-white leading-tight">
            {article.title}
          </h1>
          <div className="flex items-center gap-6 text-sm text-slate-500 pb-8 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Leitura de 5 minutos</span>
            </div>
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4" />
              <span>Atualizado há 3 dias</span>
            </div>
          </div>
        </header>

        {/* Article Content (Mock MDX Rendering) */}
        <article className="prose prose-invert prose-indigo max-w-none">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6 text-slate-300 leading-relaxed text-lg"
          >
            <p className="text-xl text-slate-100 font-medium italic">
              {article.excerpt}
            </p>

            <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-4">
              <h3 className="text-white font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-indigo-400" />
                O que você vai aprender
              </h3>
              <ul className="list-disc list-inside space-y-2 text-sm text-slate-400">
                <li>Configuração visual da sua marca</li>
                <li>Integração de domínios customizados</li>
                <li>Atribuição de corretores por região</li>
              </ul>
            </div>

            <p>{article.content}</p>

            <div className="aspect-video bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center overflow-hidden">
              <ImageOptimized
                src={`https://placehold.co/800x450/0f172a/6366f1?text=Tutorial+${article.slug}`}
                alt="Placeholder"
                width={800}
                height={450}
                className="object-cover opacity-50"
              />
            </div>

            <p>
              Ao finalizar estas configurações, sua plataforma estará pronta para o próximo nível: a **Automação de WhatsApp**. Se tiver dúvidas, não hesite em chamar nossa IA no canto inferior direito.
            </p>
          </motion.div>
        </article>

        {/* Feedback Section */}
        <footer className="pt-12 mt-12 border-t border-slate-800 space-y-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-8 bg-slate-900/30 rounded-3xl border border-slate-800/50">
            <div className="space-y-1 text-center md:text-left">
              <p className="font-bold text-lg">Este artigo foi útil?</p>
              <p className="text-sm text-slate-500">Ajude-nos a melhorar nossa base de conhecimento.</p>
            </div>
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => { setLiked(true); toast.success('Obrigado pelo feedback!'); }}
                className={`border-slate-800 gap-2 h-12 px-6 ${liked === true ? 'bg-emerald-500/10 border-emerald-500' : ''}`}
              >
                <ThumbsUp className={`w-4 h-4 ${liked === true ? 'text-emerald-500' : ''}`} />
                Sim
              </Button>
              <Button
                variant="outline"
                onClick={() => { setLiked(false); toast.error('Lamentamos. Vamos melhorar este conteúdo.'); }}
                className={`border-slate-800 gap-2 h-12 px-6 ${liked === false ? 'bg-rose-500/10 border-rose-500' : ''}`}
              >
                <ThumbsDown className={`w-4 h-4 ${liked === false ? 'text-rose-500' : ''}`} />
                Não
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-center gap-8 text-slate-500 pb-12">
            <Button variant="ghost" size="sm" onClick={handleCopy} className="hover:text-white gap-2">
              <Share2 className="w-4 h-4" />
              Compartilhar
            </Button>
            <Button variant="ghost" size="sm" className="hover:text-white gap-2" onClick={() => window.print()}>
              <Printer className="w-4 h-4" />
              Imprimir
            </Button>
            <Button variant="ghost" size="sm" onClick={handleCopy} className="hover:text-white gap-2">
              <Copy className="w-4 h-4" />
              Copiar Link
            </Button>
          </div>
        </footer>
      </div>
    </div>
  );
}
