
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface OnboardingStatusBadgeProps {
  status: string;
}

const OnboardingStatusBadge = ({ status }: OnboardingStatusBadgeProps) => {
  const variants = {
    pending: 'secondary',
    in_progress: 'default',
    completed: 'default',
    rejected: 'destructive',
    not_applicable: 'outline'
  } as const;

  const colors = {
    pending: 'bg-gray-100 text-gray-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    not_applicable: 'bg-gray-50 text-gray-600'
  } as const;
  
  return (
    <Badge 
      variant={variants[status as keyof typeof variants] || 'secondary'}
      className={status === 'completed' ? colors.completed : ''}
    >
      {status.replace('_', ' ')}
    </Badge>
  );
};

export default OnboardingStatusBadge;
