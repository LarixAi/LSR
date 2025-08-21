
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  User, 
  Settings, 
  Shield, 
  Bell, 
  Eye, 
  EyeOff, 
  Save, 
  Edit, 
  Calendar,
  Mail,
  Phone,
  MapPin,
  Clock,
  Activity,
  CheckCircle,
  AlertCircle,
  Crown,
  Users,
  Database,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const UserProfile = () => {
  const { user, profile } = useAuth();
  const { updating, updateProfile, updatePassword } = useProfile();
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    phone: '', // Phone field removed from profile but kept in form for display
  });
  
  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleProfileUpdate = async () => {
    if (!profileForm.first_name.trim() || !profileForm.last_name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'First name and last name are required.',
        variant: 'destructive',
      });
      return;
    }

    const { error } = await updateProfile({
      first_name: profileForm.first_name.trim(),
      last_name: profileForm.last_name.trim(),
    });

    if (!error) {
      setIsEditing(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (!passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all password fields.',
        variant: 'destructive',
      });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: 'Validation Error',
        description: 'New passwords do not match.',
        variant: 'destructive',
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast({
        title: 'Validation Error',
        description: 'Password must be at least 6 characters long.',
        variant: 'destructive',
      });
      return;
    }

    const { error } = await updatePassword(passwordForm.newPassword);

    if (!error) {
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'council':
        return 'bg-blue-100 text-blue-800';
      case 'driver':
        return 'bg-green-100 text-green-800';
      case 'parent':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  // Comprehensive admin statistics
  const { data: adminStats } = useQuery({
    queryKey: ['admin-stats', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id || profile?.role !== 'admin') return null;
      
      const [
        vehiclesRes, 
        driversRes, 
        routesRes, 
        incidentsRes, 
        supportTicketsRes,
        recentChecksRes,
        mechanicsRes
      ] = await Promise.all([
        supabase.from('vehicles').select('id, status').eq('organization_id', profile.organization_id),
        supabase.from('profiles').select('id, employment_status').eq('organization_id', profile.organization_id).eq('role', 'driver'),
        supabase.from('routes').select('id, status').eq('organization_id', profile.organization_id),
        supabase.from('incidents').select('id, severity, created_at').eq('organization_id', profile.organization_id).gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('support_tickets').select('id, status, priority').eq('organization_id', profile.organization_id),
        supabase.from('vehicle_checks').select('id, created_at').eq('organization_id', profile.organization_id).gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('profiles').select('id').eq('organization_id', profile.organization_id).eq('role', 'mechanic')
      ]);
      
      const activeVehicles = vehiclesRes.data?.filter(v => v.status === 'active').length || 0;
      const activeDrivers = driversRes.data?.filter(d => d.employment_status === 'active').length || 0;
      const activeRoutes = routesRes.data?.filter(r => r.status === 'active').length || 0;
      const recentIncidents = incidentsRes.data?.length || 0;
      const openTickets = supportTicketsRes.data?.filter(t => t.status === 'open').length || 0;
      const weeklyChecks = recentChecksRes.data?.length || 0;
      
      return {
        totalVehicles: vehiclesRes.data?.length || 0,
        activeVehicles,
        totalDrivers: driversRes.data?.length || 0,
        activeDrivers,
        totalRoutes: routesRes.data?.length || 0,
        activeRoutes,
        totalMechanics: mechanicsRes.data?.length || 0,
        recentIncidents,
        openTickets,
        weeklyChecks,
        systemHealth: {
          vehicleUtilization: totalVehicles > 0 ? Math.round((activeVehicles / (vehiclesRes.data?.length || 1)) * 100) : 0,
          driverUtilization: totalDrivers > 0 ? Math.round((activeDrivers / (driversRes.data?.length || 1)) * 100) : 0,
          routeEfficiency: totalRoutes > 0 ? Math.round((activeRoutes / (routesRes.data?.length || 1)) * 100) : 0
        }
      };
    },
    enabled: !!profile?.organization_id && profile?.role === 'admin'
  });

  // Recent activity feed
  const { data: recentActivity } = useQuery({
    queryKey: ['admin-activity', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id || profile?.role !== 'admin') return [];
      
      const [newUsersRes, incidentsRes, checksRes] = await Promise.all([
        supabase.from('profiles')
          .select('first_name, last_name, role, created_at')
          .eq('organization_id', profile.organization_id)
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: false })
          .limit(5),
        supabase.from('incidents')
          .select('id, type, severity, created_at')
          .eq('organization_id', profile.organization_id)
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: false })
          .limit(3),
        supabase.from('vehicle_checks')
          .select('id, vehicle_id, created_at')
          .eq('organization_id', profile.organization_id)
          .gte('created_at', new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: false })
          .limit(5)
      ]);
      
      const activities = [
        ...(newUsersRes.data || []).map(user => ({
          type: 'user_registered',
          message: `${user.first_name} ${user.last_name} registered as ${user.role}`,
          timestamp: user.created_at,
          severity: 'info'
        })),
        ...(incidentsRes.data || []).map(incident => ({
          type: 'incident',
          message: `New ${incident.severity} ${incident.type} incident reported`,
          timestamp: incident.created_at,
          severity: incident.severity
        })),
        ...(checksRes.data || []).map(check => ({
          type: 'vehicle_check',
          message: `Vehicle check completed`,
          timestamp: check.created_at,
          severity: 'info'
        }))
      ];
      
      return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10);
    },
    enabled: !!profile?.organization_id && profile?.role === 'admin'
  });

  const getAdminRoleIcon = () => {
    return <Crown className="w-4 h-4" />;
  };

  const isAdmin = profile?.role === 'admin';

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Enhanced Header for Admin */}
      {isAdmin && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Crown className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Admin Profile</h1>
              <p className="text-muted-foreground">System administrator dashboard and settings</p>
            </div>
          </div>
          <Badge className="bg-red-100 text-red-800">
            <Crown className="w-4 h-4 mr-1" />
            Administrator
          </Badge>
        </div>
      )}
      
      {!isAdmin && (
        <div className="mb-8">
          <h1 className="text-3xl font-bold">User Profile</h1>
          <p className="text-muted-foreground mt-2">Manage your account settings and preferences</p>
        </div>
      )}

      {/* Enhanced Admin Quick Stats */}
      {isAdmin && adminStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Fleet Overview */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Fleet Status</p>
                  <p className="text-2xl font-bold">{adminStats.activeVehicles}/{adminStats.totalVehicles}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-muted-foreground">
                      {adminStats.systemHealth?.vehicleUtilization}% active
                    </span>
                  </div>
                </div>
                <Database className="h-8 w-8 text-muted-foreground" />
              </div>
              <Progress value={adminStats.systemHealth?.vehicleUtilization} className="mt-3 h-2" />
            </CardContent>
          </Card>

          {/* Workforce */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Workforce</p>
                  <p className="text-2xl font-bold">{adminStats.activeDrivers}/{adminStats.totalDrivers}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-xs text-muted-foreground">
                      +{adminStats.totalMechanics} mechanics
                    </span>
                  </div>
                </div>
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <Progress value={adminStats.systemHealth?.driverUtilization} className="mt-3 h-2" />
            </CardContent>
          </Card>

          {/* Operations */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Operations</p>
                  <p className="text-2xl font-bold">{adminStats.activeRoutes}/{adminStats.totalRoutes}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-xs text-muted-foreground">
                      {adminStats.weeklyChecks} checks this week
                    </span>
                  </div>
                </div>
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
              </div>
              <Progress value={adminStats.systemHealth?.routeEfficiency} className="mt-3 h-2" />
            </CardContent>
          </Card>

          {/* Alerts & Support */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Issues</p>
                  <p className="text-2xl font-bold">{adminStats.openTickets + adminStats.recentIncidents}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <div className={`w-2 h-2 rounded-full ${adminStats.recentIncidents > 0 ? 'bg-red-500' : 'bg-green-500'}`}></div>
                    <span className="text-xs text-muted-foreground">
                      {adminStats.recentIncidents} incidents (30d)
                    </span>
                  </div>
                </div>
                <AlertCircle className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="mt-3 flex gap-2">
                {adminStats.openTickets > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {adminStats.openTickets} tickets
                  </Badge>
                )}
                {adminStats.recentIncidents > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {adminStats.recentIncidents} incidents
                  </Badge>
                )}
                {adminStats.openTickets === 0 && adminStats.recentIncidents === 0 && (
                  <Badge className="bg-green-100 text-green-800 text-xs">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    All clear
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-5' : 'grid-cols-4'}`}>
          <TabsTrigger value="profile" className="flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span>Profile</span>
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="admin" className="flex items-center space-x-2">
              <Crown className="w-4 h-4" />
              <span>Admin</span>
            </TabsTrigger>
          )}
          <TabsTrigger value="security" className="flex items-center space-x-2">
            <Shield className="w-4 h-4" />
            <span>Security</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center space-x-2">
            <Bell className="w-4 h-4" />
            <span>Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Preferences</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="grid gap-6">
            {/* Enhanced Profile Overview */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-20 h-20">
                      <AvatarImage src={profile.avatar_url || ''} />
                      <AvatarFallback className="text-lg">
                        {profile.first_name?.[0]}{profile.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-2xl font-bold">
                          {profile.first_name} {profile.last_name}
                        </h2>
                        {isAdmin && <Crown className="w-5 h-5 text-red-600" />}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        <p>{profile.email}</p>
                      </div>
                      <div className="flex items-center space-x-2 mt-3">
                        <Badge className={getRoleColor(profile.role)}>
                          {isAdmin && <Crown className="w-3 h-3 mr-1" />}
                          {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                        </Badge>
                        <Badge className={getStatusColor(profile.employment_status || 'active')}>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {profile.employment_status || 'Active'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center space-x-2"
                  >
                    <Edit className="w-4 h-4" />
                    <span>{isEditing ? 'Cancel' : 'Edit'}</span>
                  </Button>
                </div>
              </CardHeader>
            </Card>

            {/* Admin System Overview with Activity Feed */}
            {isAdmin && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      System Overview
                    </CardTitle>
                    <CardDescription>
                      Real-time system status and organization details
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold">Organization Details</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Organization ID</span>
                          <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
                            {profile.organization_id}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Admin Since</span>
                          <span className="text-sm">{new Date().toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Last Active</span>
                          <Badge className="bg-green-100 text-green-800 text-xs">
                            <Clock className="w-3 h-3 mr-1" />
                            Online now
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Access Level</span>
                          <Badge className="bg-red-100 text-red-800 text-xs">
                            <Crown className="w-3 h-3 mr-1" />
                            Full Admin
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <h3 className="font-semibold">System Health</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Platform Status</span>
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Operational
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Database</span>
                          <Badge className="bg-green-100 text-green-800">
                            <Database className="w-3 h-3 mr-1" />
                            Connected
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Last Backup</span>
                          <span className="text-sm">2 hours ago</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Server Load</span>
                          <div className="flex items-center gap-2">
                            <Progress value={23} className="w-16 h-2" />
                            <span className="text-xs text-muted-foreground">23%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="w-5 h-5" />
                      Recent Activity
                    </CardTitle>
                    <CardDescription>
                      Latest system events and user activities
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentActivity && recentActivity.length > 0 ? (
                        recentActivity.slice(0, 8).map((activity, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <div className={`w-2 h-2 rounded-full mt-2 ${
                              activity.severity === 'high' || activity.severity === 'critical' 
                                ? 'bg-red-500' 
                                : activity.severity === 'medium' 
                                ? 'bg-yellow-500' 
                                : 'bg-green-500'
                            }`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-foreground">{activity.message}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(activity.timestamp).toLocaleString()}
                              </p>
                            </div>
                            <Badge 
                              variant="secondary" 
                              className={`text-xs ${
                                activity.type === 'incident' 
                                  ? 'bg-red-100 text-red-800' 
                                  : activity.type === 'user_registered' 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : 'bg-green-100 text-green-800'
                              }`}
                            >
                              {activity.type.replace('_', ' ')}
                            </Badge>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6">
                          <Activity className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">No recent activity</p>
                        </div>
                      )}
                      
                      <Separator />
                      
                      <div className="flex justify-center">
                        <Button variant="outline" size="sm" className="text-xs">
                          View All Activity
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Profile Details */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your personal details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name</Label>
                    <Input
                      id="first_name"
                      value={profileForm.first_name}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, first_name: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                      id="last_name"
                      value={profileForm.last_name}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, last_name: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={profile.email}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-sm text-gray-500">Email cannot be changed</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value=""
                    onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="Phone number not available"
                  />
                </div>

                {isEditing && (
                  <div className="flex space-x-2 pt-4">
                    <Button
                      onClick={handleProfileUpdate}
                      disabled={updating}
                      className="flex items-center space-x-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>{updating ? 'Saving...' : 'Save Changes'}</span>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Admin Tab - Only visible for admin users */}
        {isAdmin && (
          <TabsContent value="admin">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="w-5 h-5" />
                    Administrator Settings
                  </CardTitle>
                  <CardDescription>
                    System-wide configuration and administrative controls
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* System Configuration */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">System Configuration</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium">Maintenance Mode</Label>
                          <p className="text-xs text-muted-foreground">Enable system maintenance</p>
                        </div>
                        <Switch defaultChecked={false} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium">Debug Logging</Label>
                          <p className="text-xs text-muted-foreground">Enable detailed system logs</p>
                        </div>
                        <Switch defaultChecked={false} />
                      </div>
                    </div>
                    <Separator />
                  </div>

                  {/* User Management */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">User Management</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium">Auto-approve Drivers</Label>
                          <p className="text-xs text-muted-foreground">Automatically approve driver registrations</p>
                        </div>
                        <Switch defaultChecked={true} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium">Require 2FA</Label>
                          <p className="text-xs text-muted-foreground">Force two-factor authentication</p>
                        </div>
                        <Switch defaultChecked={false} />
                      </div>
                    </div>
                    <Separator />
                  </div>

                  {/* Data & Security */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Data Management</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Button variant="outline" className="justify-start">
                        <Database className="w-4 h-4 mr-2" />
                        Export Data
                      </Button>
                      <Button variant="outline" className="justify-start">
                        <Shield className="w-4 h-4 mr-2" />
                        Audit Logs
                      </Button>
                      <Button variant="outline" className="justify-start">
                        <Activity className="w-4 h-4 mr-2" />
                        Health Report
                      </Button>
                      <Button variant="outline" className="justify-start">
                        <Users className="w-4 h-4 mr-2" />
                        Manage Users
                      </Button>
                    </div>
                    <Separator />
                  </div>

                  {/* Advanced Admin Features */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Advanced Operations</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium">Compliance Monitoring</Label>
                          <p className="text-xs text-muted-foreground">Monitor driver compliance and violations</p>
                        </div>
                        <Switch defaultChecked={true} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium">Real-time Tracking</Label>
                          <p className="text-xs text-muted-foreground">Enable GPS tracking for all vehicles</p>
                        </div>
                        <Switch defaultChecked={true} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium">Automated Reporting</Label>
                          <p className="text-xs text-muted-foreground">Generate daily/weekly reports automatically</p>
                        </div>
                        <Switch defaultChecked={false} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium">Emergency Protocols</Label>
                          <p className="text-xs text-muted-foreground">Enable emergency response system</p>
                        </div>
                        <Switch defaultChecked={true} />
                      </div>
                    </div>
                    <Separator />
                  </div>

                  {/* System Integrations */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">System Integrations</h3>
                    <div className="grid grid-cols-1 gap-3">
                      {adminStats && (
                        <>
                          <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              </div>
                              <div>
                                <p className="font-medium text-sm">Supabase Database</p>
                                <p className="text-xs text-muted-foreground">Connected & Operational</p>
                              </div>
                            </div>
                            <Badge className="bg-green-100 text-green-800">Active</Badge>
                          </div>
                          
                          <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <MapPin className="w-4 h-4 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-medium text-sm">Google Maps API</p>
                                <p className="text-xs text-muted-foreground">Route optimization enabled</p>
                              </div>
                            </div>
                            <Badge className="bg-blue-100 text-blue-800">Connected</Badge>
                          </div>
                          
                          <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <Bell className="w-4 h-4 text-yellow-600" />
                              </div>
                              <div>
                                <p className="font-medium text-sm">Notification Service</p>
                                <p className="text-xs text-muted-foreground">Push notifications & SMS</p>
                              </div>
                            </div>
                            <Badge className="bg-yellow-100 text-yellow-800">Configured</Badge>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Administrative changes can affect system performance. Review changes carefully before applying.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your password and security preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Change Password</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="current_password">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="current_password"
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                      placeholder="Enter current password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new_password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="new_password"
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                      placeholder="Enter new password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm_password">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirm_password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="Confirm new password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={handlePasswordUpdate}
                  disabled={updating}
                  className="flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{updating ? 'Updating...' : 'Update Password'}</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                {isAdmin 
                  ? "Configure system-wide and personal notification settings" 
                  : "Choose how you want to be notified about updates and activities"
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Personal Notifications */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Personal Notifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Email Notifications</Label>
                      <p className="text-xs text-muted-foreground">Receive updates via email</p>
                    </div>
                    <Switch defaultChecked={true} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">SMS Notifications</Label>
                      <p className="text-xs text-muted-foreground">Receive urgent alerts via SMS</p>
                    </div>
                    <Switch defaultChecked={false} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Push Notifications</Label>
                      <p className="text-xs text-muted-foreground">Browser push notifications</p>
                    </div>
                    <Switch defaultChecked={true} />
                  </div>
                </div>
                <Separator />
              </div>

              {/* Admin-specific notifications */}
              {isAdmin && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Administrative Alerts</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">System Alerts</Label>
                        <p className="text-xs text-muted-foreground">Critical system notifications</p>
                      </div>
                      <Switch defaultChecked={true} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">Security Alerts</Label>
                        <p className="text-xs text-muted-foreground">Login attempts and security events</p>
                      </div>
                      <Switch defaultChecked={true} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">User Activity</Label>
                        <p className="text-xs text-muted-foreground">New registrations and user actions</p>
                      </div>
                      <Switch defaultChecked={false} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">System Health</Label>
                        <p className="text-xs text-muted-foreground">Performance and maintenance alerts</p>
                      </div>
                      <Switch defaultChecked={true} />
                    </div>
                  </div>
                  <Separator />
                </div>
              )}

              {/* Notification Schedule */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Schedule</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quiet-hours-start">Quiet Hours Start</Label>
                    <Input
                      id="quiet-hours-start"
                      type="time"
                      defaultValue="22:00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quiet-hours-end">Quiet Hours End</Label>
                    <Input
                      id="quiet-hours-end"
                      type="time"
                      defaultValue="07:00"
                    />
                  </div>
                </div>
              </div>

              <Button className="w-full">
                <Save className="w-4 h-4 mr-2" />
                Save Notification Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Application Preferences
              </CardTitle>
              <CardDescription>
                {isAdmin 
                  ? "Customize your administration experience and system defaults" 
                  : "Customize your application experience"
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Display Preferences */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Display</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Dark Mode</Label>
                      <p className="text-xs text-muted-foreground">Use dark theme</p>
                    </div>
                    <Switch defaultChecked={false} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Compact View</Label>
                      <p className="text-xs text-muted-foreground">Show more information in less space</p>
                    </div>
                    <Switch defaultChecked={false} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="items-per-page">Items per page</Label>
                    <select 
                      id="items-per-page" 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      defaultValue="20"
                    >
                      <option value="10">10</option>
                      <option value="20">20</option>
                      <option value="50">50</option>
                      <option value="100">100</option>
                    </select>
                  </div>
                </div>
                <Separator />
              </div>

              {/* Admin Preferences */}
              {isAdmin && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Administrative Defaults</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">Auto-approve New Users</Label>
                        <p className="text-xs text-muted-foreground">Automatically approve new user registrations</p>
                      </div>
                      <Switch defaultChecked={true} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">Show Advanced Options</Label>
                        <p className="text-xs text-muted-foreground">Display advanced configuration options by default</p>
                      </div>
                      <Switch defaultChecked={false} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="default-user-role">Default New User Role</Label>
                      <select 
                        id="default-user-role" 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        defaultValue="driver"
                      >
                        <option value="driver">Driver</option>
                        <option value="parent">Parent</option>
                        <option value="mechanic">Mechanic</option>
                      </select>
                    </div>
                  </div>
                  <Separator />
                </div>
              )}

              {/* Language & Region */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Language & Region</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <select 
                      id="language" 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      defaultValue="en"
                    >
                      <option value="en">English</option>
                      <option value="af">Afrikaans</option>
                      <option value="zu">Zulu</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <select 
                      id="timezone" 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      defaultValue="Africa/Johannesburg"
                    >
                      <option value="Africa/Johannesburg">SAST (UTC+2)</option>
                      <option value="UTC">UTC (UTC+0)</option>
                    </select>
                  </div>
                </div>
              </div>

              <Button className="w-full">
                <Save className="w-4 h-4 mr-2" />
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserProfile;
