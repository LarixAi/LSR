import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, ResponsiveContainer } from 'recharts';
import { Activity, TrendingUp, Zap, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAPIOptimization } from '@/hooks/useAPIOptimization';
import { LoadingState } from '@/components/ui/loading-state';

const APIMonitoringDashboard = () => {
  const { getCacheStats, clearCache } = useAPIOptimization();
  const [timeRange, setTimeRange] = useState('1h');

  // Mock API performance data
  const performanceData = [
    { time: '00:00', response_time: 120, requests: 45, errors: 0 },
    { time: '00:15', response_time: 135, requests: 52, errors: 1 },
    { time: '00:30', response_time: 98, requests: 38, errors: 0 },
    { time: '00:45', response_time: 156, requests: 67, errors: 2 },
    { time: '01:00', response_time: 89, requests: 41, errors: 0 },
    { time: '01:15', response_time: 203, requests: 89, errors: 5 },
    { time: '01:30', response_time: 167, requests: 73, errors: 1 },
    { time: '01:45', response_time: 142, requests: 56, errors: 0 }
  ];

  const endpointStats = [
    { endpoint: '/api/jobs', requests: 1247, avg_response: 145, success_rate: 99.2 },
    { endpoint: '/api/drivers', requests: 892, avg_response: 89, success_rate: 100 },
    { endpoint: '/api/vehicles', requests: 654, avg_response: 167, success_rate: 98.8 },
    { endpoint: '/api/routes', requests: 432, avg_response: 234, success_rate: 97.5 },
    { endpoint: '/api/notifications', requests: 1567, avg_response: 67, success_rate: 99.8 }
  ];

  const cacheStats = getCacheStats();

  const getStatusColor = (rate: number) => {
    if (rate >= 99) return 'text-green-600';
    if (rate >= 95) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusIcon = (rate: number) => {
    if (rate >= 99) return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (rate >= 95) return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
    return <AlertTriangle className="w-4 h-4 text-red-600" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Activity className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">API Monitoring</h2>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="6h">Last 6 Hours</SelectItem>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={clearCache}>
            Clear Cache
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142ms</div>
            <p className="text-xs text-green-600">↓ 15ms from last hour</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Requests/Min</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">58</div>
            <p className="text-xs text-green-600">↑ 12% from last hour</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98.9%</div>
            <p className="text-xs text-green-600">↑ 0.2% from last hour</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
            <Zap className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cacheStats.totalEntries > 0 
                ? Math.round((cacheStats.validEntries / cacheStats.totalEntries) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {cacheStats.validEntries} valid / {cacheStats.totalEntries} total
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="cache">Cache Stats</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Response Time & Request Volume</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="right" dataKey="requests" fill="#8884d8" name="Requests" />
                  <Line 
                    yAxisId="left" 
                    type="monotone" 
                    dataKey="response_time" 
                    stroke="#82ca9d" 
                    strokeWidth={2} 
                    name="Response Time (ms)"
                  />
                  <Line 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="errors" 
                    stroke="#ff6b6b" 
                    strokeWidth={2} 
                    name="Errors"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="endpoints" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Endpoint Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {endpointStats.map((endpoint) => (
                  <div key={endpoint.endpoint} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{endpoint.endpoint}</div>
                      <div className="text-sm text-muted-foreground">
                        {endpoint.requests.toLocaleString()} requests • {endpoint.avg_response}ms avg
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(endpoint.success_rate)}
                      <Badge 
                        variant={endpoint.success_rate >= 99 ? 'default' : endpoint.success_rate >= 95 ? 'secondary' : 'destructive'}
                      >
                        {endpoint.success_rate}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cache" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Cache Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Entries</span>
                  <Badge variant="secondary">{cacheStats.totalEntries}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Valid Entries</span>
                  <Badge variant="default">{cacheStats.validEntries}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Expired Entries</span>
                  <Badge variant="destructive">{cacheStats.expiredEntries}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Cache Size</span>
                  <Badge variant="outline">{(cacheStats.cacheSize / 1024).toFixed(1)} KB</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cache Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={[
                    { name: 'Valid', value: cacheStats.validEntries, fill: '#22c55e' },
                    { name: 'Expired', value: cacheStats.expiredEntries, fill: '#ef4444' }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default APIMonitoringDashboard;