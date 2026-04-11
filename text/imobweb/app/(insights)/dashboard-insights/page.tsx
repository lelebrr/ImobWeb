'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  BrainCircuit, 
  TrendingUp, 
  Users, 
  Home, 
  Zap,
  Activity,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/design-system/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/design-system/tabs';
import { HealthScoreCard } from '@/components/insights/HealthScoreCard';
import { PriceRecommendationCard } from '@/components/insights/PriceRecommendationCard';

/**
 * Página principal de Insights e IA Preditiva.
 * Agrega métricas de churn, saúde de anúncios e recomendações em tempo real.
 */
export default function InsightsDashboard() {
  // Mock data para demonstração (em produção virá da API /api/insights)
  const healthScore = {
    score: 84,
    factors: [
      { label: 'Fotos de Qualidade', impact: 15, description: 'Seu imóvel tem 18 fotos premium.' },
      { label: 'Descrição Otimizada', impact: 10, description: 'Uso de palavras-chave SEO detectado.' },
      { label: 'Preço Competitivo', impact: 5, description: 'Dentro da média do bairro.' },
      { label: 'Localização Precisa', impact: -10, description: 'O mapa está ligeiramente deslocado.' }
    ],
    recommendations: [
      'Ajuste o pin no mapa para aumentar a precisão da busca.',
      'Destaque a área gourmet na descrição para atrair mais leads.'
    ]
  };

  const priceRecommendation = {
    suggestedPrice: 750000,
    minPrice: 690000,
    maxPrice: 785000,
    confidence: 0.92,
    marketAverage: 735000,
    reasoning: [
      'Tendência de valorização de 4% no bairro nos últimos 3 meses.',
      'Escassez de imóveis similares com 3 dormitórios nesta região.',
      'Alta taxa de cliques em imóveis na mesma faixa de preço.'
    ],
    comparablesCount: 12
  };

  const churnRisk = {
    probability: 0.75,
    riskLevel: 'HIGH' as const,
    factors: [
      'Proprietário não responde WhatsApp há 22 dias.',
      'Imóvel com tags "Desatualizado" nos portais.',
      'Queda de 40% nas visualizações semanais.'
    ],
    suggestedActions: [
      'Enviar Proposta de Renovação de Fotos via WhatsApp',
      'Agendar visita técnica para revisão de preço'
    ]
  };

  const salesProb = {
    probability: 0.68,
    expectedDays: 45,
    engagementScore: 72
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 space-y-8">
      {/* Header com IA Branding */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-bold text-indigo-400 uppercase tracking-widest">IA Preditiva 2026</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-white flex items-center gap-3">
            Explorador de Insights
            <Sparkles className="w-6 h-6 text-indigo-400 animate-pulse" />
          </h1>
          <p className="text-slate-400 mt-1 max-w-2xl">
            Analisamos milhões de dados de mercado para dar a você a vantagem competitiva definitiva.
          </p>
        </div>
        
        <div className="flex gap-3">
          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-md px-4 py-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-full">
                <Activity className="w-4 h-4 text-emerald-500" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold">Saúde Global</p>
                <p className="text-lg font-black text-emerald-500">Otimizada</p>
              </div>
            </div>
          </Card>
        </div>
      </header>

      {/* Grid de KPIs Rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Risco de Churn', value: '12%', trend: '-4%', icon: Users, color: 'text-rose-400' },
          { label: 'Preço Médio/m²', value: 'R$ 8.450', trend: '+1.2%', icon: BarChart3, color: 'text-indigo-400' },
          { label: 'Tempo Médio Venda', value: '62 dias', trend: '-8 dias', icon: Zap, color: 'text-amber-400' },
          { label: 'Total de Leads IA', value: '1.284', trend: '+18%', icon: TrendingUp, color: 'text-emerald-400' }
        ].map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="bg-slate-900/40 border-slate-800/60 hover:border-indigo-500/50 transition-all group overflow-hidden">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-2 rounded-lg bg-slate-800 group-hover:bg-indigo-600/20 transition-colors`}>
                    <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                  </div>
                  <Badge variant="outline" className="text-[10px] border-slate-800 text-slate-500">
                    Últimos 30d
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-400">{kpi.label}</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <h3 className="text-2xl font-bold text-white">{kpi.value}</h3>
                    <span className="text-xs font-bold text-emerald-500 flex items-center">
                      <ArrowUpRight className="w-3 h-3" />
                      {kpi.trend}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content Areas */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-slate-900 border-slate-800 p-1">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="properties">Imóveis em Risco</TabsTrigger>
          <TabsTrigger value="pricing">Oportunidades de Preço</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna Esquerda: Saúde e Timeline */}
          <div className="lg:col-span-1 space-y-8">
            <HealthScoreCard 
              scoreData={healthScore} 
              propertyName="Apartamento High-End Jardins"
            />
            <PredictiveTimeline data={salesProb} />
          </div>

          {/* Coluna Direita: Recomendação e Alerta de Churn */}
          <div className="lg:col-span-2 space-y-8">
            <PriceRecommendationCard 
              recommendation={priceRecommendation}
              propertyTitle="Apartamento High-End Jardins"
            />
            <ChurnAlertCard 
              churnData={churnRisk}
              itemName="Apartamento High-End Jardins"
            />
          </div>
        </TabsContent>

        <TabsContent value="properties">
          <Card className="bg-slate-900 border-slate-800 h-[400px] flex items-center justify-center">
            <div className="text-center space-y-4">
              <Users className="w-12 h-12 text-slate-700 mx-auto" />
              <p className="text-slate-500 max-w-xs">
                Módulo de monitoramento de Churn em tempo real. Identificamos proprietários com baixo engajamento.
              </p>
              <Button variant="outline" className="border-slate-800">Ver Lista Completa</Button>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="pricing">
          <Card className="bg-slate-900 border-slate-800 h-[400px] flex items-center justify-center">
             <div className="text-center space-y-4">
              <DollarSign className="w-12 h-12 text-slate-700 mx-auto" />
              <p className="text-slate-500 max-w-xs">
                Existem 12 imóveis em sua carteira com preços acima da média de mercado.
              </p>
              <Button variant="default" className="bg-indigo-600">Otimizar Preços em Lote</Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
