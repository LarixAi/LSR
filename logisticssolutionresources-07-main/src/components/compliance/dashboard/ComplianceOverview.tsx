
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, FileText } from 'lucide-react';
import { format } from 'date-fns';

interface ComplianceOverviewProps {
  complianceOverview: any;
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

const ComplianceOverview: React.FC<ComplianceOverviewProps> = ({ complianceOverview }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Recent Violations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <span>Recent Violations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {complianceOverview?.violations.slice(0, 5).map((violation) => (
              <div key={violation.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{violation.violation_type}</p>
                  <p className="text-sm text-gray-600">{format(new Date(violation.violation_date), 'MMM dd, yyyy')}</p>
                </div>
                <Badge className={getSeverityBadgeColor(violation.severity)}>
                  {violation.severity}
                </Badge>
              </div>
            ))}
            {(!complianceOverview?.violations || complianceOverview.violations.length === 0) && (
              <p className="text-gray-500 text-center py-4">No recent violations</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* License Expiries */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-500" />
            <span>Upcoming License Expiries</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {complianceOverview?.licenses
              .filter(license => {
                const expiryDate = new Date(license.expiry_date);
                const thirtyDaysFromNow = new Date();
                thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
                return expiryDate <= thirtyDaysFromNow && license.status === 'active';
              })
              .slice(0, 5)
              .map((license) => (
                <div key={license.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{license.license_type}</p>
                    <p className="text-sm text-gray-600">License: {license.license_number}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-red-600">
                      {format(new Date(license.expiry_date), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
              ))}
            {(!complianceOverview?.licenses || complianceOverview.licenses.filter(l => {
              const expiryDate = new Date(l.expiry_date);
              const thirtyDaysFromNow = new Date();
              thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
              return expiryDate <= thirtyDaysFromNow && l.status === 'active';
            }).length === 0) && (
              <p className="text-gray-500 text-center py-4">No upcoming expiries</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComplianceOverview;
