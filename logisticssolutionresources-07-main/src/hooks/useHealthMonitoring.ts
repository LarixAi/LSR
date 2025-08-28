import { useState, useCallback, useEffect } from 'react';

interface HealthCheck {
  name: string;
  status: 'healthy' | 'warning' | 'error';
  response_time?: number;
  last_checked: string;
  details?: Record<string, any>;
}

interface SystemHealth {
  overall_status: 'healthy' | 'degraded' | 'down';
  checks: HealthCheck[];
  uptime: number;
  last_update: string;
}

export const useHealthMonitoring = () => {
  const [health, setHealth] = useState<SystemHealth>({
    overall_status: 'healthy',
    checks: [],
    uptime: 0,
    last_update: new Date().toISOString()
  });
  const [isChecking, setIsChecking] = useState(false);

  const checkDatabaseHealth = useCallback(async (): Promise<HealthCheck> => {
    const start = Date.now();
    try {
      // Simple query to check database connectivity
      const response = await fetch('/api/health/database', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const responseTime = Date.now() - start;
      
      if (response.ok) {
        return {
          name: 'Database',
          status: responseTime < 1000 ? 'healthy' : 'warning',
          response_time: responseTime,
          last_checked: new Date().toISOString(),
          details: { query_time: responseTime }
        };
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error: any) {
      return {
        name: 'Database',
        status: 'error',
        response_time: Date.now() - start,
        last_checked: new Date().toISOString(),
        details: { error: error.message }
      };
    }
  }, []);

  const checkAPIHealth = useCallback(async (): Promise<HealthCheck> => {
    const start = Date.now();
    try {
      const response = await fetch('/api/health/api', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const responseTime = Date.now() - start;
      
      if (response.ok) {
        return {
          name: 'API',
          status: responseTime < 500 ? 'healthy' : 'warning',
          response_time: responseTime,
          last_checked: new Date().toISOString()
        };
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error: any) {
      return {
        name: 'API',
        status: 'error',
        response_time: Date.now() - start,
        last_checked: new Date().toISOString(),
        details: { error: error.message }
      };
    }
  }, []);

  const checkExternalServices = useCallback(async (): Promise<HealthCheck[]> => {
    const services = [
      { name: 'GPS Service', url: 'https://maps.googleapis.com/maps/api/js' },
      { name: 'Payment Gateway', url: 'https://api.stripe.com/healthcheck' },
      { name: 'Email Service', url: 'https://api.sendgrid.com/v3/user/profile' }
    ];

    const checks = await Promise.all(
      services.map(async (service) => {
        const start = Date.now();
        try {
          const response = await fetch(service.url, { 
            method: 'HEAD',
            mode: 'no-cors' // For external services
          });
          
          const responseTime = Date.now() - start;
          
          return {
            name: service.name,
            status: (responseTime < 2000 ? 'healthy' : 'warning') as 'healthy' | 'warning',
            response_time: responseTime,
            last_checked: new Date().toISOString()
          };
        } catch (error: any) {
          return {
            name: service.name,
            status: 'error' as const,
            response_time: Date.now() - start,
            last_checked: new Date().toISOString(),
            details: { error: error.message }
          };
        }
      })
    );

    return checks;
  }, []);

  const checkMemoryUsage = useCallback((): HealthCheck => {
    try {
      // @ts-ignore - performance.memory is not in all browsers
      const memory = performance.memory;
      
      if (memory) {
        const usedPercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
        
        return {
          name: 'Memory Usage',
          status: usedPercent < 70 ? 'healthy' : usedPercent < 90 ? 'warning' : 'error',
          last_checked: new Date().toISOString(),
          details: {
            used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
            total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
            limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024),
            usage_percent: Math.round(usedPercent)
          }
        };
      } else {
        return {
          name: 'Memory Usage',
          status: 'warning',
          last_checked: new Date().toISOString(),
          details: { message: 'Memory monitoring not available' }
        };
      }
    } catch (error: any) {
      return {
        name: 'Memory Usage',
        status: 'error',
        last_checked: new Date().toISOString(),
        details: { error: error.message }
      };
    }
  }, []);

  const runHealthChecks = useCallback(async () => {
    setIsChecking(true);
    
    try {
      const [
        databaseHealth,
        apiHealth,
        externalServicesHealth,
        memoryHealth
      ] = await Promise.all([
        checkDatabaseHealth(),
        checkAPIHealth(),
        checkExternalServices(),
        Promise.resolve(checkMemoryUsage())
      ]);

      const allChecks = [
        databaseHealth,
        apiHealth,
        memoryHealth,
        ...externalServicesHealth
      ];

      // Determine overall status
      const hasErrors = allChecks.some(check => check.status === 'error');
      const hasWarnings = allChecks.some(check => check.status === 'warning');
      
      const overallStatus = hasErrors ? 'down' : hasWarnings ? 'degraded' : 'healthy';

      setHealth({
        overall_status: overallStatus,
        checks: allChecks,
        uptime: Date.now() - (Date.parse('2024-01-01') || Date.now()), // Mock uptime
        last_update: new Date().toISOString()
      });

    } catch (error) {
      console.error('Health check failed:', error);
    } finally {
      setIsChecking(false);
    }
  }, [checkDatabaseHealth, checkAPIHealth, checkExternalServices, checkMemoryUsage]);

  const startMonitoring = useCallback((interval: number = 60000) => {
    // Run initial check
    runHealthChecks();
    
    // Set up periodic checks
    const intervalId = setInterval(runHealthChecks, interval);
    
    return () => clearInterval(intervalId);
  }, [runHealthChecks]);

  useEffect(() => {
    const cleanup = startMonitoring();
    return cleanup;
  }, [startMonitoring]);

  return {
    health,
    isChecking,
    runHealthChecks,
    startMonitoring
  };
};