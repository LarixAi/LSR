import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Heart, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Activity, 
  RefreshCw, 
  Server,
  Database,
  Cpu,
  HardDrive
} from 'lucide-react';
import { useHealthMonitoring } from '@/hooks/useHealthMonitoring';
import { LoadingState } from '@/components/ui/loading-state';

const HealthCheckDashboard = () => {
  const { health, isChecking, runHealthChecks } = useHealthMonitoring();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'degraded': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning':
      case 'degraded':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'error':
      case 'down':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default:
        return <Activity className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy': return 'default';
      case 'warning': 
      case 'degraded': return 'secondary';
      case 'error':
      case 'down': return 'destructive';
      default: return 'outline';
    }
  };

  const getServiceIcon = (serviceName: string) => {
    const name = serviceName.toLowerCase();
    if (name.includes('database')) return <Database className="w-5 h-5" />;
    if (name.includes('api')) return <Server className="w-5 h-5" />;
    if (name.includes('memory')) return <Cpu className="w-5 h-5" />;
    if (name.includes('storage')) return <HardDrive className="w-5 h-5" />;
    return <Activity className="w-5 h-5" />;
  };

  const formatUptime = (uptime: number) => {
    const days = Math.floor(uptime / (1000 * 60 * 60 * 24));
    const hours = Math.floor((uptime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getOverallHealthPercentage = () => {
    if (health.checks.length === 0) return 100;
    
    const healthyChecks = health.checks.filter(check => check.status === 'healthy').length;
    return Math.round((healthyChecks / health.checks.length) * 100);
  };

  if (isChecking && health.checks.length === 0) {
    return <LoadingState text="Running health checks..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Heart className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">System Health</h2>
          <Badge 
            variant={getStatusBadge(health.overall_status) as any}
            className="ml-2"
          >
            {health.overall_status.toUpperCase()}
          </Badge>
        </div>
        <Button 
          variant="outline" 
          onClick={runHealthChecks}
          disabled={isChecking}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
          {isChecking ? 'Checking...' : 'Run Checks'}
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Health</CardTitle>
            <Heart className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">{getOverallHealthPercentage()}%</div>
              <Progress value={getOverallHealthPercentage()} className="w-full" />
              <p className="text-xs text-muted-foreground">
                {health.checks.filter(c => c.status === 'healthy').length} of {health.checks.length} services healthy
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatUptime(health.uptime)}</div>
            <p className="text-xs text-green-600">99.9% availability</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Checks</CardTitle>
            <Activity className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{health.checks.length}</div>
            <p className="text-xs text-muted-foreground">Monitoring services</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Update</CardTitle>
            <RefreshCw className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold">
              {new Date(health.last_update).toLocaleTimeString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round((Date.now() - Date.parse(health.last_update)) / 1000)}s ago
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="services" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="services">Service Status</TabsTrigger>
          <TabsTrigger value="details">Health Details</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Health Checks</CardTitle>
            </CardHeader>
            <CardContent>
              {health.checks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No health checks configured</p>
                  <p className="text-sm">Health monitoring will show service status here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {health.checks.map((check, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getServiceIcon(check.name)}
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium">{check.name}</h4>
                            {getStatusIcon(check.status)}
                          </div>
                          <div className="flex items-center space-x-4 mt-1">
                            <p className="text-sm text-muted-foreground">
                              Last checked: {new Date(check.last_checked).toLocaleTimeString()}
                            </p>
                            {check.response_time && (
                              <p className="text-sm text-muted-foreground">
                                Response: {check.response_time}ms
                              </p>
                            )}
                          </div>
                          {check.details && (
                            <div className="mt-2 text-xs text-muted-foreground">
                              {Object.entries(check.details).map(([key, value]) => (
                                <span key={key} className="mr-4">
                                  {key}: {String(value)}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <Badge variant={getStatusBadge(check.status) as any}>
                        {check.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Platform</span>
                  <Badge variant="outline">Web Application</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Environment</span>
                  <Badge variant="outline">Production</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Build Version</span>
                  <Badge variant="outline">v1.0.0</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Deployment</span>
                  <Badge variant="outline">Active</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {health.checks.map((check, index) => (
                  check.response_time && (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{check.name}</span>
                        <span>{check.response_time}ms</span>
                      </div>
                      <Progress 
                        value={Math.min((check.response_time / 1000) * 100, 100)} 
                        className="w-full" 
                      />
                    </div>
                  )
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HealthCheckDashboard;