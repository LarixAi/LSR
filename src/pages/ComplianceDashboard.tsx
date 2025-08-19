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
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Users,
  FileText,
  TrendingUp,
  Activity,
  Search,
  Filter,
  Eye,
  Download,
  Calendar,
  Truck,
  BarChart3,
  RotateCcw
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useComplianceStats, useUpcomingDeadlines } from '@/hooks/useComplianceData';

interface ComplianceMetric {
  id: string;
  title: string;
  value: number;
  total: number;
  percentage: number;
  status: 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
}

interface ComplianceAlert {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  driverId?: string;
  driverName?: string;
  vehicleId?: string;
  vehicleNumber?: string;
  createdAt: string;
  status: 'open' | 'investigating' | 'resolved';
}

const ComplianceDashboard: React.FC = () => {
  const { user, profile, loading } = useAuth();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('7d');
  
  // Get real compliance data from backend
  const { data: complianceStats, isLoading: statsLoading } = useComplianceStats();
  const { data: upcomingDeadlines = [], isLoading: deadlinesLoading } = useUpcomingDeadlines();

  if (loading || statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-lg">Loading compliance dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/auth" replace />;
  }

  // Only admins and council can access
  if (!['admin', 'council'].includes(profile.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Real compliance metrics from backend data
  const complianceMetrics: ComplianceMetric[] = [
    {
      id: 'driver-compliance',
      title: 'Driver Compliance',
      value: complianceStats?.driversCompliant || 0,
      total: complianceStats?.totalDrivers || 0,
      percentage: complianceStats?.totalDrivers > 0 ? Math.round((complianceStats.driversCompliant / complianceStats.totalDrivers) * 100) : 100,
      status: ((complianceStats?.totalDrivers > 0 ? (complianceStats.driversCompliant / complianceStats.totalDrivers) * 100 : 100) >= 90) ? 'good' : 
              ((complianceStats?.totalDrivers > 0 ? (complianceStats.driversCompliant / complianceStats.totalDrivers) * 100 : 100) >= 70) ? 'warning' : 'critical',
      trend: 'stable'
    },
    {
      id: 'vehicle-compliance',
      title: 'Vehicle Compliance',
      value: complianceStats?.vehiclesCompliant || 0,
      total: complianceStats?.totalVehicles || 0,
      percentage: complianceStats?.totalVehicles > 0 ? Math.round((complianceStats.vehiclesCompliant / complianceStats.totalVehicles) * 100) : 100,
      status: ((complianceStats?.totalVehicles > 0 ? (complianceStats.vehiclesCompliant / complianceStats.totalVehicles) * 100 : 100) >= 90) ? 'good' : 
              ((complianceStats?.totalVehicles > 0 ? (complianceStats.vehiclesCompliant / complianceStats.totalVehicles) * 100 : 100) >= 70) ? 'warning' : 'critical',
      trend: 'stable'
    },
    {
      id: 'violations',
      title: 'Active Violations',
      value: complianceStats?.activeViolations || 0,
      total: (complianceStats?.totalDrivers || 0) + (complianceStats?.totalVehicles || 0),
      percentage: (complianceStats?.totalDrivers || 0) + (complianceStats?.totalVehicles || 0) > 0 ? 
                  Math.max(0, 100 - Math.round(((complianceStats?.activeViolations || 0) / ((complianceStats?.totalDrivers || 0) + (complianceStats?.totalVehicles || 0))) * 100)) : 100,
      status: (complianceStats?.activeViolations || 0) === 0 ? 'good' : 
              (complianceStats?.activeViolations || 0) <= 2 ? 'warning' : 'critical',
      trend: 'stable'
    },
    {
      id: 'overall-score',
      title: 'Overall Score',
      value: complianceStats?.overallScore || 0,
      total: 100,
      percentage: complianceStats?.overallScore || 0,
      status: (complianceStats?.overallScore || 0) >= 90 ? 'good' : 
              (complianceStats?.overallScore || 0) >= 70 ? 'warning' : 'critical',
      trend: 'stable'
    }
  ];

  // Real compliance alerts from upcoming deadlines
  const complianceAlerts: ComplianceAlert[] = upcomingDeadlines.map((deadline, index) => ({
    id: `alert-${index + 1}`,
    type: deadline.type,
    severity: deadline.severity as 'low' | 'medium' | 'high' | 'critical',
    title: `${deadline.type} - ${deadline.entity}`,
    description: `${deadline.type} expires in ${deadline.days} day${deadline.days !== 1 ? 's' : ''}`,
    createdAt: new Date().toISOString(),
    status: 'open' as 'open' | 'investigating' | 'resolved'
  }));

  const getStatusColor = (status: string) => {
    switch (status) {
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
      open: 'bg-red-100 text-red-800',
      investigating: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800'
    };
    
    return (
      <Badge className={statusConfig[status as keyof typeof statusConfig] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    );
  };

  const getSeverityBadge = (severity: string) => {
    const severityConfig = {
      critical: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-blue-100 text-blue-800'
    };
    
    return (
      <Badge className={severityConfig[severity as keyof typeof severityConfig] || 'bg-gray-100 text-gray-800'}>
        {severity}
      </Badge>
    );
  };

  const filteredAlerts = complianceAlerts.filter(alert => {
    const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.driverName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.vehicleNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  const overallComplianceScore = Math.round(
    complianceMetrics.reduce((sum, metric) => sum + metric.percentage, 0) / complianceMetrics.length
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-600" />
            Compliance Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Real-time compliance monitoring and management</p>
        </div>
        <div className="flex gap-3">
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Overall Score */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold">Overall Compliance Score</h2>
              <p className="text-gray-600">Across all categories and requirements</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">{overallComplianceScore}%</div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <TrendingUp className="w-4 h-4" />
                <span>+2.3% from last month</span>
              </div>
            </div>
          </div>
          <Progress value={overallComplianceScore} className="h-3" />
        </CardContent>
      </Card>

      {/* Compliance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {complianceMetrics.map((metric) => (
          <Card key={metric.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{metric.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-gray-600">
                      {metric.value} / {metric.total}
                    </span>
                    <span className={`text-sm font-medium ${getStatusColor(metric.status)}`}>
                      {metric.percentage}%
                    </span>
                  </div>
                </div>
                <div className={`p-2 rounded-lg ${
                  metric.status === 'good' ? 'bg-green-100' :
                  metric.status === 'warning' ? 'bg-yellow-100' :
                  'bg-red-100'
                }`}>
                  {metric.status === 'good' ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : metric.status === 'warning' ? (
                    <AlertTriangle className="w-6 h-6 text-yellow-600" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  )}
                </div>
              </div>
              <Progress value={metric.percentage} className="h-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="alerts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="alerts">Active Alerts</TabsTrigger>
          <TabsTrigger value="drivers">Driver Compliance</TabsTrigger>
          <TabsTrigger value="vehicles">Vehicle Compliance</TabsTrigger>
          <TabsTrigger value="reports">Compliance Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Compliance Alerts
              </CardTitle>
              <div className="flex gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search alerts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severity</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredAlerts.map((alert) => (
                  <div key={alert.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{alert.title}</h3>
                          {getSeverityBadge(alert.severity)}
                          {getStatusBadge(alert.status)}
                        </div>
                        <p className="text-gray-600 mb-2">{alert.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {new Date(alert.createdAt).toLocaleDateString()}
                          </span>
                          {alert.driverName && (
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {alert.driverName}
                            </span>
                          )}
                          {alert.vehicleNumber && (
                            <span className="flex items-center gap-1">
                              <Truck className="w-4 h-4" />
                              {alert.vehicleNumber}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                          Investigate
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drivers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Driver Compliance Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Driver Compliance Tracking</h3>
                <p className="text-gray-600 mb-6">
                  Monitor individual driver compliance scores, certifications, and training status.
                </p>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  View Driver Details
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vehicles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Vehicle Compliance Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Truck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Vehicle Compliance Tracking</h3>
                <p className="text-gray-600 mb-6">
                  Monitor vehicle inspections, insurance, MOT status, and maintenance compliance.
                </p>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  View Vehicle Details
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Compliance Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Generate Compliance Reports</h3>
                <p className="text-gray-600 mb-6">
                  Create detailed compliance reports for regulatory submissions and internal reviews.
                </p>
                <div className="flex gap-4 justify-center">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Generate Report
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

export default ComplianceDashboard;
