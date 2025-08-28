/**
 * Performance monitoring utilities
 * Helps track component render times and identify bottlenecks
 */

interface PerformanceMetric {
  name: string;
  startTime: number;
  duration?: number;
  timestamp: string;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private isDevelopment = import.meta.env.DEV;

  startTimer(name: string): void {
    if (!this.isDevelopment) return;

    this.metrics.set(name, {
      name,
      startTime: performance.now(),
      timestamp: new Date().toISOString(),
    });
  }

  endTimer(name: string): number | null {
    if (!this.isDevelopment) return null;

    const metric = this.metrics.get(name);
    if (!metric) {
      console.warn(`Performance timer '${name}' was never started`);
      return null;
    }

    const duration = performance.now() - metric.startTime;
    metric.duration = duration;

    // Log slow operations (>100ms)
    if (duration > 100) {
      console.warn(`Slow operation detected: ${name} took ${duration.toFixed(2)}ms`);
    }

    this.metrics.delete(name);
    return duration;
  }

  measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    this.startTimer(name);
    return fn().finally(() => {
      this.endTimer(name);
    });
  }

  measureSync<T>(name: string, fn: () => T): T {
    this.startTimer(name);
    try {
      return fn();
    } finally {
      this.endTimer(name);
    }
  }

  getMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values());
  }
}

export const performanceMonitor = new PerformanceMonitor();

// React hook for measuring component render times
export const usePerformanceTimer = (componentName: string) => {
  const startTime = performance.now();
  
  return () => {
    const renderTime = performance.now() - startTime;
    if (renderTime > 16) { // Flag renders taking longer than 16ms (60fps)
      console.warn(`${componentName} render took ${renderTime.toFixed(2)}ms`);
    }
  };
};

export default PerformanceMonitor;