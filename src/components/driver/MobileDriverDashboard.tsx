import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Car, 
  CheckCircle, 
  AlertTriangle, 
  MapPin, 
  Clock, 
  User, 
  Calendar,
  TrendingUp,
  Shield,
  Wifi,
  Signal,
  RefreshCw,
  Database,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useVehicles } from '@/hooks/useVehicles';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface DashboardStats {
  totalChecks: number;
  completedChecks: number;
  pendingChecks: number;
  criticalIssues: number;
  offlineData: number;
}

const MobileDriverDashboard: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const { toast } = useToast();
  const { data: vehicles, isLoading: vehiclesLoading } = useVehicles();

  // State management
  const [stats, setStats] = useState<DashboardStats>({
    totalChecks: 0,
    completedChecks: 0,
    pendingChecks: 0,
    criticalIssues: 0,
    offlineData: 0
  });
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const [isSyncing, setIsSyncing] = useState(false);
  const [recentChecks, setRecentChecks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Check connection status
  useEffect(() => {
    const checkConnection = () => {
      if (navigator.onLine) {
        setConnectionStatus('online');
      } else {
        setConnectionStatus('offline');
      }
    };

    checkConnection();
    window.addEventListener('online', checkConnection);
    window.addEventListener('offline', checkConnection);

    return () => {
      window.removeEventListener('online', checkConnection);
      window.removeEventListener('offline', checkConnection);
    };
  }, []);

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user || !profile) return;

      try {
        setLoading(true);

        // Check offline data
        const offlineChecks = JSON.parse(localStorage.getItem('offlineVehicleChecks') || '[]');
        const offlineIncidents = JSON.parse(localStorage.getItem('offlineIncidents') || '[]');
        const totalOffline = offlineChecks.length + offlineIncidents.length;

        if (connectionStatus === 'online') {
          // Load online data
          const { data: checks, error: checksError } = await supabase
            .from('vehicle_checks')
            .select('*')
            .eq('driver_id', user.id)
            .order('created_at', { ascending: false })
            .limit(10);

          if (!checksError && checks) {
            setRecentChecks(checks);
            
            const completedChecks = checks.filter(check => check.status === 'completed').length;
            const criticalIssues = checks.filter(check => 
              check.critical_failures && check.critical_failures > 0
            ).length;

            setStats({
              totalChecks: checks.length,
              completedChecks,
              pendingChecks: checks.length - completedChecks,
              criticalIssues,
              offlineData: totalOffline
            });
          }
        } else {
          // Use offline data
          setRecentChecks(offlineChecks);
          setStats({
            totalChecks: offlineChecks.length,
            completedChecks: offlineChecks.length,
            pendingChecks: 0,
            criticalIssues: offlineChecks.filter((check: any) => 
              check.critical_failures && check.critical_failures > 0
            ).length,
            offlineData: totalOffline
          });
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        toast({
          title: "Error loading data",
          description: "There was an error loading your dashboard data.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user, profile, connectionStatus, toast]);

  // Sync offline data
  const syncOfflineData = async () => {
    if (connectionStatus !== 'online' || isSyncing) return;

    setIsSyncing(true);
    let syncedCount = 0;

    try {
      // Sync offline vehicle checks
      const offlineChecks = JSON.parse(localStorage.getItem('offlineVehicleChecks') || '[]');
      for (const check of offlineChecks) {
        const { error } = await supabase
          .from('vehicle_checks')
          .insert([check]);

        if (!error) {
          syncedCount++;
        }
      }

      // Sync offline incidents
      const offlineIncidents = JSON.parse(localStorage.getItem('offlineIncidents') || '[]');
      for (const incident of offlineIncidents) {
        const { error } = await supabase
          .from('incidents')
          .insert([incident]);

        if (!error) {
          syncedCount++;
        }
      }

      // Clear synced data
      if (syncedCount > 0) {
        localStorage.removeItem('offlineVehicleChecks');
        localStorage.removeItem('offlineIncidents');
        
        toast({
          title: "Data synced successfully",
          description: `${syncedCount} items have been synced to the server.`,
        });

        // Reload dashboard data
        window.location.reload();
      }
    } catch (error) {
      console.error('Sync error:', error);
      toast({
        title: "Sync failed",
        description: "There was an error syncing offline data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Auto-sync when connection is restored
  useEffect(() => {
    if (connectionStatus === 'online' && stats.offlineData > 0) {
      syncOfflineData();
    }
  }, [connectionStatus, stats.offlineData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Driver Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Welcome back, {profile?.first_name || 'Driver'}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={signOut}
          className="text-red-500 hover:text-red-700"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>

      {/* Connection Status */}
      <Card className={cn(
        "border-l-4",
        connectionStatus === 'online' ? "border-l-green-500" : "border-l-orange-500"
      )}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {connectionStatus === 'online' ? (
                <Wifi className="w-4 h-4 text-green-500" />
              ) : (
                <Signal className="w-4 h-4 text-orange-500" />
              )}
              <span className="text-sm font-medium capitalize">{connectionStatus}</span>
            </div>
            
            {stats.offlineData > 0 && (
              <div className="flex items-center space-x-2">
                <Database className="w-3 h-3 text-orange-500" />
                <span className="text-xs text-muted-foreground">
                  {stats.offlineData} pending
                </span>
                {connectionStatus === 'online' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={syncOfflineData}
                    disabled={isSyncing}
                    className="h-6 px-2 text-xs"
                  >
                    {isSyncing ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      "Sync"
                    )}
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats.completedChecks}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{stats.criticalIssues}</p>
                <p className="text-xs text-muted-foreground">Critical</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Car className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{vehicles?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Vehicles</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{stats.totalChecks}</p>
                <p className="text-xs text-muted-foreground">Total Checks</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            className="w-full justify-start" 
            size="lg"
            onClick={() => window.location.href = '/driver/vehicle-checks'}
          >
            <CheckCircle className="w-5 h-5 mr-3" />
            Start Vehicle Check
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start" 
            size="lg"
            onClick={() => window.location.href = '/driver-incidents'}
          >
            <AlertTriangle className="w-5 h-5 mr-3" />
            Report Incident
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start" 
            size="lg"
            onClick={() => window.location.href = '/driver-jobs'}
          >
            <Calendar className="w-5 h-5 mr-3" />
            View Jobs
          </Button>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {recentChecks.length === 0 ? (
            <div className="text-center py-8">
              <Car className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-muted-foreground">No recent activity</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => window.location.href = '/driver/vehicle-checks'}
              >
                Start Your First Check
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentChecks.slice(0, 5).map((check, index) => (
                <div key={check.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      "w-3 h-3 rounded-full",
                      check.critical_failures > 0 ? "bg-red-500" : "bg-green-500"
                    )} />
                    <div>
                      <p className="font-medium text-sm">
                        Vehicle Check
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(check.created_at || check.check_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant={check.critical_failures > 0 ? "destructive" : "default"}>
                    {check.critical_failures > 0 ? "Critical" : "Passed"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vehicle Status */}
      {vehicles && vehicles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Vehicle Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {vehicles.slice(0, 3).map((vehicle) => (
                <div key={vehicle.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Car className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="font-medium text-sm">{vehicle.registration_number}</p>
                      <p className="text-xs text-muted-foreground">
                        {vehicle.make} {vehicle.model}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">
                    {vehicle.status || 'Available'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MobileDriverDashboard;
