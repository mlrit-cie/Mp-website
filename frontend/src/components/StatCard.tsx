import React from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  variant?: 'green' | 'blue' | 'red' | 'default';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon, variant = 'default' }) => {
  const bgClass = {
    green: 'bg-gradient-card-green border-emerald-500/20 shadow-emerald-500/5',
    blue: 'bg-gradient-card-blue border-blue-500/20 shadow-blue-500/5',
    red: 'bg-gradient-card-red border-red-500/20 shadow-red-500/5',
    default: 'bg-white/3 border-white/10',
  };

  const iconBg = {
    green: 'bg-primary/10 text-primary border border-primary/20',
    blue: 'bg-secondary/10 text-secondary border border-secondary/20',
    red: 'bg-destructive/10 text-destructive border border-destructive/20',
    default: 'bg-white/5 text-muted-foreground border border-white/10',
  };

  return (
    <div className={cn("rounded-xl border p-5 backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] shadow-lg flex flex-col justify-between", bgClass[variant])}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-3xl font-heading font-bold mt-1 animate-count-up">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", iconBg[variant])}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
