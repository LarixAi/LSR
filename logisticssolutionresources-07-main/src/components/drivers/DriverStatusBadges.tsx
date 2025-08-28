
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  status: string;
}

export const OnboardingStatusBadge = ({ status }: StatusBadgeProps) => {
  const variants = {
    pending: 'secondary',
    in_progress: 'default',
    completed: 'default',
    rejected: 'destructive'
  } as const;

  const colors = {
    pending: 'bg-gray-100 text-gray-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800'
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

export const EmploymentStatusBadge = ({ status }: StatusBadgeProps) => {
  const variants = {
    applicant: 'secondary',
    employee: 'default',
    terminated: 'destructive',
    inactive: 'outline'
  } as const;

  const colors = {
    applicant: 'bg-gray-100 text-gray-800',
    employee: 'bg-green-100 text-green-800',
    terminated: 'bg-red-100 text-red-800',
    inactive: 'bg-gray-50 text-gray-600'
  } as const;
  
  return (
    <Badge 
      variant={variants[status as keyof typeof variants] || 'secondary'}
      className={status === 'employee' ? colors.employee : ''}
    >
      {status}
    </Badge>
  );
};
