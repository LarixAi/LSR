
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface License {
  id: string;
  license_number: string;
  expiry_date: string;
  status: string;
  driver_id: string;
  license_type?: string;
  issuing_authority?: string;
  restrictions?: string[];
}

interface LicensesTabProps {
  licenses: License[];
}

const LicensesTab: React.FC<LicensesTabProps> = ({ licenses }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Driver Licenses</CardTitle>
        <CardDescription>
          Monitor driver license status and expiry dates
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {licenses?.map((license) => (
            <div key={license.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-medium">{license.license_type}</h4>
                  <p className="text-sm text-gray-600">License Number: {license.license_number}</p>
                  <p className="text-sm text-gray-600">Authority: {license.issuing_authority}</p>
                </div>
                <div className="text-right">
                  <Badge variant={license.status === 'active' ? 'default' : 'destructive'}>
                    {license.status}
                  </Badge>
                  <p className="text-sm text-gray-600 mt-1">
                    Expires: {format(new Date(license.expiry_date), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>
              {license.restrictions && license.restrictions.length > 0 && (
                <div className="mt-2">
                  <span className="text-sm font-medium">Restrictions: </span>
                  <span className="text-sm text-gray-600">{license.restrictions.join(', ')}</span>
                </div>
              )}
            </div>
          ))}
          {(!licenses || licenses.length === 0) && (
            <p className="text-gray-500 text-center py-8">No licenses found</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LicensesTab;
