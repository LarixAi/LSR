
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  MapPin, 
  Plus, 
  Search, 
  Route, 
  Clock, 
  Navigation,
  TrendingUp,
  BarChart3,
  Eye,
  Edit,
  Trash2,
  Car,
  Users,
  Calendar
} from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';

interface Route {
  id: string;
  name: string;
  description: string;
  start_location: string;
  end_location: string;
  estimated_duration: number;
  distance_km: number;
  status: 'active' | 'inactive' | 'maintenance';
  created_at: string;
  updated_at: string;
}

export default function RoutePlanning() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('routes');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Mock data - replace with actual API calls
  const routes: Route[] = [
    {
      id: '1',
      name: 'London to Manchester Express',
      description: 'High-speed route between London and Manchester',
      start_location: 'London, UK',
      end_location: 'Manchester, UK',
      estimated_duration: 240,
      distance_km: 320,
      status: 'active',
      created_at: '2024-08-27T10:00:00Z',
      updated_at: '2024-08-27T10:00:00Z'
    },
    {
      id: '2',
      name: 'Birmingham to Leeds',
      description: 'Regular service route through the Midlands',
      start_location: 'Birmingham, UK',
      end_location: 'Leeds, UK',
      estimated_duration: 180,
      distance_km: 240,
      status: 'active',
      created_at: '2024-08-26T15:00:00Z',
      updated_at: '2024-08-26T15:00:00Z'
    },
    {
      id: '3',
      name: 'Liverpool to Sheffield',
      description: 'Cross-country route with multiple stops',
      start_location: 'Liverpool, UK',
      end_location: 'Sheffield, UK',
      estimated_duration: 150,
      distance_km: 200,
      status: 'maintenance',
      created_at: '2024-08-25T09:00:00Z',
      updated_at: '2024-08-27T14:00:00Z'
    }
  ];

  // Calculate statistics
  const totalRoutes = routes.length;
  const activeRoutes = routes.filter(route => route.status === 'active').length;
  const totalDistance = routes.reduce((sum, route) => sum + route.distance_km, 0);
  const averageDuration = routes.reduce((sum, route) => sum + route.estimated_duration, 0) / routes.length;

  // Filter routes based on search and filters
  const filteredRoutes = routes.filter(route => {
    const matchesSearch = searchTerm === '' || 
      route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.start_location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.end_location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || route.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>;
      case 'maintenance':
        return <Badge className="bg-yellow-100 text-yellow-800">Maintenance</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <PageLayout
      title="Route Planning"
      description="Plan and manage transportation routes and optimize delivery paths"
      actionButton={{
        label: "Create Route",
        onClick: () => setShowCreateDialog(true),
        icon: <Plus className="w-4 h-4 mr-2" />
      }}
      summaryCards={[
        {
          title: "Total Routes",
          value: totalRoutes,
          icon: <Route className="h-4 w-4" />,
          color: "text-blue-600"
        },
        {
          title: "Active Routes",
          value: activeRoutes,
          icon: <Navigation className="h-4 w-4" />,
          color: "text-green-600"
        },
        {
          title: "Total Distance",
          value: `${totalDistance.toFixed(0)}km`,
          icon: <MapPin className="h-4 w-4" />,
          color: "text-purple-600"
        },
        {
          title: "Avg Duration",
          value: `${averageDuration.toFixed(0)}min`,
          icon: <Clock className="h-4 w-4" />,
          color: "text-orange-600"
        }
      ]}
      searchPlaceholder="Search routes..."
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      filters={[
        {
          label: "All Statuses",
          value: statusFilter,
          options: [
            { value: "all", label: "All Statuses" },
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
            { value: "maintenance", label: "Maintenance" }
          ],
          onChange: setStatusFilter
        }
      ]}
      tabs={[
        { value: "routes", label: "Routes" },
        { value: "optimization", label: "Optimization" },
        { value: "analytics", label: "Analytics" }
      ]}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      isLoading={false}
    >
      {/* Content based on active tab */}
      {activeTab === 'routes' && (
        <Card>
          <CardHeader>
            <CardTitle>Route Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Route Name</TableHead>
                  <TableHead>Start Location</TableHead>
                  <TableHead>End Location</TableHead>
                  <TableHead>Distance</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRoutes.map((route) => (
                  <TableRow key={route.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{route.name}</p>
                        <p className="text-sm text-gray-500">{route.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {route.start_location}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {route.end_location}
                      </div>
                    </TableCell>
                    <TableCell>{route.distance_km}km</TableCell>
                    <TableCell>{route.estimated_duration}min</TableCell>
                    <TableCell>{getStatusBadge(route.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
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

      {activeTab === 'optimization' && (
        <Card>
          <CardHeader>
            <CardTitle>Route Optimization</CardTitle>
            <CardDescription>Optimize routes for efficiency and cost savings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Route optimization features coming soon</p>
              <p className="text-sm text-gray-500 mt-2">
                Advanced algorithms to optimize delivery routes and reduce costs
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'analytics' && (
        <Card>
          <CardHeader>
            <CardTitle>Route Analytics</CardTitle>
            <CardDescription>Performance metrics and route analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Route analytics features coming soon</p>
              <p className="text-sm text-gray-500 mt-2">
                Detailed analytics and performance metrics for route optimization
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </PageLayout>
  );
}
