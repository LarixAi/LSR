
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { AlertTriangle, DollarSign } from 'lucide-react';
import { useLicenseViolations } from '@/hooks/useLicenseViolations';

const LicenseViolationsList = () => {
  const { data: violations = [], isLoading } = useLicenseViolations();

  const getViolationStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-red-100 text-red-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'disputed': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5" />
          <span>License Violations</span>
        </CardTitle>
        <CardDescription>
          License-related violations and penalties
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {violations.map((violation) => (
            <div key={violation.id} className="border rounded-lg p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-medium">
                    {violation.driver_licenses.profiles 
                      ? `${violation.driver_licenses.profiles.first_name} ${violation.driver_licenses.profiles.last_name}`
                      : 'Unknown Driver'
                    }
                  </div>
                  <div className="text-sm text-gray-600">
                    {violation.driver_licenses.license_type} - {violation.driver_licenses.license_number}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getViolationStatusColor(violation.status)}>
                    {violation.status.toUpperCase()}
                  </Badge>
                  <div className="text-sm text-gray-600">
                    {format(new Date(violation.violation_date), 'MMM dd, yyyy')}
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <div className="font-medium text-red-600">{violation.violation_type}</div>
                <div className="text-sm text-gray-600 mt-1">{violation.description}</div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                {violation.fine_amount && (
                  <div className="flex items-center">
                    <DollarSign className="w-3 h-3 mr-1" />
                    <span>Fine: ${violation.fine_amount}</span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {violations.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No license violations found.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LicenseViolationsList;
