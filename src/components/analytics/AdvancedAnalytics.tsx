import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Calendar, TrendingUp, Users, Activity, Download } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingState } from '@/components/ui/loading-state';

const AdvancedAnalytics = () => {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('7d');
  const [activeTab, setActiveTab] = useState('overview');

  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['advanced-analytics', user?.id, timeRange],
    queryFn: async () => {
      if (!user) return null;

      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case '7d': startDate.setDate(endDate.getDate() - 7); break;
        case '30d': startDate.setDate(endDate.getDate() - 30); break;
        case '90d': startDate.setDate(endDate.getDate() - 90); break;
        default: startDate.setDate(endDate.getDate() - 7);
      }

      // Simulated analytics data - replace with actual queries
      return {
        overview: {
          totalUsers: 1247,
          activeUsers: 892,
          totalSessions: 3456,
          avgSessionDuration: 12.5
        },
        userActivity: [
          { date: '2024-01-01', users: 120, sessions: 180 },
          { date: '2024-01-02', users: 135, sessions: 195 },
          { date: '2024-01-03', users: 145, sessions: 210 },
          { date: '2024-01-04', users: 160, sessions: 225 },
          { date: '2024-01-05', users: 155, sessions: 220 },
          { date: '2024-01-06', users: 170, sessions: 240 },
          { date: '2024-01-07', users: 180, sessions: 260 }
        ],
        deviceTypes: [
          { name: 'Desktop', value: 45, color: '#8884d8' },
          { name: 'Mobile', value: 35, color: '#82ca9d' },
          { name: 'Tablet', value: 20, color: '#ffc658' }
        ],
        featureUsage: [
          { feature: 'Dashboard', usage: 85 },
          { feature: 'Jobs', usage: 72 },
          { feature: 'Vehicles', usage: 68 },
          { feature: 'Routes', usage: 55 },
          { feature: 'Reports', usage: 42 }
        ],
        performanceMetrics: {
          avgLoadTime: 1.2,
          bounceRate: 23.5,
          conversionRate: 8.7,
          errorRate: 0.8
        }
      };
    },
    enabled: !!user
  });

  const exportData = () => {
    // Implement data export functionality
    console.log('Exporting analytics data...');
  };

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">Advanced Analytics</h2>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportData}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total Users"
              value={analyticsData?.overview.totalUsers}
              icon={<Users className="w-5 h-5" />}
              trend="+12%"
            />
            <MetricCard
              title="Active Users"
              value={analyticsData?.overview.activeUsers}
              icon={<Activity className="w-5 h-5" />}
              trend="+8%"
            />
            <MetricCard
              title="Total Sessions"
              value={analyticsData?.overview.totalSessions}
              icon={<Calendar className="w-5 h-5" />}
              trend="+15%"
            />
            <MetricCard
              title="Avg Session (min)"
              value={analyticsData?.overview.avgSessionDuration}
              icon={<TrendingUp className="w-5 h-5" />}
              trend="+5%"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Activity Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData?.userActivity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="users" stroke="#8884d8" strokeWidth={2} />
                    <Line type="monotone" dataKey="sessions" stroke="#82ca9d" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Device Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData?.deviceTypes}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analyticsData?.deviceTypes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Feature Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={analyticsData?.featureUsage} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="feature" type="category" />
                  <Tooltip />
                  <Bar dataKey="usage" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Add other tab contents as needed */}
      </Tabs>
    </div>
  );
};

interface MetricCardProps {
  title: string;
  value: number | undefined;
  icon: React.ReactNode;
  trend: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, trend }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value?.toLocaleString()}</div>
      <p className="text-xs text-green-600">{trend} from last period</p>
    </CardContent>
  </Card>
);

export default AdvancedAnalytics;