import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bell, CheckCircle, AlertTriangle, Clock, Shield } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ComplianceAlert {
  id: string;
  alert_type: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  due_date: string;
  driver_id?: string;
  vehicle_id?: string;
  status: string;
}

const ComplianceAssistant = () => {
  const { profile } = useAuth();

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['compliance-alerts', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      
      const { data, error } = await supabase
        .from('compliance_alerts')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .eq('status', 'open')
        .order('due_date', { ascending: true });

      if (error) {
        console.error('Error fetching compliance alerts:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!profile?.organization_id
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <Clock className="w-4 h-4" />;
      case 'low': return <Bell className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('compliance_alerts')
        .update({ status: 'resolved', resolved_date: new Date().toISOString() })
        .eq('id', alertId);

      if (error) {
        console.error('Error resolving alert:', error);
        return;
      }
      
      // Refresh alerts after resolving
      window.location.reload();
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-blue-600" />
          <span>Compliance Assistant</span>
        </CardTitle>
        <CardDescription>
          AI-powered monitoring for regulations and documentation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-2 text-gray-500">Loading compliance alerts...</p>
          </div>
        ) : alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mb-3" />
            <h3 className="text-lg font-semibold mb-2">All Clear!</h3>
            <p className="text-muted-foreground">No compliance alerts at this time</p>
          </div>
        ) : (
          alerts.map((alert) => (
             <div key={alert.id} className="border rounded-lg p-4 space-y-2">
               <div className="flex items-center justify-between">
                 <div className="flex items-center space-x-2">
                   {getSeverityIcon(alert.severity)}
                   <h4 className="font-medium">{alert.title}</h4>
                 </div>
                 <Badge className={getSeverityColor(alert.severity)}>
                   {alert.severity.toUpperCase()}
                 </Badge>
               </div>
               <p className="text-sm text-gray-600">{alert.description}</p>
               <div className="flex items-center justify-between text-xs text-gray-500">
                 <span>Type: {alert.alert_type}</span>
                 <span>Due: {new Date(alert.due_date).toLocaleDateString()}</span>
               </div>
               <div className="flex items-center justify-between">
                 <span className="text-sm font-medium">Status: {alert.status}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleResolveAlert(alert.id)}
                >
                  Mark Resolved
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default ComplianceAssistant;