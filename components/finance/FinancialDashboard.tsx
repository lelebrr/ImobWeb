// components/finance/FinancialDashboard.tsx
"use client";

import { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Download } from "lucide-react";

// Types from our finance module
import type { FinancialDashboardData } from "@/types/finance";

const FinancialDashboard: React.FC = () => {
  const [data, setData] = useState<FinancialDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    const promise = new Promise((resolve) => setTimeout(resolve, 2500));
    toast.promise(promise, {
      loading: "Gerando relatório financeiro consolidado...",
      success:
        "Relatório exportado com sucesso! O download começará em instantes.",
      error: "Erro ao gerar relatório.",
    });
    promise.finally(() => setIsExporting(false));
  };

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      // In a real app, fetch from API
      const mockData: FinancialDashboardData = {
        mrr: 15000,
        arr: 180000,
        churnRate: 0.05, // 5%
        ltv: 45000,
        averageTicket: 250000,
        projectedRevenue: 200000,
        monthlyRevenue: [
          { month: "Jan", value: 12000 },
          { month: "Feb", value: 13500 },
          { month: "Mar", value: 11000 },
          { month: "Apr", value: 15000 },
          { month: "May", value: 17000 },
          { month: "Jun", value: 16000 },
          { month: "Jul", value: 18000 },
          { month: "Aug", value: 19000 },
          { month: "Sep", value: 20000 },
          { month: "Oct", value: 22000 },
          { month: "Nov", value: 21000 },
          { month: "Dec", value: 23000 },
        ],
        monthlyExpenses: [
          { month: "Jan", value: 8000 },
          { month: "Feb", value: 8500 },
          { month: "Mar", value: 7500 },
          { month: "Apr", value: 9000 },
          { month: "May", value: 9500 },
          { month: "Jun", value: 9000 },
          { month: "Jul", value: 10000 },
          { month: "Aug", value: 10500 },
          { month: "Sep", value: 11000 },
          { month: "Oct", value: 11500 },
          { month: "Nov", value: 11000 },
          { month: "Dec", value: 12000 },
        ],
        commissionsSummary: {
          totalPaid: 45000,
          totalPending: 12000,
          byBroker: [
            { brokerId: "1", brokerName: "João Silva", value: 15000 },
            { brokerId: "2", brokerName: "Maria Oliveira", value: 12000 },
            { brokerId: "3", brokerName: "Pedro Santos", value: 10000 },
            { brokerId: "4", brokerName: "Ana Costa", value: 8000 },
          ],
        },
        cashFlow: {
          incoming: 25000,
          outgoing: 18000,
          net: 7000,
          projected: [
            { month: "Jan", incoming: 20000, outgoing: 15000, net: 5000 },
            { month: "Feb", incoming: 22000, outgoing: 16000, net: 6000 },
            { month: "Mar", incoming: 24000, outgoing: 17000, net: 7000 },
            { month: "Apr", incoming: 26000, outgoing: 18000, net: 8000 },
            { month: "May", incoming: 28000, outgoing: 19000, net: 9000 },
            { month: "Jun", incoming: 30000, outgoing: 20000, net: 10000 },
          ],
        },
        taxSummary: {
          iss: 2500,
          irrf: 1800,
          pis: 300,
          cofins: 1400,
          csll: 400,
        },
      };
      setData(mockData);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return <div className="p-6">Loading financial data...</div>;
  }

  if (!data) {
    return <div className="p-6">No data available</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard Financeiro</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          disabled={isExporting}
        >
          {isExporting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Download className="w-4 h-4 mr-2" />
          )}
          {isExporting ? "Gerando..." : "Exportar Relatório"}
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              MRR (Receita Mensal Recorrente)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-2xl font-bold">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(data.mrr)}
            </p>
            <p className="text-sm text-muted-foreground">
              Receita previsível por mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              ARR (Receita Anual Recorrente)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-2xl font-bold">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(data.arr)}
            </p>
            <p className="text-sm text-muted-foreground">
              Receita previsível por ano
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Taxa de Churn</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-2xl font-bold">
              {(data.churnRate * 100).toFixed(1)}%
            </p>
            <p className="text-sm text-muted-foreground">
              Percentual de contratos cancelados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              LTV (Valor Vitalício do Cliente)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-2xl font-bold">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(data.ltv)}
            </p>
            <p className="text-sm text-muted-foreground">
              Receita média por cliente ao longo do tempo
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue vs Expenses */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              Receita vs Despesas Mensais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={[
                  ...data.monthlyRevenue.map((d) => ({
                    month: d.month,
                    revenue: d.value,
                    expense: 0,
                  })),
                  ...data.monthlyExpenses.map((d) => {
                    const rev = data.monthlyRevenue.find(
                      (r) => r.month === d.month,
                    );
                    return {
                      month: d.month,
                      revenue: rev ? rev.value : 0,
                      expense: d.value,
                    };
                  }),
                ].reduce(
                  (acc, curr) => {
                    const existing = acc.find(
                      (item) => item.month === curr.month,
                    );
                    if (existing) {
                      existing.revenue = curr.revenue;
                      existing.expense = curr.expense;
                    } else {
                      acc.push(curr);
                    }
                    return acc;
                  },
                  [] as Array<{
                    month: string;
                    revenue: number;
                    expense: number;
                  }>,
                )}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8884d8"
                  name="Receita"
                />
                <Line
                  type="monotone"
                  dataKey="expense"
                  stroke="#82ca9d"
                  name="Despesas"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Cash Flow Projection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              Projeção de Fluxo de Caixa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={data.cashFlow.projected.map((d) => ({
                  month: d.month,
                  incoming: d.incoming,
                  outgoing: d.outgoing,
                  net: d.net,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="incoming"
                  stroke="#8884d8"
                  name="Entradas"
                />
                <Line
                  type="monotone"
                  dataKey="outgoing"
                  stroke="#82ca9d"
                  name="Saídas"
                />
                <Line
                  type="monotone"
                  dataKey="net"
                  stroke="#ff9f43"
                  name="Líquido"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Commissions Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Resumo de Comissões</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between mb-4">
            <span>Total Pago:</span>
            <span className="font-medium">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(data.commissionsSummary.totalPaid)}
            </span>
          </div>
          <div className="flex justify-between mb-4">
            <span>Total Pendente:</span>
            <span className="font-medium">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(data.commissionsSummary.totalPending)}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left rtl:text-right">
              <thead>
                <tr>
                  <th className="pb-2 text-left text-muted-foreground">
                    Corretor
                  </th>
                  <th className="pb-2 text-left text-muted-foreground">
                    Valor (R$)
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.commissionsSummary.byBroker.map((broker) => (
                  <tr key={broker.brokerId} className="border-t">
                    <td className="py-2">{broker.brokerName}</td>
                    <td className="py-2 text-right">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(broker.value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Tax Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Resumo Fiscal</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">ISS:</span>
            <span className="float-right">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(data.taxSummary.iss)}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">IRRF:</span>
            <span className="float-right">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(data.taxSummary.irrf)}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">PIS:</span>
            <span className="float-right">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(data.taxSummary.pis)}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">COFINS:</span>
            <span className="float-right">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(data.taxSummary.cofins)}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">CSLL:</span>
            <span className="float-right">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(data.taxSummary.csll)}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialDashboard;
