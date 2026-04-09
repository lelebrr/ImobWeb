"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";

/**
 * AdvancedChart Component for imobWeb Reports
 * Premium data visualization using Recharts.
 * Supports dynamic portal performance data.
 */

interface ChartData {
  portalName: string;
  leadsCount: number;
  roi: number;
}

interface AdvancedChartProps {
  data: ChartData[];
  title?: string;
}

const COLORS = ["#000000", "#333333", "#666666", "#999999", "#CCCCCC"];

export function AdvancedChart({ data, title = "ROI por Portal" }: AdvancedChartProps) {
  return (
    <div className="w-full h-[400px] p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
      <h3 className="text-lg font-bold mb-6 text-slate-800">{title}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="portalName" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 12 }}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 12 }}
          />
          <Tooltip 
            cursor={{ fill: '#f8fafc' }}
            contentStyle={{ 
              borderRadius: '8px', 
              border: 'none', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
            }}
          />
          <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
          <Bar dataKey="leadsCount" name="Total de Leads" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
