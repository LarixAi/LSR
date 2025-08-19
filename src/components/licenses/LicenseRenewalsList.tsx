
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { RotateCcw, DollarSign } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

const LicenseRenewalsList = () => {
  // Mock license renewals data since license_renewals table doesn't exist
  const { data: mockRenewals = [], isLoading } = useQuery({
    queryKey: ['license-renewals'],
    queryFn: async () => {
      // Mock data for demonstration
      const mockData = [
        {
          id: 'renewal-1',
          license_id: 'license-1',
          renewal_date: new Date().toISOString().split('T')[0],
          previous_expiry_date: '2023-12-31',
          new_expiry_date: '2024-12-31',
          renewal_cost: 150.00,
          notes: 'Annual license renewal completed',
          driver_license: {
            license_number: 'DL123456',
            license_type: 'Professional',
            profile: {
              first_name: 'John',
              last_name: 'Doe'
            }
          }
        },
        {
          id: 'renewal-2',
          license_id: 'license-2',
          renewal_date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
          previous_expiry_date: '2023-06-30',
          new_expiry_date: '2024-06-30',
          renewal_cost: 175.00,
          notes: 'Commercial license renewal with endorsements',
          driver_license: {
            license_number: 'DL789012',
            license_type: 'Commercial',
            profile: {
              first_name: 'Jane',
              last_name: 'Smith'
            }
          }
        }
      ];
      
      return mockData;
    }
  });

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
          <RotateCcw className="w-5 h-5" />
          <span>License Renewals</span>
        </CardTitle>
        <CardDescription>
          History of license renewals and updates
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockRenewals.map((renewal) => (
            <div key={renewal.id} className="border rounded-lg p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-medium">
                    {renewal.driver_license?.profile 
                      ? `${renewal.driver_license.profile.first_name} ${renewal.driver_license.profile.last_name}`
                      : 'Unknown Driver'
                    }
                  </div>
                  <div className="text-sm text-gray-600">
                    {renewal.driver_license?.license_type} - {renewal.driver_license?.license_number}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {format(new Date(renewal.renewal_date), 'MMM dd, yyyy')}
                  </div>
                  {renewal.renewal_cost && (
                    <div className="text-sm text-gray-600 flex items-center">
                      <DollarSign className="w-3 h-3 mr-1" />
                      {renewal.renewal_cost}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                <div>
                  <span className="font-medium">Previous Expiry:</span><br />
                  {format(new Date(renewal.previous_expiry_date), 'MMM dd, yyyy')}
                </div>
                <div>
                  <span className="font-medium">New Expiry:</span><br />
                  {format(new Date(renewal.new_expiry_date), 'MMM dd, yyyy')}
                </div>
              </div>

              {renewal.notes && (
                <div className="bg-gray-50 rounded p-2 text-sm">
                  <span className="font-medium">Notes:</span> {renewal.notes}
                </div>
              )}
            </div>
          ))}

          {mockRenewals.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No license renewals found.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LicenseRenewalsList;
