import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Fuel, Plus, TrendingUp, Calendar, MapPin } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import FuelPurchaseForm from '@/components/driver/FuelPurchaseForm';
import { Badge } from '@/components/ui/badge';

const FuelManagement = () => {
  const { user, profile, loading } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);

  // Fetch fuel purchases data
  const { data: fuelPurchases = [], isLoading: purchasesLoading } = useQuery({
    queryKey: ['fuel-purchases', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      
      let query = supabase
        .from('fuel_purchases')
        .select('*')
        .order('purchase_date', { ascending: false })
        .limit(50);

      // If driver, only show their purchases
      if (profile.role === 'driver') {
        query = query.eq('driver_id', user.id);
      } else {
        // Admin/council can see all in organization
        query = query.eq('organization_id', profile.organization_id);
      }

      const { data: purchases, error } = await query;
      if (error) throw error;

      if (!purchases?.length) return [];

      // Get vehicle and driver details separately
      const vehicleIds = [...new Set(purchases.map(p => p.vehicle_id))];
      const driverIds = [...new Set(purchases.map(p => p.driver_id))];

      const [vehiclesData, driversData] = await Promise.all([
        supabase
          .from('vehicles')
          .select('id, vehicle_number, make, model, license_plate')
          .in('id', vehicleIds),
        supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .in('id', driverIds)
      ]);

      const vehicleMap = new Map(vehiclesData.data?.map(v => [v.id, v]) || []);
      const driverMap = new Map(driversData.data?.map(d => [d.id, d]) || []);

      return purchases.map(purchase => ({
        ...purchase,
        vehicles: vehicleMap.get(purchase.vehicle_id),
        profiles: driverMap.get(purchase.driver_id)
      }));
    },
    enabled: !!profile?.organization_id
  });

  // Calculate statistics
  const stats = {
    totalPurchases: fuelPurchases.length,
    totalCost: fuelPurchases.reduce((sum, p) => sum + (p.total_cost || 0), 0),
    totalQuantity: fuelPurchases.reduce((sum, p) => sum + (p.quantity || 0), 0),
    averagePrice: fuelPurchases.length > 0 
      ? fuelPurchases.reduce((sum, p) => sum + (p.unit_price || 0), 0) / fuelPurchases.length 
      : 0
  };

  if (loading || purchasesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/auth" replace />;
  }

  // Only admins, council, and drivers can access
  if (!['admin', 'council', 'driver'].includes(profile.role)) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fuel Management</h1>
          <p className="text-muted-foreground">
            Track and manage fuel consumption, costs, and efficiency
          </p>
        </div>
        {profile.role === 'driver' && (
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Purchase
          </Button>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Purchases</p>
                <p className="text-2xl font-bold">{stats.totalPurchases}</p>
              </div>
              <Fuel className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Cost</p>
                <p className="text-2xl font-bold">£{stats.totalCost.toFixed(2)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Quantity</p>
                <p className="text-2xl font-bold">{stats.totalQuantity.toFixed(1)}L</p>
              </div>
              <Fuel className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Price</p>
                <p className="text-2xl font-bold">£{stats.averagePrice.toFixed(3)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="purchases" className="w-full">
        <TabsList>
          <TabsTrigger value="purchases">Recent Purchases</TabsTrigger>
          {profile.role === 'driver' && showAddForm && (
            <TabsTrigger value="add">Add Purchase</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="purchases" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fuel Purchases</CardTitle>
            </CardHeader>
            <CardContent>
              {fuelPurchases.length === 0 ? (
                <div className="text-center py-8">
                  <Fuel className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No fuel purchases recorded</h3>
                  <p className="text-muted-foreground">
                    {profile.role === 'driver' 
                      ? 'Click "Add Purchase" to record your first fuel purchase.'
                      : 'Fuel purchases from drivers will appear here once recorded.'}
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
                            <span className="font-medium">
                              {purchase.vehicles?.vehicle_number} - {purchase.vehicles?.make} {purchase.vehicles?.model}
                            </span>
                            <Badge variant="secondary">{purchase.fuel_type}</Badge>
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
                          {profile.role !== 'driver' && (
                            <div className="text-sm text-muted-foreground">
                              Driver: {purchase.profiles?.first_name} {purchase.profiles?.last_name}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">£{purchase.total_cost?.toFixed(2)}</div>
                        <div className="text-sm text-muted-foreground">
                          {purchase.quantity}L @ £{purchase.unit_price?.toFixed(3)}/L
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {profile.role === 'driver' && showAddForm && (
          <TabsContent value="add">
            <FuelPurchaseForm onComplete={() => setShowAddForm(false)} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default FuelManagement;