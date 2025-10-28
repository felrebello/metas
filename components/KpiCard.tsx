import React from 'react';

interface KpiCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, icon }) => {
  return (
    <div className="bg-base-200 p-4 rounded-lg shadow-lg flex items-center gap-4">
      <div className="bg-brand-yellow/10 p-3 rounded-full">
        {icon}
      </div>
      <div>
        <p className="text-text-secondary text-sm font-medium capitalize">{title}</p>
        <p className="text-xl sm:text-2xl font-bold text-text-primary">{value}</p>
      </div>
    </div>
  );
};

export default KpiCard;