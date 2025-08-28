import { useState, useCallback } from 'react';
import { 
  operationsAgent, 
  JobSchedule, 
  ResourceAllocation, 
  PerformanceMetrics, 
  OperationalAnalytics 
} from '@/services/ai/agents/OperationsAgent';
import { TMSContext } from '@/services/ai/AIService';
import { useAuth } from '@/contexts/AuthContext';

interface UseOperationsAIProps {
  context?: TMSContext;
}

export const useOperationsAI = ({ context }: UseOperationsAIProps = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const setContext = useCallback(async (newContext: TMSContext) => {
    try {
      await operationsAgent.setContext(newContext);
    } catch (err) {
      setError('Failed to set AI context');
      console.error('Context setting error:', err);
    }
  }, []);

  const optimizeJobSchedule = useCallback(async (
    jobs: any[],
    vehicles: any[],
    drivers: any[],
    constraints?: {
      maxWorkingHours?: number;
      vehicleCapacity?: boolean;
      driverPreferences?: any;
      timeWindows?: any[];
    }
  ): Promise<JobSchedule[] | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Set context if provided
      if (context) {
        await operationsAgent.setContext(context);
      }

      const result = await operationsAgent.optimizeJobSchedule(jobs, vehicles, drivers, constraints);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to optimize job schedule';
      setError(errorMessage);
      console.error('Job schedule optimization error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [context]);

  const allocateResources = useCallback(async (
    resources: any[],
    jobs: any[],
    timeRange: { start: string; end: string }
  ): Promise<ResourceAllocation[] | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Set context if provided
      if (context) {
        await operationsAgent.setContext(context);
      }

      const result = await operationsAgent.allocateResources(resources, jobs, timeRange);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to allocate resources';
      setError(errorMessage);
      console.error('Resource allocation error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [context]);

  const analyzePerformance = useCallback(async (
    timeRange: { start: string; end: string },
    jobs: any[],
    vehicles: any[],
    drivers: any[]
  ): Promise<PerformanceMetrics | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Set context if provided
      if (context) {
        await operationsAgent.setContext(context);
      }

      const result = await operationsAgent.analyzePerformance(timeRange, jobs, vehicles, drivers);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze performance';
      setError(errorMessage);
      console.error('Performance analysis error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [context]);

  const generateOperationalAnalytics = useCallback(async (
    analysisType: 'efficiency' | 'cost' | 'safety' | 'compliance' | 'predictive',
    timeRange: { start: string; end: string },
    data: any[]
  ): Promise<OperationalAnalytics | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Set context if provided
      if (context) {
        await operationsAgent.setContext(context);
      }

      const result = await operationsAgent.generateOperationalAnalytics(analysisType, timeRange, data);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate operational analytics';
      setError(errorMessage);
      console.error('Operational analytics error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [context]);

  const predictDemand = useCallback(async (
    historicalData: any[],
    timeHorizon: { start: string; end: string },
    factors?: string[]
  ): Promise<any | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Set context if provided
      if (context) {
        await operationsAgent.setContext(context);
      }

      const result = await operationsAgent.predictDemand(historicalData, timeHorizon, factors);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to predict demand';
      setError(errorMessage);
      console.error('Demand prediction error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [context]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    isLoading,
    error,
    
    // Actions
    setContext,
    optimizeJobSchedule,
    allocateResources,
    analyzePerformance,
    generateOperationalAnalytics,
    predictDemand,
    clearError,
    
    // Utility
    hasError: !!error,
  };
};



