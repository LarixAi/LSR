import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { 
  Network, 
  Plus, 
  Copy,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Key,
  Shield,
  Activity,
  Clock,
  AlertTriangle,
  CheckCircle,
  Code,
  Settings,
  BarChart3,
  RefreshCw
} from 'lucide-react';

interface APIKey {
  id: string;
  name: string;
  key: string;
  status: 'active' | 'inactive' | 'expired';
  permissions: string[];
  lastUsed: string;
  createdAt: string;
  expiresAt?: string;
  usageCount: number;
  rateLimit: number;
}

interface APIEndpoint {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  status: 'active' | 'maintenance' | 'deprecated';
  responseTime: number;
  successRate: number;
  lastHour: number;
}

const APIManagement: React.FC = () => {
  const { user, profile, loading } = useAuth();
  const [selectedTab, setSelectedTab] = useState<string>('keys');
  const [isCreateKeyDialogOpen, setIsCreateKeyDialogOpen] = useState<boolean>(false);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-lg">Loading API management...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/auth" replace />;
  }

  // Only admins can access
  if (profile.role !== 'admin') {
    return <Navigate to="/unauthorized" replace />;
  }

  // Mock data for demonstration
  const apiKeys: APIKey[] = [
    {
      id: 'key-001',
      name: 'Mobile App Integration',
      key: 'lsr_live_1234567890abcdef1234567890abcdef',
      status: 'active',
      permissions: ['read:vehicles', 'read:drivers', 'write:tracking'],
      lastUsed: '2024-01-16T14:30:00Z',
      createdAt: '2024-01-01T10:00:00Z',
      expiresAt: '2024-12-31T23:59:59Z',
      usageCount: 15420,
      rateLimit: 1000
    },
    {
      id: 'key-002',
      name: 'Third-party GPS Provider',
      key: 'lsr_live_abcdef1234567890abcdef1234567890',
      status: 'active',
      permissions: ['read:tracking', 'write:locations'],
      lastUsed: '2024-01-16T15:45:00Z',
      createdAt: '2024-01-15T09:30:00Z',
      usageCount: 8943,
      rateLimit: 500
    },
    {
      id: 'key-003',
      name: 'Analytics Dashboard',
      key: 'lsr_test_fedcba0987654321fedcba0987654321',
      status: 'inactive',
      permissions: ['read:analytics', 'read:reports'],
      lastUsed: '2024-01-10T11:20:00Z',
      createdAt: '2024-01-10T11:00:00Z',
      usageCount: 245,
      rateLimit: 100
    }
  ];

  const apiEndpoints: APIEndpoint[] = [
    {
      id: 'endpoint-001',
      name: 'Get Vehicles',
      method: 'GET',
      path: '/api/v1/vehicles',
      description: 'Retrieve list of all vehicles',
      status: 'active',
      responseTime: 45,
      successRate: 99.8,
      lastHour: 142
    },
    {
      id: 'endpoint-002',
      name: 'Update Vehicle Location',
      method: 'POST',
      path: '/api/v1/vehicles/{id}/location',
      description: 'Update real-time vehicle location',
      status: 'active',
      responseTime: 23,
      successRate: 99.9,
      lastHour: 1847
    },
    {
      id: 'endpoint-003',
      name: 'Get Driver Status',
      method: 'GET',
      path: '/api/v1/drivers/{id}/status',
      description: 'Get current driver availability status',
      status: 'active',
      responseTime: 38,
      successRate: 98.7,
      lastHour: 543
    },
    {
      id: 'endpoint-004',
      name: 'Create Route',
      method: 'POST',
      path: '/api/v1/routes',
      description: 'Create a new transportation route',
      status: 'maintenance',
      responseTime: 156,
      successRate: 95.2,
      lastHour: 23
    }
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      expired: 'bg-red-100 text-red-800',
      maintenance: 'bg-yellow-100 text-yellow-800',
      deprecated: 'bg-orange-100 text-orange-800'
    };
    
    return (
      <Badge className={statusConfig[status as keyof typeof statusConfig] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    );
  };

  const getMethodBadge = (method: string) => {
    const methodConfig = {
      GET: 'bg-blue-100 text-blue-800',
      POST: 'bg-green-100 text-green-800',
      PUT: 'bg-orange-100 text-orange-800',
      DELETE: 'bg-red-100 text-red-800'
    };
    
    return (
      <Badge className={methodConfig[method as keyof typeof methodConfig] || 'bg-gray-100 text-gray-800'}>
        {method}
      </Badge>
    );
  };

  const toggleKeyVisibility = (keyId: string) => {
    setShowKeys(prev => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  const maskApiKey = (key: string) => {
    return key.substring(0, 12) + '•••••••••••••••••••••••••••••••••';
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const apiStats = {
    totalKeys: apiKeys.length,
    activeKeys: apiKeys.filter(k => k.status === 'active').length,
    totalRequests: apiKeys.reduce((sum, key) => sum + key.usageCount, 0),
    activeEndpoints: apiEndpoints.filter(e => e.status === 'active').length,
    avgResponseTime: Math.round(apiEndpoints.reduce((sum, ep) => sum + ep.responseTime, 0) / apiEndpoints.length),
    avgSuccessRate: Math.round(apiEndpoints.reduce((sum, ep) => sum + ep.successRate, 0) / apiEndpoints.length * 10) / 10
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Network className="w-8 h-8 text-purple-600" />
            API Management
          </h1>
          <p className="text-gray-600 mt-1">Manage API keys, endpoints, and integration settings</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Dialog open={isCreateKeyDialogOpen} onOpenChange={setIsCreateKeyDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                Create API Key
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New API Key</DialogTitle>
                <DialogDescription>
                  Create a new API key with specific permissions and rate limits for external integrations.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="key-name">Key Name</Label>
                  <Input id="key-name" placeholder="Enter a descriptive name" />
                </div>
                <div>
                  <Label htmlFor="permissions">Permissions</Label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="read-vehicles" />
                        <Label htmlFor="read-vehicles">Read Vehicles</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="write-vehicles" />
                        <Label htmlFor="write-vehicles">Write Vehicles</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="read-drivers" />
                        <Label htmlFor="read-drivers">Read Drivers</Label>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="read-tracking" />
                        <Label htmlFor="read-tracking">Read Tracking</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="write-tracking" />
                        <Label htmlFor="write-tracking">Write Tracking</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="read-analytics" />
                        <Label htmlFor="read-analytics">Read Analytics</Label>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <Label htmlFor="rate-limit">Rate Limit (requests/hour)</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select rate limit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="100">100 requests/hour</SelectItem>
                      <SelectItem value="500">500 requests/hour</SelectItem>
                      <SelectItem value="1000">1,000 requests/hour</SelectItem>
                      <SelectItem value="5000">5,000 requests/hour</SelectItem>
                      <SelectItem value="unlimited">Unlimited</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="expiry">Expiry Date (Optional)</Label>
                  <Input id="expiry" type="date" />
                </div>
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  Create API Key
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Key className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Total Keys</p>
                <p className="text-2xl font-bold">{apiStats.totalKeys}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Active Keys</p>
                <p className="text-2xl font-bold text-green-600">{apiStats.activeKeys}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-blue-600">{apiStats.totalRequests.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Code className="w-8 h-8 text-emerald-600" />
              <div>
                <p className="text-sm text-gray-600">Active Endpoints</p>
                <p className="text-2xl font-bold text-emerald-600">{apiStats.activeEndpoints}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Avg Response</p>
                <p className="text-2xl font-bold text-orange-600">{apiStats.avgResponseTime}ms</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-indigo-600" />
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-indigo-600">{apiStats.avgSuccessRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="keys">API Keys</TabsTrigger>
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="docs">Documentation</TabsTrigger>
        </TabsList>

        <TabsContent value="keys" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                API Keys Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>API Key</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Last Used</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiKeys.map((apiKey) => (
                    <TableRow key={apiKey.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{apiKey.name}</p>
                          <p className="text-sm text-gray-500">Rate: {apiKey.rateLimit}/hour</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                            {showKeys[apiKey.id] ? apiKey.key : maskApiKey(apiKey.key)}
                          </code>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleKeyVisibility(apiKey.id)}
                          >
                            {showKeys[apiKey.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(apiKey.key)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(apiKey.status)}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {apiKey.permissions.slice(0, 2).map((permission) => (
                            <Badge key={permission} variant="outline" className="text-xs">
                              {permission}
                            </Badge>
                          ))}
                          {apiKey.permissions.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{apiKey.permissions.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{apiKey.usageCount.toLocaleString()}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{new Date(apiKey.lastUsed).toLocaleDateString()}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
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
        </TabsContent>

        <TabsContent value="endpoints" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                API Endpoints
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Endpoint</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Performance</TableHead>
                    <TableHead>Usage (Last Hour)</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiEndpoints.map((endpoint) => (
                    <TableRow key={endpoint.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{endpoint.name}</p>
                          <code className="text-sm text-gray-600">{endpoint.path}</code>
                          <p className="text-xs text-gray-500">{endpoint.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>{getMethodBadge(endpoint.method)}</TableCell>
                      <TableCell>{getStatusBadge(endpoint.status)}</TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">{endpoint.responseTime}ms</p>
                          <p className="text-xs text-gray-500">{endpoint.successRate}% success</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{endpoint.lastHour}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <BarChart3 className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Settings className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                API Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">API Usage Analytics</h3>
                <p className="text-gray-600 mb-6">
                  Detailed analytics on API usage, performance metrics, and error tracking.
                </p>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  View Analytics Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="docs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                API Documentation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Code className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Interactive API Documentation</h3>
                <p className="text-gray-600 mb-6">
                  Comprehensive API documentation with interactive examples and testing tools.
                </p>
                <div className="flex gap-4 justify-center">
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    View Documentation
                  </Button>
                  <Button variant="outline">
                    Download OpenAPI Spec
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

export default APIManagement;
