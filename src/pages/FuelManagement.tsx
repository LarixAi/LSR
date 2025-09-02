import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Fuel, Plus, Eye, Edit, Trash2, TrendingUp, DollarSign, BarChart3 } from 'lucide-react';
import StandardPageLayout, { NavigationTab, MetricCard, TableColumn, FilterOption } from '@/components/layout/StandardPageLayout';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { useFuelPurchases, useDeleteFuelPurchase, useFuelStatistics, type FuelPurchaseWithDetails } from '@/hooks/useFuelPurchases';

const FuelManagement = () => {
  const { user, profile, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [fuelTypeFilter, setFuelTypeFilter] = useState('all');
  const [viewingPurchase, setViewingPurchase] = useState<FuelPurchaseWithDetails | null>(null);

  // Fetch real data from backend
  const { data: fuelPurchases = [], isLoading: fuelLoading, error, refetch } = useFuelPurchases();
  const deleteFuelPurchase = useDeleteFuelPurchase();
  const { statistics } = useFuelStatistics();

  // For now, use the same data for all users since the admin view needs the fuel_purchases table in types
  const allFuelPurchases = fuelPurchases;

  // Add/Edit handled on dedicated page

  if (loading) {
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

  // Use appropriate data based on user role
  const displayPurchases = ['admin', 'council'].includes(profile.role) ? allFuelPurchases : fuelPurchases;
  const isLoading = fuelLoading;

  // Filter purchases
  const filteredPurchases = displayPurchases.filter(purchase => {
    const matchesSearch = 
      purchase.vehicle_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.driver_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFuelType = fuelTypeFilter === 'all' || purchase.fuel_type === fuelTypeFilter;
    
    return matchesSearch && matchesFuelType;
  });

  const getFuelTypeBadge = (fuelType: string) => (
    <Badge variant="outline">{fuelType.charAt(0).toUpperCase() + fuelType.slice(1)}</Badge>
  );

  // no inline submit; handled in AddFuel page

  const handleEdit = (purchase: FuelPurchaseWithDetails) => {
    navigate(`/fuel-management/add?mode=edit&id=${encodeURIComponent(purchase.id)}`);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this fuel purchase?')) {
      await deleteFuelPurchase.mutateAsync(id);
    }
  };

  const navigationTabs: NavigationTab[] = [
    { value: 'overview', label: 'Overview' },
    { value: 'purchases', label: 'Purchase History', badge: filteredPurchases.length },
    { value: 'analytics', label: 'Analytics' },
  ];

  const metricsCards: MetricCard[] = [
    { title: 'Total Spent', value: `£${statistics.totalSpent.toFixed(2)}`, icon: <DollarSign className="w-5 h-5" /> },
    { title: 'Total Fuel', value: `${statistics.totalQuantity.toFixed(1)}L`, icon: <Fuel className="w-5 h-5" /> },
    { title: 'Avg Price/L', value: `£${statistics.averagePrice.toFixed(2)}`, icon: <TrendingUp className="w-5 h-5" /> },
    { title: 'Purchases', value: statistics.purchaseCount, icon: <BarChart3 className="w-5 h-5" /> },
  ];

  const filters: FilterOption[] = [
    { label: 'Fuel Type', value: fuelTypeFilter, options: [
      { value: 'all', label: 'All Types' },
      { value: 'diesel', label: 'Diesel' },
      { value: 'petrol', label: 'Petrol' },
      { value: 'electric', label: 'Electric' },
    ], placeholder: 'Filter fuel type' }
  ];

  const tableColumns: TableColumn[] = [
    { key: 'vehicle', label: 'Vehicle', render: (p: any) => (
      <div>
        <div className="font-medium">{p.vehicle_number}</div>
        <div className="text-sm text-muted-foreground">{p.license_plate}</div>
      </div>
    ) },
    ...( ['admin','council'].includes(profile.role) ? [{ key: 'driver_name', label: 'Driver' } as TableColumn] : []),
    { key: 'purchase_date', label: 'Date', render: (p: any) => format(new Date(p.purchase_date), 'MMM dd, yyyy') },
    { key: 'fuel_type', label: 'Fuel', render: (p: any) => getFuelTypeBadge(p.fuel_type) },
    { key: 'quantity', label: 'Quantity', render: (p: any) => `${p.quantity}L` },
    { key: 'total_cost', label: 'Total Cost', render: (p: any) => `£${p.total_cost.toFixed(2)}` },
    { key: 'location', label: 'Location' },
    { key: 'actions', label: 'Actions', render: (p: any) => (
      <div className="flex items-center justify-end space-x-2">
        <Button variant="ghost" size="sm" onClick={() => setViewingPurchase(p)}><Eye className="w-4 h-4" /></Button>
        <Button variant="ghost" size="sm" onClick={() => handleEdit(p)}><Edit className="w-4 h-4" /></Button>
        <Button variant="ghost" size="sm" onClick={() => handleDelete(p.id)}><Trash2 className="w-4 h-4" /></Button>
      </div>
    ), align: 'right' },
  ];

  return (
    <StandardPageLayout
      title="Fuel Management"
      description="Track and manage fuel consumption, costs, and efficiency"
      navigationTabs={navigationTabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      metricsCards={metricsCards}
      showMetricsDashboard={true}
      secondaryActions={[{ label: 'Add Purchase', onClick: () => navigate('/fuel-management/add'), icon: <Plus className="w-4 h-4" /> }]}
      searchConfig={{ placeholder: 'Search purchases...', value: searchTerm, onChange: setSearchTerm, showSearch: true }}
      filters={filters}
      onFilterChange={(k,v)=>{ if(k==='Fuel Type') setFuelTypeFilter(v); }}
      showTable={activeTab==='purchases'}
      tableData={activeTab==='purchases' ? filteredPurchases : []}
      tableColumns={activeTab==='purchases' ? tableColumns : []}
      isLoading={isLoading}
    >
      {/* Content based on active tab */}
      {activeTab === 'overview' && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Fuel Purchases</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredPurchases.length === 0 ? (
              <div className="text-center py-8">
                <Fuel className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No fuel purchases found</h3>
                <p className="text-muted-foreground mb-4">
                  Start tracking your fuel consumption by adding your first purchase.
                </p>
                <Button onClick={() => navigate('/fuel-management/add')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Purchase
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPurchases.slice(0, 5).map((purchase) => (
                  <div key={purchase.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Fuel className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{purchase.vehicle_number}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(purchase.purchase_date), 'MMM dd, yyyy')} • {purchase.location}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">£{purchase.total_cost.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">{purchase.quantity}L {purchase.fuel_type}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'purchases' && (
        <Card>
          <CardHeader>
            <CardTitle>Purchase History</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  {['admin', 'council'].includes(profile.role) && <TableHead>Driver</TableHead>}
                  <TableHead>Date</TableHead>
                  <TableHead>Fuel Type</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Total Cost</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPurchases.map((purchase) => (
                  <TableRow key={purchase.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{purchase.vehicle_number}</div>
                        <div className="text-sm text-muted-foreground">{purchase.license_plate}</div>
                      </div>
                    </TableCell>
                    {['admin', 'council'].includes(profile.role) && (
                      <TableCell>{purchase.driver_name}</TableCell>
                    )}
                    <TableCell>
                      <div>
                        <div className="font-medium">{format(new Date(purchase.purchase_date), 'MMM dd, yyyy')}</div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(purchase.created_at), 'HH:mm')}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getFuelTypeBadge(purchase.fuel_type)}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{purchase.quantity}L</div>
                        <div className="text-sm text-muted-foreground">£{purchase.unit_price}/L</div>
                      </div>
                    </TableCell>
                    <TableCell>£{purchase.total_cost.toFixed(2)}</TableCell>
                    <TableCell>{purchase.location}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setViewingPurchase(purchase)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(purchase)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(purchase.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Fuel Type Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {Object.entries(statistics.byFuelType).map(([type, data]) => (
                <div key={type} className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-2">
                    {getFuelTypeBadge(type)}
                    <span className="font-medium">{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{data.quantity.toFixed(1)}L</div>
                    <div className="text-sm text-muted-foreground">£{data.cost.toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Trends</CardTitle>
            </CardHeader>
            <CardContent>
              {Object.entries(statistics.monthlyData).slice(0, 6).map(([month, data]) => (
                <div key={month} className="flex items-center justify-between py-2">
                  <span className="font-medium">{format(new Date(month + '-01'), 'MMM yyyy')}</span>
                  <div className="text-right">
                    <div className="font-medium">{data.quantity.toFixed(1)}L</div>
                    <div className="text-sm text-muted-foreground">£{data.cost.toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add/Edit dialog removed; use AddFuel page */}

        {/* View Purchase Dialog */}
        <Dialog open={!!viewingPurchase} onOpenChange={() => setViewingPurchase(null)}>
          <DialogContent aria-describedby="fuel-view-desc">
            <DialogHeader>
              <DialogTitle>Fuel Purchase Details</DialogTitle>
              <p id="fuel-view-desc" className="sr-only">Detailed information about the selected fuel purchase.</p>
            </DialogHeader>
            {viewingPurchase && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Vehicle</Label>
                    <p>{viewingPurchase.vehicle_number} - {viewingPurchase.license_plate}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Fuel Type</Label>
                    <p>{getFuelTypeBadge(viewingPurchase.fuel_type)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Quantity</Label>
                    <p>{viewingPurchase.quantity}L</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Unit Price</Label>
                    <p>£{viewingPurchase.unit_price}/L</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Total Cost</Label>
                    <p>£{viewingPurchase.total_cost.toFixed(2)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Purchase Date</Label>
                    <p>{format(new Date(viewingPurchase.purchase_date), 'MMM dd, yyyy')}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Location</Label>
                    <p>{viewingPurchase.location || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Odometer</Label>
                    <p>{viewingPurchase.odometer_reading || 'N/A'}</p>
                  </div>
                </div>
                {viewingPurchase.notes && (
                  <div>
                    <Label className="text-sm font-medium">Notes</Label>
                    <p className="text-sm text-muted-foreground">{viewingPurchase.notes}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
    </StandardPageLayout>
  );
};

export default FuelManagement;