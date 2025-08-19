
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCheck } from 'lucide-react';
// Removed import for deleted component
import DriversTable from './DriversTable';
import type { Tables } from '@/integrations/supabase/types';

type Driver = Tables<'profiles'>;

interface DriversListProps {
  drivers: Driver[];
  isLoading: boolean;
  onPasswordChange?: (driver: {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    organization_id?: string;
  }) => void;
}

const DriversList = ({ drivers, isLoading, onPasswordChange }: DriversListProps) => {
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const [onboardingDialogOpen, setOnboardingDialogOpen] = useState(false);

  const handleViewOnboarding = (driverId: string) => {
    setSelectedDriverId(driverId);
    setOnboardingDialogOpen(true);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading drivers...</div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UserCheck className="w-5 h-5" />
            <span>Drivers Overview</span>
          </CardTitle>
          <CardDescription>
            Manage driver onboarding and employment status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DriversTable 
            drivers={drivers} 
            onViewOnboarding={handleViewOnboarding}
            onPasswordChange={onPasswordChange}
          />
        </CardContent>
      </Card>

      {/* Removed DriverOnboardingDialog - component was deleted */}
    </>
  );
};

export default DriversList;
