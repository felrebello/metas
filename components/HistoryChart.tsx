import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { HistoryData } from '../types';

interface HistoryChartProps {
  data: HistoryData[];
}

const HistoryChart: React.FC<HistoryChartProps> = ({ data }) => {
  return (
    <div className="w-full h-80 bg-base-200 p-4 rounded-lg">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
          <XAxis dataKey="month" stroke="#D1D5DB" />
          <YAxis stroke="#D1D5DB" tickFormatter={(value) => `R$${Number(value) / 1000000}M`} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#374151', border: 'none', color: '#F9FAFB' }} 
            formatter={(value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value))}
          />
          <Legend wrapperStyle={{ color: '#F9FAFB' }} />
          <Line type="monotone" dataKey="amount" stroke="#FDB913" strokeWidth={2} activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HistoryChart;
