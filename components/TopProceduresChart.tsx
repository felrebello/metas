import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChartData {
  name: string;
  faturamento: number;
}

interface TopProceduresChartProps {
  data: ChartData[];
}

const TopProceduresChart: React.FC<TopProceduresChartProps> = ({ data }) => {
  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  const formatShortCurrency = (value: number) => {
    if (value >= 1000) return `R$${(value / 1000).toFixed(0)}k`;
    return `R$${value}`;
  }

  return (
    <div className="bg-base-200 p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-text-primary">Procedimentos Mais Rentáveis (Top 10)</h2>
      <div className="w-full h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            layout="vertical" 
            data={data} 
            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
            <XAxis type="number" stroke="#D1D5DB" tickFormatter={formatShortCurrency} />
            <YAxis 
              type="category" 
              dataKey="name" 
              stroke="#D1D5DB" 
              width={150} 
              interval={0}
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#374151', border: 'none', color: '#F9FAFB' }} 
              formatter={(value: number) => formatCurrency(value)}
              cursor={{ fill: 'rgba(253, 185, 19, 0.1)' }}
            />
            <Legend wrapperStyle={{ color: '#F9FAFB' }} formatter={() => 'Faturamento'}/>
            <Bar dataKey="faturamento" fill="#FDB913" name="Faturamento" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TopProceduresChart;
