import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  PieChart,
  Calendar,
  Download,
  Filter,
  Users,
  Truck,
  DollarSign,
  Clock,
  Fuel,
  MapPin,
  Activity,
  Target,
  AlertTriangle,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Minus,
  RotateCcw
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAnalyticsData } from '@/hooks/useAnalytics';
import { supabase } from '@/integrations/supabase/client';

interface MetricCard {
  id: string;
  title: string;
  value: string;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: any;
  color: string;
  description: string;
}

interface ChartData {
  name: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
}

const AnalyticsPage: React.FC = () => {
  const { user, profile, loading } = useAuth();
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('30d');
  const [selectedMetric, setSelectedMetric] = useState<string>('revenue');
  
  // Get real analytics data from backend
  const { metrics, revenueData, serviceData, performanceMetrics, rawData, isLoading: analyticsLoading } = useAnalyticsData();

  const handleClearAnalyticsData = () => {
    const confirmed = confirm(
      'Are you sure you want to clear all analytics data?\n\nThis will permanently delete:\n- All vehicle records\n- All job records\n- All route records\n- All driver profiles\n\nThis action cannot be undone.'
    );
    
    if (confirmed) {
      // Clear all the data from the database
      clearAllAnalyticsData();
    }
  };

  const clearAllAnalyticsData = async () => {
    try {
      // Clear vehicles
      if (rawData.vehicles.length > 0) {
        for (const vehicle of rawData.vehicles) {
          await supabase.from('vehicles').delete().eq('id', vehicle.id);
        }
      }
      
      // Clear jobs
      if (rawData.jobs.length > 0) {
        for (const job of rawData.jobs) {
          await supabase.from('jobs').delete().eq('id', job.id);
        }
      }
      
      // Clear routes
      if (rawData.routes.length > 0) {
        for (const route of rawData.routes) {
          await supabase.from('routes').delete().eq('id', route.id);
        }
      }
      
      toast({
        title: "Analytics Data Cleared",
        description: "All analytics data has been cleared from the database.",
      });
      
      // Reload to show empty state
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Error clearing analytics data:', error);
      toast({
        title: "Error",
        description: "Failed to clear analytics data.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-lg">Loading analytics dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/auth" replace />;
  }

  if (loading || analyticsLoading || !performanceMetrics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-lg">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  // Real metrics from backend data
  const keyMetrics: MetricCard[] = [
    {
      id: 'revenue',
      title: 'Total Revenue',
      value: metrics.revenue.value,
      change: metrics.revenue.change,
      changeType: metrics.revenue.changeType as 'increase' | 'decrease' | 'neutral',
      icon: DollarSign,
      color: 'text-green-600',
      description: 'Estimated revenue from completed jobs'
    },
    {
      id: 'trips',
      title: 'Total Trips',
      value: metrics.trips.value,
      change: metrics.trips.change,
      changeType: metrics.trips.changeType as 'increase' | 'decrease' | 'neutral',
      icon: MapPin,
      color: 'text-blue-600',
      description: 'Jobs completed this period'
    },
    {
      id: 'efficiency',
      title: 'Fleet Efficiency',
      value: metrics.efficiency.value,
      change: metrics.efficiency.change,
      changeType: metrics.efficiency.changeType as 'increase' | 'decrease' | 'neutral',
      icon: Target,
      color: 'text-orange-600',
      description: 'Active vehicles / total vehicles'
    },
    {
      id: 'fuel',
      title: 'Fuel Costs',
      value: metrics.fuel.value,
      change: metrics.fuel.change,
      changeType: metrics.fuel.changeType as 'increase' | 'decrease' | 'neutral',
      icon: Fuel,
      color: 'text-purple-600',
      description: 'Estimated monthly fuel expenditure'
    },
    {
      id: 'maintenance',
      title: 'Maintenance Costs',
      value: metrics.maintenance.value,
      change: metrics.maintenance.change,
      changeType: metrics.maintenance.changeType as 'increase' | 'decrease' | 'neutral',
      icon: Activity,
      color: 'text-red-600',
      description: 'Vehicle maintenance expenses'
    },
    {
      id: 'compliance',
      title: 'Compliance Score',
      value: metrics.compliance.value,
      change: metrics.compliance.change,
      changeType: metrics.compliance.changeType as 'increase' | 'decrease' | 'neutral',
      icon: CheckCircle,
      color: 'text-emerald-600',
      description: 'Driver and vehicle compliance rating'
    }
  ];

  // Use serviceData from the analytics hook

  // Helper function to determine status based on value
  const getMetricStatus = (value: string, metricType: string) => {
    const numValue = parseFloat(value.replace(/[%/]/g, ''));
    
    switch (metricType) {
      case 'rating':
        return numValue >= 4.5 ? 'excellent' : numValue >= 4.0 ? 'good' : 'warning';
      case 'percentage':
        return numValue >= 95 ? 'excellent' : numValue >= 85 ? 'good' : 'warning';
      case 'downtime':
        return numValue <= 5 ? 'excellent' : numValue <= 15 ? 'good' : 'warning';
      default:
        return 'good';
    }
  };

  const realPerformanceMetrics = [
    {
      category: 'Driver Performance',
      metrics: [
        { name: 'Average Rating', value: performanceMetrics.driverPerformance.averageRating, status: getMetricStatus(performanceMetrics.driverPerformance.averageRating, 'rating') },
        { name: 'Punctuality', value: performanceMetrics.driverPerformance.punctuality, status: getMetricStatus(performanceMetrics.driverPerformance.punctuality, 'percentage') },
        { name: 'Safety Score', value: performanceMetrics.driverPerformance.safetyScore, status: getMetricStatus(performanceMetrics.driverPerformance.safetyScore, 'percentage') },
        { name: 'Fuel Efficiency', value: performanceMetrics.driverPerformance.fuelEfficiency, status: getMetricStatus(performanceMetrics.driverPerformance.fuelEfficiency, 'percentage') }
      ]
    },
    {
      category: 'Vehicle Utilization',
      metrics: [
        { name: 'Average Utilization', value: performanceMetrics.vehicleUtilization.averageUtilization, status: getMetricStatus(performanceMetrics.vehicleUtilization.averageUtilization, 'percentage') },
        { name: 'Downtime', value: performanceMetrics.vehicleUtilization.downtime, status: getMetricStatus(performanceMetrics.vehicleUtilization.downtime, 'downtime') },
        { name: 'Maintenance Schedule', value: performanceMetrics.vehicleUtilization.maintenanceSchedule, status: getMetricStatus(performanceMetrics.vehicleUtilization.maintenanceSchedule, 'percentage') },
        { name: 'Availability', value: performanceMetrics.vehicleUtilization.availability, status: getMetricStatus(performanceMetrics.vehicleUtilization.availability, 'percentage') }
      ]
    },
    {
      category: 'Customer Satisfaction',
      metrics: [
        { name: 'Overall Rating', value: performanceMetrics.customerSatisfaction.overallRating, status: getMetricStatus(performanceMetrics.customerSatisfaction.overallRating, 'rating') },
        { name: 'On-Time Performance', value: performanceMetrics.customerSatisfaction.onTimePerformance, status: getMetricStatus(performanceMetrics.customerSatisfaction.onTimePerformance, 'percentage') },
        { name: 'Complaint Resolution', value: performanceMetrics.customerSatisfaction.complaintResolution, status: getMetricStatus(performanceMetrics.customerSatisfaction.complaintResolution, 'percentage') },
        { name: 'Repeat Customers', value: performanceMetrics.customerSatisfaction.repeatCustomers, status: getMetricStatus(performanceMetrics.customerSatisfaction.repeatCustomers, 'percentage') }
      ]
    }
  ];

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case 'increase':
        return <ArrowUp className="w-4 h-4 text-green-600" />;
      case 'decrease':
        return <ArrowDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getChangeColor = (changeType: string) => {
    switch (changeType) {
      case 'increase':
        return 'text-green-600';
      case 'decrease':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'text-emerald-600';
      case 'good':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      excellent: 'bg-emerald-100 text-emerald-800',
      good: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      critical: 'bg-red-100 text-red-800'
    };
    
    return (
      <Badge className={statusConfig[status as keyof typeof statusConfig] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Comprehensive business intelligence and performance metrics</p>
        </div>
        <div className="flex gap-3">
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            onClick={handleClearAnalyticsData} 
            variant="destructive" 
            className="inline-flex items-center"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Clear All Data
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {keyMetrics.map((metric) => (
          <Card key={metric.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg bg-gray-100`}>
                  <metric.icon className={`w-6 h-6 ${metric.color}`} />
                </div>
                <div className="flex items-center gap-2">
                  {getChangeIcon(metric.changeType)}
                  <span className={`text-sm font-medium ${getChangeColor(metric.changeType)}`}>
                    {Math.abs(metric.change)}%
                  </span>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{metric.title}</h3>
                <p className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</p>
                <p className="text-sm text-gray-600">{metric.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="operational">Operational</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Revenue Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {revenueData.map((data, index) => (
                    <div key={data.name} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{data.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm">£{data.value.toLocaleString()}</span>
                        {data.trend === 'up' ? (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        ) : data.trend === 'down' ? (
                          <TrendingDown className="w-4 h-4 text-red-600" />
                        ) : (
                          <Minus className="w-4 h-4 text-gray-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Service Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Service Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {serviceData.map((service) => (
                    <div key={service.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{service.name}</span>
                        <span className="text-sm">{service.value}%</span>
                      </div>
                      <Progress value={service.value} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <Users className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold mb-2">Active Drivers</h3>
                <p className="text-2xl font-bold text-blue-600">{performanceMetrics.quickStats.activeDrivers}</p>
                <p className="text-sm text-gray-600">Currently available</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Truck className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold mb-2">Fleet Vehicles</h3>
                <p className="text-2xl font-bold text-green-600">{performanceMetrics.quickStats.fleetVehicles}</p>
                <p className="text-sm text-gray-600">Operational vehicles</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Clock className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold mb-2">On-Time Rate</h3>
                <p className="text-2xl font-bold text-purple-600">{performanceMetrics.quickStats.onTimeRate}</p>
                <p className="text-sm text-gray-600">This month</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Target className="w-8 h-8 text-orange-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold mb-2">Target Achievement</h3>
                <p className="text-2xl font-bold text-orange-600">{performanceMetrics.quickStats.targetAchievement}</p>
                <p className="text-sm text-gray-600">Monthly target</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Financial Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Financial Performance Analysis</h3>
                <p className="text-gray-600 mb-6">
                  Detailed revenue analysis, cost breakdown, and profitability metrics.
                </p>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  View Financial Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operational" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Operational Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Operational Performance</h3>
                <p className="text-gray-600 mb-6">
                  Fleet utilization, route optimization, and operational efficiency metrics.
                </p>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  View Operational Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {realPerformanceMetrics.map((category) => (
              <Card key={category.category}>
                <CardHeader>
                  <CardTitle>{category.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {category.metrics.map((metric) => (
                      <div key={metric.name} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{metric.name}</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${getStatusColor(metric.status)}`}>
                            {metric.value}
                          </span>
                          {getStatusBadge(metric.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
      <Card>
        <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Custom Reports
              </CardTitle>
        </CardHeader>
        <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Generate Custom Reports</h3>
                <p className="text-gray-600 mb-6">
                  Create detailed analytical reports with custom date ranges and metrics.
                </p>
                <div className="flex gap-4 justify-center">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Create Report
                  </Button>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export Data
                  </Button>
                </div>
              </div>
        </CardContent>
      </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsPage;