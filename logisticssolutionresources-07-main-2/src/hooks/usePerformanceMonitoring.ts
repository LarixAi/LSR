import { useState, useEffect, useCallback } from 'react';

interface PerformanceMetrics {
  navigation: {
    loadTime: number;
    domContentLoaded: number;
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    cumulativeLayoutShift: number;
    firstInputDelay: number;
  };
  resources: Array<{
    name: string;
    duration: number;
    type: string;
    size: number;
  }>;
  memory: {
    used: number;
    total: number;
    limit: number;
  };
  connection: {
    effectiveType: string;
    downlink: number;
    rtt: number;
  };
}

export const usePerformanceMonitoring = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);

  const getNavigationMetrics = useCallback((): PerformanceMetrics['navigation'] => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paint = performance.getEntriesByType('paint');
    
    const firstContentfulPaint = paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0;
    
    return {
      loadTime: navigation.loadEventEnd - navigation.loadEventStart,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      firstContentfulPaint,
      largestContentfulPaint: 0, // Would need to be measured with observer
      cumulativeLayoutShift: 0, // Would need to be measured with observer
      firstInputDelay: 0 // Would need to be measured with observer
    };
  }, []);

  const getResourceMetrics = useCallback((): PerformanceMetrics['resources'] => {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    return resources.slice(0, 20).map(resource => ({
      name: resource.name,
      duration: resource.duration,
      type: resource.initiatorType,
      size: resource.transferSize || resource.encodedBodySize || 0
    }));
  }, []);

  const getMemoryMetrics = useCallback((): PerformanceMetrics['memory'] => {
    // @ts-ignore - performance.memory is not in all browsers
    const memory = performance.memory;
    
    if (memory) {
      return {
        used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024)
      };
    }
    
    return { used: 0, total: 0, limit: 0 };
  }, []);

  const getConnectionMetrics = useCallback((): PerformanceMetrics['connection'] => {
    // @ts-ignore - navigator.connection is not in all browsers
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    if (connection) {
      return {
        effectiveType: connection.effectiveType || 'unknown',
        downlink: connection.downlink || 0,
        rtt: connection.rtt || 0
      };
    }
    
    return {
      effectiveType: 'unknown',
      downlink: 0,
      rtt: 0
    };
  }, []);

  const collectMetrics = useCallback(() => {
    try {
      const performanceMetrics: PerformanceMetrics = {
        navigation: getNavigationMetrics(),
        resources: getResourceMetrics(),
        memory: getMemoryMetrics(),
        connection: getConnectionMetrics()
      };
      
      setMetrics(performanceMetrics);
      
      // Log performance issues
      if (performanceMetrics.navigation.loadTime > 3000) {
        console.warn('Slow page load detected:', performanceMetrics.navigation.loadTime, 'ms');
      }
      
      if (performanceMetrics.memory.used / performanceMetrics.memory.limit > 0.8) {
        console.warn('High memory usage detected:', performanceMetrics.memory.used, 'MB');
      }
      
      return performanceMetrics;
    } catch (error) {
      console.error('Failed to collect performance metrics:', error);
      return null;
    }
  }, [getNavigationMetrics, getResourceMetrics, getMemoryMetrics, getConnectionMetrics]);

  const startMonitoring = useCallback((interval: number = 30000) => {
    setIsMonitoring(true);
    
    // Collect initial metrics
    collectMetrics();
    
    // Set up periodic collection
    const intervalId = setInterval(() => {
      collectMetrics();
    }, interval);
    
    // Set up performance observer for Core Web Vitals
    if ('PerformanceObserver' in window) {
      try {
        // Largest Contentful Paint
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          
          setMetrics(prev => prev ? {
            ...prev,
            navigation: {
              ...prev.navigation,
              largestContentfulPaint: lastEntry.startTime
            }
          } : null);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // First Input Delay
        const fidObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry: any) => {
            setMetrics(prev => prev ? {
              ...prev,
              navigation: {
                ...prev.navigation,
                firstInputDelay: entry.processingStart - entry.startTime
              }
            } : null);
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });

        // Cumulative Layout Shift
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0;
          list.getEntries().forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          
          setMetrics(prev => prev ? {
            ...prev,
            navigation: {
              ...prev.navigation,
              cumulativeLayoutShift: clsValue
            }
          } : null);
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });

      } catch (error) {
        console.error('Failed to set up performance observers:', error);
      }
    }
    
    return () => {
      clearInterval(intervalId);
      setIsMonitoring(false);
    };
  }, [collectMetrics]);

  const getPerformanceScore = useCallback(() => {
    if (!metrics) return 0;
    
    let score = 100;
    
    // Deduct points for slow metrics
    if (metrics.navigation.loadTime > 3000) score -= 20;
    if (metrics.navigation.firstContentfulPaint > 2000) score -= 15;
    if (metrics.navigation.largestContentfulPaint > 2500) score -= 15;
    if (metrics.navigation.firstInputDelay > 100) score -= 10;
    if (metrics.navigation.cumulativeLayoutShift > 0.1) score -= 10;
    
    // Memory usage penalty
    if (metrics.memory.limit > 0) {
      const memoryUsage = metrics.memory.used / metrics.memory.limit;
      if (memoryUsage > 0.8) score -= 15;
      else if (memoryUsage > 0.6) score -= 10;
    }
    
    return Math.max(score, 0);
  }, [metrics]);

  const getPerformanceGrade = useCallback(() => {
    const score = getPerformanceScore();
    
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }, [getPerformanceScore]);

  const getRecommendations = useCallback(() => {
    if (!metrics) return [];
    
    const recommendations: string[] = [];
    
    if (metrics.navigation.loadTime > 3000) {
      recommendations.push('Optimize page load time - consider code splitting and lazy loading');
    }
    
    if (metrics.navigation.firstContentfulPaint > 2000) {
      recommendations.push('Improve First Contentful Paint - optimize critical rendering path');
    }
    
    if (metrics.memory.limit > 0 && metrics.memory.used / metrics.memory.limit > 0.7) {
      recommendations.push('High memory usage detected - review for memory leaks');
    }
    
    const largeResources = metrics.resources.filter(r => r.size > 1024 * 1024); // > 1MB
    if (largeResources.length > 0) {
      recommendations.push(`Optimize large resources: ${largeResources.length} files over 1MB`);
    }
    
    if (metrics.connection.effectiveType === '2g' || metrics.connection.effectiveType === 'slow-2g') {
      recommendations.push('Optimize for slow connections - compress images and minimize payloads');
    }
    
    return recommendations;
  }, [metrics]);

  useEffect(() => {
    // Wait for page load to complete before collecting initial metrics
    if (document.readyState === 'complete') {
      collectMetrics();
    } else {
      window.addEventListener('load', collectMetrics);
      return () => window.removeEventListener('load', collectMetrics);
    }
  }, [collectMetrics]);

  return {
    metrics,
    isMonitoring,
    collectMetrics,
    startMonitoring,
    getPerformanceScore,
    getPerformanceGrade,
    getRecommendations
  };
};