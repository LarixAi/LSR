// @ts-nocheck
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useInspectionById } from '@/hooks/useVehicleInspections';
import { CheckCircle, XCircle, AlertTriangle, Clock, MapPin, User, Truck, FileText, Download } from 'lucide-react';
import { format } from 'date-fns';

interface AdminInspectionViewerProps {
  inspectionId: string;
}

const AdminInspectionViewer: React.FC<AdminInspectionViewerProps> = ({ inspectionId }) => {
  const { data: inspection, isLoading, error } = useInspectionById(inspectionId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !inspection) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Failed to load inspection details.</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'passed':
        return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="h-3 w-3 mr-1" />Passed</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      case 'flagged':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600"><AlertTriangle className="h-3 w-3 mr-1" />Flagged</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  const getResponseIcon = (response: string) => {
    switch (response) {
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'fail':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'flag':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <div className="h-4 w-4 bg-gray-300 rounded-full" />;
    }
  };

  const groupedQuestions = inspection.inspection_questions?.reduce((acc, q) => {
    if (!acc[q.question_category]) {
      acc[q.question_category] = [];
    }
    acc[q.question_category].push(q);
    return acc;
  }, {} as Record<string, typeof inspection.inspection_questions>);

  const duration = (inspection.walkaround_data as any)?.duration_minutes || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Vehicle Safety Inspection
                {inspection.defect_number && (
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                    {inspection.defect_number}
                  </Badge>
                )}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Inspection ID: {inspection.id}
              </p>
            </div>
            <div className="flex gap-2">
              {getStatusBadge(inspection.overall_status)}
              <Button size="sm" variant="outline">
                <Download className="h-4 w-4 mr-1" />
                Export PDF
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Driver Info */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                Driver Information
              </h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p><strong>Name:</strong> Driver Name</p>
                <p><strong>Employee ID:</strong> EMP001</p>
                <p><strong>License:</strong> CDL-123456</p>
              </div>
            </div>

            {/* Vehicle Info */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Truck className="h-4 w-4" />
                Vehicle Information
              </h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p><strong>Vehicle:</strong> {(inspection.vehicles as any)?.vehicle_number}</p>
                <p><strong>Make/Model:</strong> {(inspection.vehicles as any)?.make} {(inspection.vehicles as any)?.model}</p>
                <p><strong>License Plate:</strong> {(inspection.vehicles as any)?.license_plate}</p>
              </div>
            </div>

            {/* Inspection Details */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Inspection Details
              </h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p><strong>Date:</strong> {format(new Date(inspection.inspection_date), 'PPP')}</p>
                <p><strong>Start Time:</strong> {format(new Date(inspection.start_time), 'HH:mm')}</p>
                <p><strong>Duration:</strong> {duration} minutes</p>
                <p><strong>Type:</strong> {inspection.inspection_type}</p>
              </div>
            </div>
          </div>

          {/* Location */}
          {(inspection.location_data as any)?.address && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <strong>Location:</strong> {(inspection.location_data as any).address}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inspection Questions by Category */}
      {groupedQuestions && Object.entries(groupedQuestions).map(([category, questions]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="text-lg">{category} Inspection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {questions.map((question, index) => (
                <div key={question.id} className="flex items-start gap-3 p-3 rounded-lg border">
                  {getResponseIcon(question.response)}
                  <div className="flex-1 space-y-1">
                    <p className="font-medium">{question.question_text}</p>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={
                          question.response === 'pass' ? 'default' :
                          question.response === 'fail' ? 'destructive' :
                          question.response === 'flag' ? 'secondary' : 'outline'
                        }
                        className="capitalize"
                      >
                        {question.response}
                      </Badge>
                      {question.notes && (
                        <p className="text-sm text-muted-foreground">{question.notes}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* General Notes & Signature */}
      {(inspection.notes || inspection.signature_data) && (
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {inspection.notes && (
              <div>
                <h4 className="font-medium mb-2">General Notes</h4>
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                  {inspection.notes}
                </p>
              </div>
            )}
            
            {inspection.signature_data && (
              <div>
                <h4 className="font-medium mb-2">Digital Signature</h4>
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                  {inspection.signature_data}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminInspectionViewer;