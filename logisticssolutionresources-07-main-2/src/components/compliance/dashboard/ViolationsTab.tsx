
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface Violation {
  id: string;
  violation_type: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'resolved';
  violation_date: string;
  driver_id: string;
  resolved_date?: string;
  violation_code?: string;
  fine_amount?: number;
}

interface ViolationsTabProps {
  violations: Violation[];
}

const getSeverityBadgeColor = (severity: string) => {
  switch (severity) {
    case 'minor': return 'bg-blue-100 text-blue-800';
    case 'major': return 'bg-yellow-100 text-yellow-800';
    case 'severe': return 'bg-orange-100 text-orange-800';
    case 'critical': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const ViolationsTab: React.FC<ViolationsTabProps> = ({ violations }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>All Compliance Violations</CardTitle>
        <CardDescription>
          Monitor and manage compliance violations across your organization
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {violations?.map((violation) => (
            <div key={violation.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-medium">{violation.violation_type}</h4>
                  <p className="text-sm text-gray-600 mt-1">{violation.description}</p>
                </div>
                <Badge className={getSeverityBadgeColor(violation.severity)}>
                  {violation.severity}
                </Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mt-3">
                <div>
                  <span className="font-medium">Date:</span> {format(new Date(violation.violation_date), 'MMM dd, yyyy')}
                </div>
                <div>
                  <span className="font-medium">Code:</span> {violation.violation_code || 'N/A'}
                </div>
                <div>
                  <span className="font-medium">Fine:</span> {violation.fine_amount ? `$${violation.fine_amount}` : 'N/A'}
                </div>
                <div>
                  <span className="font-medium">Status:</span> {violation.status}
                </div>
              </div>
            </div>
          ))}
          {(!violations || violations.length === 0) && (
            <p className="text-gray-500 text-center py-8">No violations found</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ViolationsTab;
