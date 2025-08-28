import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface ExternalService {
  id: string;
  name: string;
  type: 'gps' | 'payment' | 'communication' | 'analytics' | 'mapping';
  baseUrl: string;
  authType: 'api_key' | 'oauth' | 'bearer_token';
  credentials?: Record<string, string>;
  rateLimits?: {
    requestsPerSecond: number;
    requestsPerHour: number;
  };
}

export const useExternalIntegrations = () => {
  const { user } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectedServices, setConnectedServices] = useState<ExternalService[]>([]);

  const connectGPSService = useCallback(async (apiKey: string, serviceType: 'google_maps' | 'mapbox') => {
    setIsConnecting(true);
    
    try {
      // Test the API connection
      const testEndpoint = serviceType === 'google_maps' 
        ? `https://maps.googleapis.com/maps/api/geocode/json?address=test&key=${apiKey}`
        : `https://api.mapbox.com/geocoding/v5/mapbox.places/test.json?access_token=${apiKey}`;

      const response = await fetch(testEndpoint);
      
      if (!response.ok) {
        throw new Error('Invalid API key or service unavailable');
      }

      const service: ExternalService = {
        id: `gps_${serviceType}`,
        name: serviceType === 'google_maps' ? 'Google Maps' : 'Mapbox',
        type: 'gps',
        baseUrl: serviceType === 'google_maps' 
          ? 'https://maps.googleapis.com/maps/api'
          : 'https://api.mapbox.com',
        authType: 'api_key',
        credentials: { api_key: apiKey },
        rateLimits: {
          requestsPerSecond: serviceType === 'google_maps' ? 50 : 600,
          requestsPerHour: serviceType === 'google_maps' ? 25000 : 100000
        }
      };

      setConnectedServices(prev => [...prev, service]);
      
      toast({
        title: "GPS Service Connected",
        description: `Successfully connected to ${service.name}`
      });

      return { success: true, service };
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error.message,
        variant: "destructive"
      });
      return { success: false, error };
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const connectPaymentService = useCallback(async (
    provider: 'stripe' | 'paypal',
    credentials: Record<string, string>
  ) => {
    setIsConnecting(true);
    
    try {
      // Test payment service connection
      let testEndpoint = '';
      let headers: Record<string, string> = {};

      if (provider === 'stripe') {
        testEndpoint = 'https://api.stripe.com/v1/account';
        headers = {
          'Authorization': `Bearer ${credentials.secret_key}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        };
      } else if (provider === 'paypal') {
        testEndpoint = 'https://api.paypal.com/v1/oauth2/token';
        headers = {
          'Authorization': `Basic ${btoa(`${credentials.client_id}:${credentials.secret}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        };
      }

      const response = await fetch(testEndpoint, {
        method: provider === 'paypal' ? 'POST' : 'GET',
        headers,
        body: provider === 'paypal' ? 'grant_type=client_credentials' : undefined
      });

      if (!response.ok) {
        throw new Error('Invalid credentials or service unavailable');
      }

      const service: ExternalService = {
        id: `payment_${provider}`,
        name: provider === 'stripe' ? 'Stripe' : 'PayPal',
        type: 'payment',
        baseUrl: provider === 'stripe' 
          ? 'https://api.stripe.com/v1'
          : 'https://api.paypal.com',
        authType: provider === 'stripe' ? 'bearer_token' : 'oauth',
        credentials,
        rateLimits: {
          requestsPerSecond: 25,
          requestsPerHour: 1000
        }
      };

      setConnectedServices(prev => [...prev, service]);
      
      toast({
        title: "Payment Service Connected",
        description: `Successfully connected to ${service.name}`
      });

      return { success: true, service };
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error.message,
        variant: "destructive"
      });
      return { success: false, error };
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const connectCommunicationService = useCallback(async (
    provider: 'twilio' | 'sendgrid',
    credentials: Record<string, string>
  ) => {
    setIsConnecting(true);
    
    try {
      let testEndpoint = '';
      let headers: Record<string, string> = {};

      if (provider === 'twilio') {
        testEndpoint = `https://api.twilio.com/2010-04-01/Accounts/${credentials.account_sid}.json`;
        headers = {
          'Authorization': `Basic ${btoa(`${credentials.account_sid}:${credentials.auth_token}`)}`
        };
      } else if (provider === 'sendgrid') {
        testEndpoint = 'https://api.sendgrid.com/v3/user/profile';
        headers = {
          'Authorization': `Bearer ${credentials.api_key}`
        };
      }

      const response = await fetch(testEndpoint, { headers });

      if (!response.ok) {
        throw new Error('Invalid credentials or service unavailable');
      }

      const service: ExternalService = {
        id: `communication_${provider}`,
        name: provider === 'twilio' ? 'Twilio' : 'SendGrid',
        type: 'communication',
        baseUrl: provider === 'twilio' 
          ? 'https://api.twilio.com/2010-04-01'
          : 'https://api.sendgrid.com/v3',
        authType: provider === 'twilio' ? 'api_key' : 'bearer_token',
        credentials,
        rateLimits: {
          requestsPerSecond: provider === 'twilio' ? 1 : 10,
          requestsPerHour: provider === 'twilio' ? 3600 : 1000
        }
      };

      setConnectedServices(prev => [...prev, service]);
      
      toast({
        title: "Communication Service Connected",
        description: `Successfully connected to ${service.name}`
      });

      return { success: true, service };
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error.message,
        variant: "destructive"
      });
      return { success: false, error };
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnectService = useCallback((serviceId: string) => {
    setConnectedServices(prev => prev.filter(service => service.id !== serviceId));
    
    toast({
      title: "Service Disconnected",
      description: "Service has been successfully disconnected"
    });
  }, []);

  const getServiceByType = useCallback((type: ExternalService['type']) => {
    return connectedServices.find(service => service.type === type);
  }, [connectedServices]);

  const makeAPICall = useCallback(async (
    serviceId: string, 
    endpoint: string, 
    options?: RequestInit
  ) => {
    const service = connectedServices.find(s => s.id === serviceId);
    
    if (!service) {
      throw new Error('Service not connected');
    }

    const url = `${service.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options?.headers as Record<string, string> || {})
    };

    // Add authentication headers
    if (service.authType === 'api_key' && service.credentials?.api_key) {
      headers['Authorization'] = `Bearer ${service.credentials.api_key}`;
    } else if (service.authType === 'bearer_token' && service.credentials?.token) {
      headers['Authorization'] = `Bearer ${service.credentials.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }, [connectedServices]);

  return {
    connectedServices,
    isConnecting,
    connectGPSService,
    connectPaymentService,
    connectCommunicationService,
    disconnectService,
    getServiceByType,
    makeAPICall
  };
};