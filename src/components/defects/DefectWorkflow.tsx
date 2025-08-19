import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Wrench, 
  Clock, 
  CheckCircle, 
  Play, 
  Package,
  DollarSign,
  X,
  AlertTriangle
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface DefectWorkflowProps {
  defectId: string;
  onClose: () => void;
}

const DefectWorkflow: React.FC<DefectWorkflowProps> = ({ defectId, onClose }) => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  
  // Fetch defect details from combined_defects
  const { data: defect, isLoading } = useQuery({
    queryKey: ['defect', defectId],
    queryFn: async () => {
      console.log('🔍 Fetching defect:', defectId);
      const { data, error } = await supabase
        .from('combined_defects' as any)
        .select(`
          id,
          defect_number,
          title,
          description,
          defect_type,
          severity,
          status,
          organization_id,
          source_type
        `)
        .eq('id', defectId)
        .single();

      if (error) {
        console.error('❌ Error fetching defect:', error);
        throw error;
      }
      
      console.log('✅ Defect fetched:', data);
      return data as any;
    }
  });

  // Fetch work order stages
  const { data: stages = [], isLoading: stagesLoading } = useQuery({
    queryKey: ['work-order-stages', defectId],
    queryFn: async () => {
      console.log('🔍 Fetching work order stages for defect:', defectId);
      const { data, error } = await supabase
        .from('work_order_stages' as any)
        .select('*')
        .eq('defect_id', defectId)
        .order('stage_order');

      if (error) {
        console.error('❌ Error fetching stages:', error);
        throw error;
      }
      
      console.log('✅ Stages fetched:', data);
      return (data || []) as any[];
    },
    enabled: !!defectId
  });

  // Mutations
  const startWorkOrderMutation = useMutation({
    mutationFn: async () => {
      console.log('🔧 Starting work order for defect:', defectId);
      console.log('🔧 Using mechanic ID:', profile?.id);
      console.log('🔧 Defect type:', defect?.defect_type);
      
      const { data, error } = await supabase.rpc('start_work_order' as any, {
        p_defect_id: defectId,
        p_mechanic_id: profile?.id
      });
      
      if (error) {
        console.error('❌ Error starting work order:', error);
        throw error;
      }
      
      console.log('✅ Work order started:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-order-stages', defectId] });
      queryClient.invalidateQueries({ queryKey: ['defect', defectId] });
      toast({
        title: 'Work Order Started',
        description: 'Work order has been initiated successfully.',
      });
    },
    onError: (error) => {
      console.error('❌ Start work order failed:', error);
      toast({
        title: 'Error',
        description: 'Failed to start work order. Please try again.',
        variant: 'destructive'
      });
    }
  });

  const updateStageMutation = useMutation({
    mutationFn: async ({ stageId, status }: { stageId: string; status: string }) => {
      const { data, error } = await supabase
        .from('work_order_stages')
        .update({
          status,
          started_at: status === 'in_progress' ? new Date().toISOString() : undefined,
          completed_at: status === 'completed' ? new Date().toISOString() : undefined,
          mechanic_id: profile?.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', stageId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-order-stages', defectId] });
    }
  });

  const completeWorkOrderMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc('complete_work_order' as any, {
        p_defect_id: defectId,
        p_mechanic_id: profile?.id
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-order-stages', defectId] });
      queryClient.invalidateQueries({ queryKey: ['defect', defectId] });
      toast({
        title: 'Work Order Completed',
        description: 'Work order has been completed successfully.',
      });
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-lg">Loading workflow...</p>
        </div>
      </div>
    );
  }

  if (!defect) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <p className="text-red-500 mb-4">Defect not found</p>
        <Button onClick={onClose} variant="outline">Close</Button>
      </div>
    );
  }

  const completedStages = (stages as any[]).filter(stage => stage.status === 'completed').length;
  const totalStages = stages.length;
  const progress = totalStages > 0 ? (completedStages / totalStages) * 100 : 0;
  const isWorkOrderStarted = (defect as any).status === 'repairing';
  const canStartWorkOrder = (defect as any).status === 'reported' || (defect as any).status === 'investigating';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Defect Workflow</h1>
          <p className="text-gray-600 mt-1">
            {(defect as any).defect_number} - {(defect as any).title}
          </p>
          <p className="text-sm text-gray-500">
            Type: {(defect as any).defect_type} | Source: {(defect as any).source_type}
          </p>
        </div>
        <Button onClick={onClose} variant="outline">
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Debug Information */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="text-yellow-800">Debug Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm space-y-1">
            <p><strong>Defect ID:</strong> {defectId}</p>
            <p><strong>Defect Type:</strong> {defect.defect_type}</p>
            <p><strong>Status:</strong> {defect.status}</p>
            <p><strong>Work Order Number:</strong> Not Available</p>
            <p><strong>Total Stages:</strong> {totalStages}</p>
            <p><strong>Completed Stages:</strong> {completedStages}</p>
            <p><strong>Can Start Work Order:</strong> {canStartWorkOrder ? 'Yes' : 'No'}</p>
            <p><strong>Is Work Order Started:</strong> {isWorkOrderStarted ? 'Yes' : 'No'}</p>
          </div>
        </CardContent>
      </Card>

      {/* Work Order Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="w-5 h-5" />
            Work Order Status
          </CardTitle>
          <CardDescription>
            Work Order Status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Progress</p>
                <p className="text-sm text-gray-600">
                  {completedStages} of {totalStages} stages completed
                </p>
              </div>
              <Badge variant={defect.status === 'resolved' ? 'default' : 'secondary'}>
                {defect.status}
              </Badge>
            </div>
            <Progress value={progress} className="w-full" />
            
            {canStartWorkOrder && (
              <Button 
                onClick={() => startWorkOrderMutation.mutate()}
                disabled={startWorkOrderMutation.isPending}
                className="w-full"
              >
                <Play className="w-4 h-4 mr-2" />
                {startWorkOrderMutation.isPending ? 'Starting...' : 'Start Work Order'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Workflow Stages */}
      {isWorkOrderStarted && stages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Workflow Stages</CardTitle>
            <CardDescription>
              Follow the workflow to complete the repair
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stages.map((stage) => (
                <div 
                  key={stage.id} 
                  className={`p-4 border rounded-lg ${
                    stage.status === 'completed' ? 'border-green-500 bg-green-50' :
                    stage.status === 'in_progress' ? 'border-yellow-500 bg-yellow-50' :
                    'border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{stage.stage_name}</span>
                      <Badge variant={
                        stage.status === 'completed' ? 'default' :
                        stage.status === 'in_progress' ? 'secondary' :
                        'outline'
                      }>
                        {stage.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      {stage.status === 'pending' && (
                        <Button 
                          onClick={() => updateStageMutation.mutate({ 
                            stageId: stage.id, 
                            status: 'in_progress' 
                          })}
                          size="sm"
                        >
                          Start
                        </Button>
                      )}
                      {stage.status === 'in_progress' && (
                        <Button 
                          onClick={() => updateStageMutation.mutate({ 
                            stageId: stage.id, 
                            status: 'completed' 
                          })}
                          size="sm"
                          variant="outline"
                        >
                          Complete
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{stage.notes}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Stages Warning */}
      {isWorkOrderStarted && stages.length === 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              No Workflow Stages Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700 mb-4">
              The work order was started but no workflow stages were created. This might be due to:
            </p>
            <ul className="text-red-700 text-sm space-y-1 mb-4">
              <li>• No workflow template found for defect type: <strong>{defect.defect_type}</strong></li>
              <li>• The start_work_order function failed to create stages</li>
              <li>• Database permissions issue</li>
            </ul>
            <Button 
              onClick={() => startWorkOrderMutation.mutate()}
              disabled={startWorkOrderMutation.isPending}
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-100"
            >
              <Play className="w-4 h-4 mr-2" />
              Retry Starting Work Order
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Complete Work Order */}
      {isWorkOrderStarted && completedStages === totalStages && totalStages > 0 && (
        <Card className="border-green-500 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle className="w-5 h-5" />
              Ready to Complete
            </CardTitle>
            <CardDescription className="text-green-700">
              All stages are completed. Ready to finalize the work order.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => completeWorkOrderMutation.mutate()}
              disabled={completeWorkOrderMutation.isPending}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Complete Work Order
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DefectWorkflow;
