import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StandardPageLayout, { MetricCard, NavigationTab } from '@/components/layout/StandardPageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { Award, User, BookOpen, ArrowLeft, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

interface AssignmentRow {
  id: string;
  driver_id: string;
  training_module_id: string;
  status?: string;
  progress?: number;
  due_date?: string;
  completed_at?: string;
  score?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  driver?: { first_name?: string; last_name?: string; email?: string } | null;
  training_modules?: { id: string; name: string; description?: string; category?: string; duration?: number; is_required?: boolean } | null;
}

const TrainingAssignmentDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState<AssignmentRow | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id || !profile?.organization_id) return;
      setLoading(true);
      try {
        // Try training_assignments first
        let { data: assignRow, error: assignErr } = await supabase
          .from('training_assignments')
          .select(`*, driver:profiles!training_assignments_driver_id_fkey(first_name,last_name,email), training_modules(*)`)
          .eq('id', id)
          .eq('organization_id', profile.organization_id)
          .maybeSingle();

        if (!assignRow || assignErr) {
          // Fallback to training_completions (treat as completed)
          const { data: compRow } = await supabase
            .from('training_completions')
            .select(`*, driver:profiles!training_completions_driver_id_fkey(first_name,last_name,email), training_modules(*)`)
            .eq('id', id)
            .eq('organization_id', profile.organization_id)
            .maybeSingle();

          if (compRow) {
            assignRow = {
              ...compRow,
              status: 'completed',
              progress: 100,
              due_date: null as any,
              completed_at: compRow.completed_at,
              score: compRow.score,
            } as unknown as AssignmentRow;
          }
        }

        setRecord(assignRow as AssignmentRow);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, profile?.organization_id]);

  const driverName = useMemo(() => {
    const d = record?.driver || undefined;
    const first = d?.first_name?.trim();
    const last = d?.last_name?.trim();
    if (first && last) return `${first} ${last}`;
    return d?.email || 'Unknown driver';
  }, [record]);

  const metrics: MetricCard[] = useMemo(() => {
    const progress = record?.progress ?? (record?.status === 'completed' ? 100 : 0);
    const status = record?.status || (record?.completed_at ? 'completed' : 'not_started');
    const due = record?.due_date ? format(new Date(record.due_date), 'MMM dd, yyyy p') : '—';
    return [
      { title: 'Status', value: status, icon: status === 'completed' ? <CheckCircle className="w-5 h-5 text-green-600" /> : <Clock className="w-5 h-5 text-blue-600" />, bgColor: status === 'completed' ? 'bg-green-100' : 'bg-blue-100', color: status === 'completed' ? 'text-green-600' : 'text-blue-600' },
      { title: 'Progress', value: `${progress}%`, icon: <Award className="w-5 h-5 text-purple-600" />, bgColor: 'bg-purple-100', color: 'text-purple-600' },
      { title: 'Due', value: due, icon: <AlertTriangle className="w-5 h-5 text-orange-600" />, bgColor: 'bg-orange-100', color: 'text-orange-600' },
      { title: 'Score', value: record?.score != null ? `${record.score}` : '—', icon: <BookOpen className="w-5 h-5 text-emerald-600" />, bgColor: 'bg-emerald-100', color: 'text-emerald-600' },
    ];
  }, [record]);

  const navTabs: NavigationTab[] = [
    { value: 'overview', label: 'Overview' },
    { value: 'questions', label: 'Questions' },
    { value: 'history', label: 'History' },
  ];

  return (
    <StandardPageLayout
      title={record?.training_modules?.name || 'Training Assignment'}
      description={`Driver: ${driverName}`}
      showMetricsDashboard={true}
      metricsCards={metrics}
      navigationTabs={navTabs}
      activeTab={'overview'}
      onTabChange={() => {}}
      isLoading={loading}
      loadingText="Loading training details..."
      customHeaderContent={
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" /> Module Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-600">Module</div>
                <div className="font-medium">{record?.training_modules?.name || '—'}</div>
              </div>
              <div>
                <div className="text-gray-600">Category</div>
                <div className="font-medium">{record?.training_modules?.category || '—'}</div>
              </div>
              <div>
                <div className="text-gray-600">Duration</div>
                <div className="font-medium">{record?.training_modules?.duration != null ? `${record.training_modules.duration} min` : '—'}</div>
              </div>
              <div>
                <div className="text-gray-600">Required</div>
                <div className="font-medium">{record?.training_modules?.is_required ? <Badge className="bg-blue-100 text-blue-800">Required</Badge> : 'Optional'}</div>
              </div>
            </div>
            {record?.training_modules?.description && (
              <div className="mt-4 text-sm text-gray-700">{record.training_modules.description}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" /> Driver Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-600">Driver</div>
                <div className="font-medium">{driverName}</div>
              </div>
              <div>
                <div className="text-gray-600">Status</div>
                <div>{record ? (record.status === 'completed' ? <Badge className="bg-green-100 text-green-800">Completed</Badge> : <Badge className="bg-blue-100 text-blue-800">{record.status || 'Not Started'}</Badge>) : '—'}</div>
              </div>
              <div className="md:col-span-2 flex items-center gap-3">
                <Progress value={record?.progress ?? (record?.status === 'completed' ? 100 : 0)} className="w-64" />
                <span className="text-gray-600">{record?.progress ?? (record?.status === 'completed' ? 100 : 0)}%</span>
              </div>
              <div>
                <div className="text-gray-600">Due</div>
                <div className="font-medium">{record?.due_date ? format(new Date(record.due_date), 'MMM dd, yyyy p') : '—'}</div>
              </div>
              <div>
                <div className="text-gray-600">Completed</div>
                <div className="font-medium">{record?.completed_at ? format(new Date(record.completed_at), 'MMM dd, yyyy p') : '—'}</div>
              </div>
              <div>
                <div className="text-gray-600">Score</div>
                <div className="font-medium">{record?.score != null ? record.score : '—'}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600">No questions found for this module. You can add a questions table later (e.g., training_questions) and we will render them here automatically.</div>
          </CardContent>
        </Card>
      </div>
    </StandardPageLayout>
  );
};

export default TrainingAssignmentDetail;


