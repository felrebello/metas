import React from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';

interface ProgressCircleProps {
  current: number;
  target: number;
}

const ProgressCircle: React.FC<ProgressCircleProps> = ({ current, target }) => {
  const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const data = [{ name: 'progress', value: percentage }];
  const formattedCurrent = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(current);

  return (
    <div className="relative w-64 h-64 sm:w-80 sm:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          innerRadius="70%"
          outerRadius="100%"
          data={data}
          startAngle={90}
          endAngle={-270}
        >
          <PolarAngleAxis
            type="number"
            domain={[0, 100]}
            angleAxisId={0}
            tick={false}
          />
          <RadialBar
            background
            dataKey="value"
            cornerRadius={30}
            className="fill-brand-yellow"
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl sm:text-5xl font-bold text-text-primary">{percentage.toFixed(1)}%</span>
        <span className="text-lg text-text-secondary mt-2">{formattedCurrent}</span>
      </div>
    </div>
  );
};

export default ProgressCircle;