import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  color?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon: Icon, trend, trendUp, color = "blue" }) => {
  const colorClasses = {
    blue: "bg-blue-500/10 text-blue-500",
    green: "bg-emerald-500/10 text-emerald-500",
    red: "bg-red-500/10 text-red-500",
    purple: "bg-purple-500/10 text-purple-500",
  };

  const selectedColor = colorClasses[color as keyof typeof colorClasses] || colorClasses.blue;

  return (
    <div className="bg-surface p-6 rounded-2xl border border-white/5 shadow-xl backdrop-blur-sm">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-secondary text-sm font-medium mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-white">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${selectedColor}`}>
          <Icon size={24} />
        </div>
      </div>
      {trend && (
        <div className="flex items-center text-sm">
          <span className={trendUp ? "text-emerald-400" : "text-red-400"}>
            {trend}
          </span>
          <span className="text-secondary ml-2">vs mês anterior</span>
        </div>
      )}
    </div>
  );
};