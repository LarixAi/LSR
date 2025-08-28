
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Truck, 
  Users, 
  Route, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  MapPin,
  Bell,
  Calendar,
  BarChart3
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const DashboardPreview = () => {
  const [activeTab, setActiveTab] = useState('admin');

  // Fetch real data from database
  const { data: dashboardData } = useQuery({
    queryKey: ['dashboard-preview-data'],
    queryFn: async () => {
      try {
        const { data: vehicles } = await supabase.from('vehicles').select('id, status');
        const { data: drivers } = await supabase.from('profiles').select('id').eq('role', 'driver').eq('is_active', true);
        
        return {
          metrics: [
            { title: 'Active Vehicles', value: (vehicles?.length || 0).toString(), change: '0%', icon: Truck, color: 'text-brand' },
            { title: 'Active Drivers', value: (drivers?.length || 0).toString(), change: '0%', icon: Users, color: 'text-brand' },
            { title: 'Daily Routes', value: '0', change: '0%', icon: Route, color: 'text-brand' },
            { title: 'Connected to DB', value: '✓', change: '0%', icon: Clock, color: 'text-brand' }
          ],
          activity: [{ type: 'info', message: 'Dashboard showing live data from database', time: 'Now' }],
          jobs: [],
          updates: []
        };
      } catch (error) {
        return {
          metrics: [
            { title: 'Active Vehicles', value: '0', change: '0%', icon: Truck, color: 'text-brand' },
            { title: 'Active Drivers', value: '0', change: '0%', icon: Users, color: 'text-brand' },
            { title: 'Daily Routes', value: '0', change: '0%', icon: Route, color: 'text-brand' },
            { title: 'Database Error', value: '!', change: '0%', icon: Clock, color: 'text-brand' }
          ],
          activity: [{ type: 'info', message: 'Error loading data', time: 'Now' }],
          jobs: [],
          updates: []
        };
      }
    }
  });

  const adminMetrics = dashboardData?.metrics || [];
  const recentActivity = dashboardData?.activity || [];
  const driverJobs = dashboardData?.jobs || [];
  const parentUpdates = dashboardData?.updates || [];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Experience the Platform
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            See how different roles interact with the Logistics Solution Resources platform
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="admin" className="flex items-center space-x-2">
              <Activity className="w-4 h-4" />
              <span>Admin View</span>
            </TabsTrigger>
            <TabsTrigger value="driver" className="flex items-center space-x-2">
              <Truck className="w-4 h-4" />
              <span>Driver View</span>
            </TabsTrigger>
            <TabsTrigger value="parent" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Parent View</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="admin" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {adminMetrics.map((metric, index) => {
                const Icon = metric.icon;
                return (
                  <Card key={index} className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <Icon className={`w-8 h-8 ${metric.color}`} />
                      <Badge variant="secondary" className="text-xs">
                        {metric.change}
                      </Badge>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {metric.value}
                    </div>
                    <div className="text-sm text-gray-600">
                      {metric.title}
                    </div>
                  </Card>
                );
              })}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-primary" />
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        activity.type === 'success' ? 'bg-success' :
                        activity.type === 'warning' ? 'bg-warning' : 'bg-info'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{activity.message}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-primary" />
                  Fleet Overview
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Vehicles Active</span>
                    <span className="font-semibold text-success">89/127</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Routes In Progress</span>
                    <span className="font-semibold text-info">23/45</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Maintenance Due</span>
                    <span className="font-semibold text-warning">5</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Alerts</span>
                    <span className="font-semibold text-destructive">2</span>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="driver" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-primary" />
                Today's Schedule
              </h3>
              <div className="space-y-4">
                {driverJobs.map((job, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">{job.route}</h4>
                        <p className="text-sm text-gray-600">Job ID: {job.id}</p>
                      </div>
                      <Badge variant={
                        job.status === 'Active' ? 'default' :
                        job.status === 'Completed' ? 'secondary' : 'outline'
                      }>
                        {job.status}
                      </Badge>
                    </div>
                    <div className="mb-3">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{job.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${job.progress}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-1" />
                      Next: {job.nextStop}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Bell className="w-5 h-5 mr-2 text-primary" />
                  Notifications
                </h3>
                <div className="space-y-3">
                  <div className="p-3 bg-info/10 rounded-lg border-l-4 border-info">
                    <p className="text-sm font-medium text-info">Route Update</p>
                    <p className="text-xs text-info/90">Traffic delay detected on Main St</p>
                  </div>
                  <div className="p-3 bg-success/10 rounded-lg border-l-4 border-success">
                    <p className="text-sm font-medium text-success">Schedule Confirmed</p>
                    <p className="text-xs text-success/90">Afternoon route approved</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark Route Complete
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Report Issue
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Clock className="w-4 h-4 mr-2" />
                    Log Break Time
                  </Button>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="parent" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2 text-primary" />
                My Children
              </h3>
              <div className="space-y-4">
                {parentUpdates.map((update, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-900">{update.student}</h4>
                      <Badge variant={
                        update.status === 'At School' ? 'secondary' :
                        update.status === 'On Route' ? 'default' : 'outline'
                      }>
                        {update.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span>{update.route}</span>
                      <span className="font-medium">ETA: {update.eta}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-primary" />
                  Live Tracking
                </h3>
                <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <MapPin className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">Live map view would appear here</p>
                    <p className="text-xs">Real-time vehicle locations</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Bell className="w-5 h-5 mr-2 text-primary" />
                  Recent Alerts
                </h3>
                <div className="space-y-3">
                  <div className="p-3 bg-success/10 rounded-lg border-l-4 border-success">
                    <p className="text-sm font-medium text-success">Pickup Confirmed</p>
                    <p className="text-xs text-success/90">Emma picked up at 7:45 AM</p>
                  </div>
                  <div className="p-3 bg-info/10 rounded-lg border-l-4 border-info">
                    <p className="text-sm font-medium text-info">Route Update</p>
                    <p className="text-xs text-info/90">Slight delay due to traffic</p>
                  </div>
                  <div className="p-3 bg-warning/10 rounded-lg border-l-4 border-warning">
                    <p className="text-sm font-medium text-warning">Schedule Change</p>
                    <p className="text-xs text-warning/90">Tomorrow's pickup time changed</p>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default DashboardPreview;
