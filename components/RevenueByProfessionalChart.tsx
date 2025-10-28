import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChartData {
  name: string;
  faturamento: number;
}

interface RevenueByProfessionalChartProps {
  data: ChartData[];
}

const RevenueByProfessionalChart: React.FC<RevenueByProfessionalChartProps> = ({ data }) => {
  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  const formatShortCurrency = (value: number) => {
    if (value >= 1000) return `R$${(value / 1000).toFixed(1)}k`;
    return `R$${value}`;
  }

  return (
    <div className="bg-base-200 p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-text-primary">Faturamento por Responsável</h2>
      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
            <XAxis dataKey="name" stroke="#D1D5DB" angle={-15} textAnchor="end" height={50} interval={0} fontSize={12} />
            <YAxis stroke="#D1D5DB" tickFormatter={formatShortCurrency} />
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

export default RevenueByProfessionalChart;
