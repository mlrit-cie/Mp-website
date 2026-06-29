import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { cardEntrance, HOVER_LIFT } from '@/lib/motion';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  variant?: 'green' | 'blue' | 'red' | 'default';
  /** Stagger position within a grid of stat cards. */
  index?: number;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon, variant = 'default', index = 0 }) => {
  const bgClass = {
    green: 'bg-gradient-card-green border-emerald-500/20',
    blue: 'bg-gradient-card-blue border-blue-500/20',
    red: 'bg-gradient-card-red border-red-500/20',
    default: 'bg-white/3 border-white/10',
  };

  const iconBg = {
    green: 'bg-primary/10 text-primary border border-primary/20',
    blue: 'bg-secondary/10 text-secondary border border-secondary/20',
    red: 'bg-destructive/10 text-destructive border border-destructive/20',
    default: 'bg-white/5 text-muted-foreground border border-white/10',
  };

  return (
    <motion.div
      variants={cardEntrance(index)}
      initial="hidden"
      animate="visible"
      whileHover={HOVER_LIFT}
      className={cn(
        "premium-depth border p-5 backdrop-blur-xl flex flex-col justify-between",
        bgClass[variant],
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-3xl font-heading font-bold mt-1 animate-count-up">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", iconBg[variant])}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard;
