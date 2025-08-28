import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, AlertTriangle, Clock, Users, Activity } from 'lucide-react';
import { toast } from 'sonner';

interface SecurityEvent {
  id: string;
  operation_type: string;
  operation_details: any;
  success: boolean;
  created_at: string;
  target_email?: string;
  admin_user_id?: string;
}

const SecurityMonitor: React.FC = () => {
  const { user } = useAuth();
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEvents: 0,
    failedAttempts: 0,
    rateLimitExceeded: 0,
    passwordChanges: 0
  });

  useEffect(() => {
    fetchSecurityEvents();
  }, []);

  const fetchSecurityEvents = async () => {
    try {
      setLoading(true);
      
      // Fetch recent security events
      const { data: events, error } = await supabase
        .from('admin_operation_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      setSecurityEvents(events || []);

      // Calculate stats
      const totalEvents = events?.length || 0;
      const failedAttempts = events?.filter(e => !e.success).length || 0;
      const rateLimitExceeded = events?.filter(e => {
        const details = e.operation_details as any;
        return details?.event_type === 'rate_limit_exceeded';
      }).length || 0;
      const passwordChanges = events?.filter(e => {
        const details = e.operation_details as any;
        return e.operation_type === 'password_change' || 
               details?.event_type === 'admin_password_change';
      }).length || 0;

      setStats({
        totalEvents,
        failedAttempts,
        rateLimitExceeded,
        passwordChanges
      });

    } catch (error) {
      console.error('Error fetching security events:', error);
      toast.error('Failed to load security events');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (event: SecurityEvent) => {
    if (!event.success) return 'destructive';
    if (event.operation_details?.severity === 'warning') return 'secondary';
    return 'default';
  };

  const getEventIcon = (event: SecurityEvent) => {
    const details = event.operation_details as any;
    if (details?.event_type === 'rate_limit_exceeded') {
      return <Clock className="h-4 w-4" />;
    }
    if (event.operation_type === 'password_change') {
      return <Shield className="h-4 w-4" />;
    }
    if (!event.success) {
      return <AlertTriangle className="h-4 w-4" />;
    }
    return <Activity className="h-4 w-4" />;
  };

  const formatEventDetails = (event: SecurityEvent) => {
    const details = event.operation_details as any;
    if (details?.event_type) {
      return `${details.event_type}: ${details.details?.operation || 'Security event'}`;
    }
    return event.operation_type.replace(/_/g, ' ').toUpperCase();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            Loading security events...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Events</p>
                <p className="text-2xl font-bold">{stats.totalEvents}</p>
              </div>
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Failed Attempts</p>
                <p className="text-2xl font-bold text-destructive">{stats.failedAttempts}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rate Limited</p>
                <p className="text-2xl font-bold text-orange-600">{stats.rateLimitExceeded}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Password Changes</p>
                <p className="text-2xl font-bold text-blue-600">{stats.passwordChanges}</p>
              </div>
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Events
          </CardTitle>
          <CardDescription>
            Recent security events and admin operations in your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All Events</TabsTrigger>
              <TabsTrigger value="failed">Failed</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {securityEvents.length === 0 ? (
                <Alert>
                  <AlertDescription>
                    No security events found. This is normal for new organizations.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-2">
                  {securityEvents.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getEventIcon(event)}
                        <div>
                          <p className="text-sm font-medium">
                            {formatEventDetails(event)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(event.created_at).toLocaleString()}
                          </p>
                          {event.target_email && (
                            <p className="text-xs text-muted-foreground">
                              Target: {event.target_email}
                            </p>
                          )}
                        </div>
                      </div>
                      <Badge variant={getSeverityColor(event)}>
                        {event.success ? 'Success' : 'Failed'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="failed" className="space-y-4">
              <div className="space-y-2">
                {securityEvents.filter(e => !e.success).map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg border-destructive/20">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                      <div>
                        <p className="text-sm font-medium text-destructive">
                          {formatEventDetails(event)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(event.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant="destructive">Failed</Badge>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="security" className="space-y-4">
              <div className="space-y-2">
                {securityEvents.filter(e => {
                  const details = e.operation_details as any;
                  return e.operation_type === 'security_event' || 
                         details?.event_type?.includes('security');
                }).map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Shield className="h-4 w-4" />
                      <div>
                        <p className="text-sm font-medium">
                          {formatEventDetails(event)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(event.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant={getSeverityColor(event)}>Security</Badge>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-4 flex justify-between">
            <Button variant="outline" onClick={fetchSecurityEvents}>
              Refresh Events
            </Button>
            <p className="text-xs text-muted-foreground self-center">
              Last updated: {new Date().toLocaleString()}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityMonitor;