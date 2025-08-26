
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCheck } from 'lucide-react';
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
  const navigate = useNavigate();

  const handleViewDriver = (driverId: string) => {
    navigate(`/drivers/${driverId}`);
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
            onViewDriver={handleViewDriver}
            onPasswordChange={onPasswordChange}
          />
        </CardContent>
      </Card>

      {/* Driver detail page navigation is handled by the table */}
    </>
  );
};

export default DriversList;
