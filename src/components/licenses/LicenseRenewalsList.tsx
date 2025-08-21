
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { RotateCcw, DollarSign } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const LicenseRenewalsList = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch real license renewals data from backend
  const { data: renewals = [], isLoading } = useQuery({
    queryKey: ['license-renewals', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('license_renewals')
        .select(`
          *,
          driver_license:driver_licenses(
            license_number,
            license_type,
            profile:profiles(first_name, last_name)
          )
        `)
        .order('renewal_date', { ascending: false });

      if (error) {
        console.error('Error fetching license renewals:', error);
        toast({
          title: "Error",
          description: "Failed to load license renewals",
          variant: "destructive"
        });
        return [];
      }

      return data || [];
    },
    enabled: !!user
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
          {renewals.length === 0 ? (
            <div className="text-center py-8">
              <RotateCcw className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No license renewals found</p>
            </div>
          ) : (
            renewals.map((renewal) => (
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
                        {renewal.renewal_cost.toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Previous Expiry:</span>
                    <div className="font-medium">
                      {format(new Date(renewal.previous_expiry_date), 'MMM dd, yyyy')}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">New Expiry:</span>
                    <div className="font-medium">
                      {format(new Date(renewal.new_expiry_date), 'MMM dd, yyyy')}
                    </div>
                  </div>
                </div>
                
                {renewal.notes && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Notes:</span> {renewal.notes}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LicenseRenewalsList;
