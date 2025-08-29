
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  FileText, 
  GraduationCap, 
  Shield, 
  Heart,
  Wrench,
  AlertCircle
} from 'lucide-react';
import OnboardingStatusBadge from './OnboardingStatusBadge';

interface OnboardingTaskItemProps {
  task: any;
  onStatusUpdate: (taskId: string, status: string, notes?: string) => void;
}

const OnboardingTaskItem = ({ task, onStatusUpdate }: OnboardingTaskItemProps) => {
  const getCategoryIcon = (category: string) => {
    const icons = {
      document: FileText,
      training: GraduationCap,
      medical: Heart,
      background_check: Shield,
      equipment: Wrench,
      other: AlertCircle
    };
    const Icon = icons[category as keyof typeof icons] || AlertCircle;
    return <Icon className="w-4 h-4" />;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between space-x-4">
          <div className="flex items-start space-x-3 flex-1">
            <div className="flex items-center space-x-2">
              {getCategoryIcon(task.onboarding_tasks?.category || '')}
              {getStatusIcon(task.status || 'pending')}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h4 className="font-medium">{task.onboarding_tasks?.name}</h4>
                {task.onboarding_tasks?.is_required && (
                  <Badge variant="outline" className="text-xs">Required</Badge>
                )}
              </div>
              {task.onboarding_tasks?.description && (
                <p className="text-sm text-gray-600 mb-3">
                  {task.onboarding_tasks.description}
                </p>
              )}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Status:</span>
                  <OnboardingStatusBadge status={task.status || 'pending'} />
                </div>
                {task.completed_date && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Completed:</span>
                    <span className="text-sm">{task.completed_date}</span>
                  </div>
                )}
              </div>
              {task.notes && (
                <div className="mt-2">
                  <span className="text-sm text-gray-500">Notes:</span>
                  <p className="text-sm mt-1 p-2 bg-gray-50 rounded">{task.notes}</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col space-y-2 min-w-[200px]">
            <Select
              value={task.status || 'pending'}
              onValueChange={(value) => onStatusUpdate(task.id, value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="not_applicable">Not Applicable</SelectItem>
              </SelectContent>
            </Select>
            
            <Textarea
              placeholder="Add notes..."
              value={task.notes || ''}
              onChange={(e) => {
                // You could add a debounced update here
              }}
              onBlur={(e) => {
                if (e.target.value !== task.notes) {
                  onStatusUpdate(task.id, task.status || 'pending', e.target.value);
                }
              }}
              rows={2}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OnboardingTaskItem;
