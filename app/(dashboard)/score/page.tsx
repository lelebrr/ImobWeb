import React from "react";
import { ScoreDashboard } from "@/components/score/AIRecommendations";
import { PortfolioPulse } from "@/components/score/PortfolioPulse";
import { prisma } from "@/lib/prisma";

interface ScorePageProps {
  params: Promise<{ organizationId: string }>;
}

export default async function ScorePage({ params }: ScorePageProps) {
  const { organizationId } = await params;

  const pulse = {
    organizationId,
    totalProperties: 45,
    healthyCount: 28,
    warningCount: 12,
    criticalCount: 5,
    averageScore: 72,
    calculatedAt: Date.now(),
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Saúde da Carteira
          </h1>
          <p className="text-gray-500 mt-1">
            Monitoramento inteligente da saúde dos seus imóveis
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <PortfolioPulse data={pulse} />
          </div>
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="font-semibold text-gray-900 mb-4">Score Médio</h3>
              <div className="text-center">
                <div className="text-5xl font-bold text-gray-900">72</div>
                <div className="text-sm text-gray-500 mt-2">
                  Pontuação geral
                </div>
                <div className="mt-4 flex justify-center gap-2">
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                    28 saudáveis
                  </span>
                  <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
                    12 risco
                  </span>
                  <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded">
                    5 críticos
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="font-semibold text-gray-900 mb-4">
                Ações Rápidas
              </h3>
              <div className="space-y-2">
                <button className="w-full text-left px-4 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 text-sm">
                  📸 Atualizar fotos (5 imóveis)
                </button>
                <button className="w-full text-left px-4 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 text-sm">
                  💰 Revisar preços (3 imóveis)
                </button>
                <button className="w-full text-left px-4 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 text-sm">
                  📞 Contatar proprietários (8 imóveis)
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h3 className="font-semibold text-gray-900 mb-4">
              Imóveis Críticos
            </h3>
            <div className="space-y-3">
              {[
                { id: "1", title: "Apartamento Centro", score: 23 },
                { id: "2", title: "Casa de Praia", score: 35 },
                { id: "3", title: "Sala Comercial", score: 42 },
              ].map((property) => (
                <div
                  key={property.id}
                  className="flex items-center justify-between p-3 bg-red-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {property.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      Atualizado há 45 dias
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-red-600">
                      {property.score}
                    </span>
                    <p className="text-xs text-red-500">pontos</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h3 className="font-semibold text-gray-900 mb-4">
              Imóveis em Risco
            </h3>
            <div className="space-y-3">
              {[
                { id: "4", title: "Kitnet Zona Sul", score: 65 },
                { id: "5", title: "Terreno Industrial", score: 58 },
                { id: "6", title: "Loja Centro", score: 72 },
              ].map((property) => (
                <div
                  key={property.id}
                  className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {property.title}
                    </p>
                    <p className="text-xs text-gray-500">Sem fotos recentes</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-yellow-600">
                      {property.score}
                    </span>
                    <p className="text-xs text-yellow-500">pontos</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
