import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wrench, Paperclip } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import DefectWorkflow from '@/components/defects/DefectWorkflow';
import DefaultViewPageLayout from '@/components/layout/DefaultViewPageLayout';

const DefectReportDetail: React.FC = () => {
  const { id } = useParams();

  const { data: defect, isLoading } = useQuery({
    queryKey: ['defect-report', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('defect_reports' as any)
        .select('*')
        .eq('id', id)
        .single();
      if (error) {
        console.error('Failed to load defect', error);
        return null;
      }
      return data as any;
    },
    enabled: !!id,
  });

  const navigationItems = [
    { id: 'summary', label: 'Summary' },
    { id: 'vehicle-location', label: 'Vehicle & Location' },
    { id: 'dates-costs', label: 'Dates & Costs' },
    { id: 'description', label: 'Description' },
    { id: 'workflow', label: 'Workflow' },
    { id: 'attachments', label: 'Attachments' }
  ];

  const rightContent = defect ? (
    <>
      <Badge variant="secondary" className="capitalize">{defect.status}</Badge>
      <Badge variant="outline" className="capitalize">{defect.severity}</Badge>
    </>
  ) : null;

  return (
    <DefaultViewPageLayout
      title={defect?.defect_number || 'Defect Report'}
      subtitle={defect?.title || 'View defect details and manage workflow'}
      backUrl="/defect-reports"
      backLabel="Back to Defect Reports"
      rightContent={rightContent}
      navigationItems={navigationItems}
      isLoading={isLoading}
    >
      {/* Summary */}
      <Card id="summary">
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-sm text-gray-500">Defect Number</div>
              <div className="mt-1 font-medium">{defect?.defect_number}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Type</div>
              <div className="mt-1"><Badge variant="outline">{defect?.defect_type}</Badge></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vehicle & Location */}
      <Card id="vehicle-location">
        <CardHeader>
          <CardTitle>Vehicle & Location</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-sm text-gray-500">Vehicle</div>
              <div className="mt-1">—</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Location</div>
              <div className="mt-1">{defect?.location || '—'}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dates & Costs */}
      <Card id="dates-costs">
        <CardHeader>
          <CardTitle>Dates & Costs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-sm text-gray-500">Reported</div>
              <div className="mt-1">{defect?.defect_date ? new Date(defect.defect_date).toLocaleString() : '—'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Last Updated</div>
              <div className="mt-1">{defect?.updated_at ? new Date(defect.updated_at).toLocaleString() : '—'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Estimated Cost</div>
              <div className="mt-1">£{defect?.estimated_cost || 0}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Actual Cost</div>
              <div className="mt-1">£{defect?.actual_cost || 0}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Description */}
      <Card id="description">
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-gray-700 whitespace-pre-wrap">{defect?.description || '—'}</div>
        </CardContent>
      </Card>

      {/* Workflow */}
      <Card id="workflow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Wrench className="w-4 h-4" /> Workflow</CardTitle>
        </CardHeader>
        <CardContent>
          {defect && <DefectWorkflow defectId={defect.id} onClose={() => {}} />}
        </CardContent>
      </Card>

      {/* Attachments */}
      <Card id="attachments">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Paperclip className="w-4 h-4" /> Attachments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">No attachments uploaded.</div>
        </CardContent>
      </Card>
    </DefaultViewPageLayout>
  );
};

export default DefectReportDetail;
