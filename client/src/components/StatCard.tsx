import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: ReactNode;
  iconColor: string;
  iconBgColor: string;
}

export function StatCard({
  title,
  value,
  change,
  icon,
  iconColor,
  iconBgColor,
}: StatCardProps) {
  return (
    <div className="bg-primary-700 rounded-xl p-6 border border-primary-600">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-primary-100">{title}</h3>
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center ${iconBgColor}`}
        >
          <div className={iconColor}>{icon}</div>
        </div>
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
      {change && <p className="text-sm text-primary-300 mt-1">{change}</p>}
    </div>
  );
}
