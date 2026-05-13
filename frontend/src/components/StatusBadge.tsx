import React from 'react';
import { Badge } from '@/components/ui/badge';

type BadgeVariant = 'draft' | 'warning' | 'info' | 'success' | 'default' | 'secondary';

const statusVariant: Record<string, BadgeVariant> = {
  'Draft': 'draft',
  'Student Mentor Review': 'warning',
  'Faculty Review': 'info',
  'Approved': 'success',
  'Submitted to CIE': 'default',
  'Completed': 'success',
};

interface StatusBadgeProps {
  status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const variant: BadgeVariant = statusVariant[status] ?? 'secondary';
  return <Badge variant={variant}>{status}</Badge>;
};

export default StatusBadge;
