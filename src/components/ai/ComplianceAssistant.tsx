import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bell, CheckCircle, AlertTriangle, Clock, Shield } from 'lucide-react';

interface ComplianceAlert {
  id: string;
  type: 'license_renewal' | 'inspection_due' | 'document_expiry' | 'training_required';
  title: string;
  description: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  due_date: string;
  affected_entity: string;
  action_required: string;
}

const ComplianceAssistant = () => {
  // Mock data for demo purposes
  const alerts: ComplianceAlert[] = [
    {
      id: '1',
      type: 'inspection_due',
      title: 'Vehicle Inspection Due',
      description: 'Annual MOT inspection due for vehicle BUS123',
      urgency: 'medium',
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      affected_entity: 'BUS123',
      action_required: 'Schedule inspection'
    },
    {
      id: '2',
      type: 'license_renewal',
      title: 'Driver License Expiry',
      description: 'Commercial driver license expires soon',
      urgency: 'high',
      due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      affected_entity: 'John Smith',
      action_required: 'Renew license'
    }
  ];

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <Clock className="w-4 h-4" />;
      case 'low': return <Bell className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const handleResolveAlert = (alertId: string) => {
    console.log('Resolving alert:', alertId);
    // Mock action - in real implementation would update database
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
        {alerts.length === 0 ? (
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
                  {getUrgencyIcon(alert.urgency)}
                  <h4 className="font-medium">{alert.title}</h4>
                </div>
                <Badge className={getUrgencyColor(alert.urgency)}>
                  {alert.urgency.toUpperCase()}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">{alert.description}</p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Affected: {alert.affected_entity}</span>
                <span>Due: {new Date(alert.due_date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Action: {alert.action_required}</span>
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