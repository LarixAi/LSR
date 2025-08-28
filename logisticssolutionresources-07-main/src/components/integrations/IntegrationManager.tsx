import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus, Settings, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';
import { useExternalIntegrations } from '@/hooks/useExternalIntegrations';
import { useWebhookManager } from '@/hooks/useWebhookManager';
import { LoadingState } from '@/components/ui/loading-state';
import { toast } from '@/hooks/use-toast';

const IntegrationManager = () => {
  const { 
    connectedServices, 
    isConnecting, 
    connectGPSService, 
    connectPaymentService,
    connectCommunicationService,
    disconnectService 
  } = useExternalIntegrations();
  
  const { registerWebhook } = useWebhookManager();
  
  const [newIntegration, setNewIntegration] = useState({
    type: '',
    provider: '',
    credentials: {} as Record<string, string>
  });

  const [webhookConfig, setWebhookConfig] = useState({
    url: '',
    events: [] as string[],
    secret: ''
  });

  const handleConnectService = async () => {
    const { type, provider, credentials } = newIntegration;

    try {
      let result;
      
      switch (type) {
        case 'gps':
          result = await connectGPSService(
            credentials.api_key, 
            provider as 'google_maps' | 'mapbox'
          );
          break;
        case 'payment':
          result = await connectPaymentService(
            provider as 'stripe' | 'paypal',
            credentials
          );
          break;
        case 'communication':
          result = await connectCommunicationService(
            provider as 'twilio' | 'sendgrid',
            credentials
          );
          break;
        default:
          toast({
            title: "Invalid service type",
            description: "Please select a valid service type",
            variant: "destructive"
          });
          return;
      }

      if (result.success) {
        setNewIntegration({ type: '', provider: '', credentials: {} });
      }
    } catch (error) {
      console.error('Failed to connect service:', error);
    }
  };

  const handleRegisterWebhook = async () => {
    const result = await registerWebhook({
      url: webhookConfig.url,
      events: webhookConfig.events,
      secret: webhookConfig.secret
    });

    if (result.success) {
      setWebhookConfig({ url: '', events: [], secret: '' });
    }
  };

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'gps': return '🗺️';
      case 'payment': return '💳';
      case 'communication': return '📱';
      case 'analytics': return '📊';
      default: return '🔗';
    }
  };

  const getStatusColor = (connected: boolean) => 
    connected ? 'text-green-600' : 'text-red-600';

  if (isConnecting) {
    return <LoadingState text="Connecting to service..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Settings className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">Integration Manager</h2>
        </div>
        <Badge variant="secondary">
          {connectedServices.length} Connected
        </Badge>
      </div>

      <Tabs defaultValue="services" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="services">Connected Services</TabsTrigger>
          <TabsTrigger value="add-service">Add Integration</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Integrations</CardTitle>
            </CardHeader>
            <CardContent>
              {connectedServices.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ExternalLink className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No integrations configured</p>
                  <p className="text-sm">Connect external services to enhance functionality</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {connectedServices.map((service) => (
                    <div key={service.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getServiceIcon(service.type)}</span>
                        <div>
                          <h3 className="font-medium">{service.name}</h3>
                          <p className="text-sm text-muted-foreground capitalize">
                            {service.type} • {service.authType.replace('_', ' ')}
                          </p>
                          {service.rateLimits && (
                            <p className="text-xs text-muted-foreground">
                              Rate Limit: {service.rateLimits.requestsPerSecond}/sec, {service.rateLimits.requestsPerHour}/hour
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => disconnectService(service.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add-service" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add New Integration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="service-type">Service Type</Label>
                  <Select value={newIntegration.type} onValueChange={(value) => 
                    setNewIntegration(prev => ({ ...prev, type: value, provider: '' }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select service type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gps">GPS & Mapping</SelectItem>
                      <SelectItem value="payment">Payment Processing</SelectItem>
                      <SelectItem value="communication">Communication</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="provider">Provider</Label>
                  <Select value={newIntegration.provider} onValueChange={(value) => 
                    setNewIntegration(prev => ({ ...prev, provider: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      {newIntegration.type === 'gps' && (
                        <>
                          <SelectItem value="google_maps">Google Maps</SelectItem>
                          <SelectItem value="mapbox">Mapbox</SelectItem>
                        </>
                      )}
                      {newIntegration.type === 'payment' && (
                        <>
                          <SelectItem value="stripe">Stripe</SelectItem>
                          <SelectItem value="paypal">PayPal</SelectItem>
                        </>
                      )}
                      {newIntegration.type === 'communication' && (
                        <>
                          <SelectItem value="twilio">Twilio</SelectItem>
                          <SelectItem value="sendgrid">SendGrid</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {newIntegration.type && newIntegration.provider && (
                <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
                  <h4 className="font-medium">Credentials</h4>
                  {renderCredentialFields()}
                </div>
              )}

              <Button 
                onClick={handleConnectService}
                disabled={!newIntegration.type || !newIntegration.provider}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Connect Service
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Webhook Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="webhook-url">Webhook URL</Label>
                <Input
                  id="webhook-url"
                  placeholder="https://your-domain.com/webhook"
                  value={webhookConfig.url}
                  onChange={(e) => setWebhookConfig(prev => ({ ...prev, url: e.target.value }))}
                />
              </div>

              <div>
                <Label>Events to Subscribe</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {['job.created', 'driver.assigned', 'route.completed', 'vehicle.maintenance_due'].map((event) => (
                    <div key={event} className="flex items-center space-x-2">
                      <Switch
                        checked={webhookConfig.events.includes(event)}
                        onCheckedChange={(checked) => {
                          setWebhookConfig(prev => ({
                            ...prev,
                            events: checked
                              ? [...prev.events, event]
                              : prev.events.filter(e => e !== event)
                          }));
                        }}
                      />
                      <Label className="text-sm">{event}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="webhook-secret">Secret (Optional)</Label>
                <Input
                  id="webhook-secret"
                  type="password"
                  placeholder="Webhook secret for verification"
                  value={webhookConfig.secret}
                  onChange={(e) => setWebhookConfig(prev => ({ ...prev, secret: e.target.value }))}
                />
              </div>

              <Button 
                onClick={handleRegisterWebhook}
                disabled={!webhookConfig.url || webhookConfig.events.length === 0}
                className="w-full"
              >
                Register Webhook
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );

  function renderCredentialFields() {
    const { type, provider } = newIntegration;

    if (type === 'gps') {
      return (
        <Input
          placeholder="API Key"
          value={newIntegration.credentials.api_key || ''}
          onChange={(e) => setNewIntegration(prev => ({
            ...prev,
            credentials: { ...prev.credentials, api_key: e.target.value }
          }))}
        />
      );
    }

    if (type === 'payment' && provider === 'stripe') {
      return (
        <>
          <Input
            placeholder="Publishable Key"
            value={newIntegration.credentials.publishable_key || ''}
            onChange={(e) => setNewIntegration(prev => ({
              ...prev,
              credentials: { ...prev.credentials, publishable_key: e.target.value }
            }))}
          />
          <Input
            placeholder="Secret Key"
            type="password"
            value={newIntegration.credentials.secret_key || ''}
            onChange={(e) => setNewIntegration(prev => ({
              ...prev,
              credentials: { ...prev.credentials, secret_key: e.target.value }
            }))}
          />
        </>
      );
    }

    if (type === 'payment' && provider === 'paypal') {
      return (
        <>
          <Input
            placeholder="Client ID"
            value={newIntegration.credentials.client_id || ''}
            onChange={(e) => setNewIntegration(prev => ({
              ...prev,
              credentials: { ...prev.credentials, client_id: e.target.value }
            }))}
          />
          <Input
            placeholder="Client Secret"
            type="password"
            value={newIntegration.credentials.secret || ''}
            onChange={(e) => setNewIntegration(prev => ({
              ...prev,
              credentials: { ...prev.credentials, secret: e.target.value }
            }))}
          />
        </>
      );
    }

    if (type === 'communication' && provider === 'twilio') {
      return (
        <>
          <Input
            placeholder="Account SID"
            value={newIntegration.credentials.account_sid || ''}
            onChange={(e) => setNewIntegration(prev => ({
              ...prev,
              credentials: { ...prev.credentials, account_sid: e.target.value }
            }))}
          />
          <Input
            placeholder="Auth Token"
            type="password"
            value={newIntegration.credentials.auth_token || ''}
            onChange={(e) => setNewIntegration(prev => ({
              ...prev,
              credentials: { ...prev.credentials, auth_token: e.target.value }
            }))}
          />
        </>
      );
    }

    if (type === 'communication' && provider === 'sendgrid') {
      return (
        <Input
          placeholder="API Key"
          type="password"
          value={newIntegration.credentials.api_key || ''}
          onChange={(e) => setNewIntegration(prev => ({
            ...prev,
            credentials: { ...prev.credentials, api_key: e.target.value }
          }))}
        />
      );
    }

    return null;
  }
};

export default IntegrationManager;