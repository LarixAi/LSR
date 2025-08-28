import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Car, Fuel, Wrench, Calendar, MapPin, TrendingUp } from 'lucide-react';

export default function VehicleDetails() {
  const { vehicleId } = useParams<{ vehicleId: string }>();
  const { profile } = useAuth();

  // Fetch vehicle details
  const { data: vehicle, isLoading: vehicleLoading } = useQuery({
    queryKey: ['vehicle-details', vehicleId],
    queryFn: async () => {
      if (!vehicleId) throw new Error('Vehicle ID required');
      
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', vehicleId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!vehicleId
  });

  // Fetch fuel purchases for this vehicle
  const { data: fuelPurchases = [] } = useQuery({
    queryKey: ['vehicle-fuel-purchases', vehicleId],
    queryFn: async () => {
      if (!vehicleId) return [];
      
      const { data: purchases, error } = await supabase
        .from('fuel_purchases')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .order('purchase_date', { ascending: false })
        .limit(20);

      if (error) throw error;
      if (!purchases?.length) return [];

      // Get driver details separately
      const driverIds = [...new Set(purchases.map(p => p.driver_id))];
      const { data: drivers } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', driverIds);

      const driverMap = new Map(drivers?.map(d => [d.id, d]) || []);

      return purchases.map(purchase => ({
        ...purchase,
        profiles: driverMap.get(purchase.driver_id)
      }));
    },
    enabled: !!vehicleId
  });

  // Fetch vehicle checks for this vehicle
  const { data: vehicleChecks = [] } = useQuery({
    queryKey: ['vehicle-checks', vehicleId],
    queryFn: async () => {
      if (!vehicleId) return [];
      
      const { data: checks, error } = await supabase
        .from('vehicle_checks')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .order('check_date', { ascending: false })
        .limit(10);

      if (error) throw error;
      if (!checks?.length) return [];

      // Get driver details separately  
      const driverIds = [...new Set(checks.map(c => c.driver_id))];
      const { data: drivers } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', driverIds);

      const driverMap = new Map(drivers?.map(d => [d.id, d]) || []);

      return checks.map(check => ({
        ...check,
        profiles: driverMap.get(check.driver_id)
      }));
    },
    enabled: !!vehicleId
  });

  if (!vehicleId) {
    return <Navigate to="/vehicles" replace />;
  }

  if (vehicleLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-lg">Loading vehicle details...</p>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="text-center py-8">
        <h1 className="text-2xl font-bold mb-4">Vehicle Not Found</h1>
        <p className="text-muted-foreground">The requested vehicle could not be found.</p>
      </div>
    );
  }

  // Calculate fuel statistics
  const fuelStats = {
    totalPurchases: fuelPurchases.length,
    totalCost: fuelPurchases.reduce((sum, p) => sum + (p.total_cost || 0), 0),
    totalQuantity: fuelPurchases.reduce((sum, p) => sum + (p.quantity || 0), 0),
    averagePrice: fuelPurchases.length > 0 
      ? fuelPurchases.reduce((sum, p) => sum + (p.unit_price || 0), 0) / fuelPurchases.length 
      : 0
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{vehicle.vehicle_number}</h1>
          <p className="text-muted-foreground">
            {vehicle.make} {vehicle.model} ({vehicle.year}) - {vehicle.license_plate}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={vehicle.status === 'active' ? 'default' : 'secondary'}>
            {vehicle.status}
          </Badge>
          {vehicle.vehicle_type && (
            <Badge variant="outline">{vehicle.vehicle_type}</Badge>
          )}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Fuel Level</p>
                <p className="text-2xl font-bold">{vehicle.fuel_level || 0}%</p>
              </div>
              <Fuel className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Fuel Purchases</p>
                <p className="text-2xl font-bold">{fuelStats.totalPurchases}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Fuel Cost</p>
                <p className="text-2xl font-bold">£{fuelStats.totalCost.toFixed(2)}</p>
              </div>
              <Fuel className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Vehicle Checks</p>
                <p className="text-2xl font-bold">{vehicleChecks.length}</p>
              </div>
              <Wrench className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="fuel" className="w-full">
        <TabsList>
          <TabsTrigger value="fuel">Fuel History</TabsTrigger>
          <TabsTrigger value="checks">Vehicle Checks</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        <TabsContent value="fuel" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fuel Purchase History</CardTitle>
            </CardHeader>
            <CardContent>
              {fuelPurchases.length === 0 ? (
                <div className="text-center py-8">
                  <Fuel className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No fuel purchases recorded</h3>
                  <p className="text-muted-foreground">
                    Fuel purchase history for this vehicle will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {fuelPurchases.map((purchase) => (
                    <div key={purchase.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-primary/10 rounded-full">
                          <Fuel className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{purchase.fuel_type}</span>
                            <Badge variant="secondary">{purchase.quantity}L</Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(purchase.purchase_date).toLocaleDateString()}
                            </span>
                            {purchase.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {purchase.location}
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Driver: {purchase.profiles?.first_name} {purchase.profiles?.last_name}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">£{purchase.total_cost?.toFixed(2)}</div>
                        <div className="text-sm text-muted-foreground">
                          £{purchase.unit_price?.toFixed(3)}/L
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="checks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Inspection History</CardTitle>
            </CardHeader>
            <CardContent>
              {vehicleChecks.length === 0 ? (
                <div className="text-center py-8">
                  <Wrench className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No vehicle checks recorded</h3>
                  <p className="text-muted-foreground">
                    Vehicle inspection history will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {vehicleChecks.map((check) => (
                    <div key={check.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-primary/10 rounded-full">
                          <Wrench className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{check.check_type}</span>
                            <Badge variant={check.pass_fail ? 'default' : 'destructive'}>
                              {check.pass_fail ? 'Pass' : 'Fail'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(check.check_date).toLocaleDateString()}
                            </span>
                            <span>Score: {check.score || 'N/A'}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Inspector: {check.profiles?.first_name} {check.profiles?.last_name}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={check.compliance_status === 'passed' ? 'default' : 'destructive'}>
                          {check.compliance_status || 'pending'}
                        </Badge>
                        {check.defects_found > 0 && (
                          <div className="text-sm text-destructive mt-1">
                            {check.defects_found} defect(s) found
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Vehicle Number</h3>
                  <p className="text-sm font-mono bg-muted p-2 rounded">{vehicle.vehicle_number}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">License Plate</h3>
                  <p className="text-sm font-mono bg-muted p-2 rounded">{vehicle.license_plate}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Make & Model</h3>
                  <p>{vehicle.make} {vehicle.model}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Year</h3>
                  <p>{vehicle.year}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Status</h3>
                  <Badge variant={vehicle.status === 'active' ? 'default' : 'secondary'}>
                    {vehicle.status}
                  </Badge>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Current Fuel Level</h3>
                  <p>{vehicle.fuel_level || 0}%</p>
                </div>
                {vehicle.last_maintenance_date && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Last Maintenance</h3>
                    <p>{new Date(vehicle.last_maintenance_date).toLocaleDateString()}</p>
                  </div>
                )}
                {vehicle.next_maintenance_date && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Next Maintenance</h3>
                    <p>{new Date(vehicle.next_maintenance_date).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}