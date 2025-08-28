import { useState, useCallback } from 'react';
import { fleetManagementAgent, RouteOptimization, DriverAssignment, MaintenancePrediction } from '@/services/ai/agents/FleetManagementAgent';
import { TMSContext } from '@/services/ai/AIService';
import { useAuth } from '@/contexts/AuthContext';

interface UseFleetManagementAIProps {
  context?: TMSContext;
}

export const useFleetManagementAI = ({ context }: UseFleetManagementAIProps = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const setContext = useCallback(async (newContext: TMSContext) => {
    try {
      await fleetManagementAgent.setContext(newContext);
    } catch (err) {
      setError('Failed to set AI context');
      console.error('Context setting error:', err);
    }
  }, []);

  const optimizeRoutes = useCallback(async (
    vehicles: any[],
    jobs: any[],
    constraints?: {
      maxDrivingTime?: number;
      fuelEfficiency?: boolean;
      driverPreferences?: any;
    }
  ): Promise<RouteOptimization | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Set context if provided
      if (context) {
        await fleetManagementAgent.setContext(context);
      }

      const result = await fleetManagementAgent.optimizeRoutes(vehicles, jobs, constraints);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to optimize routes';
      setError(errorMessage);
      console.error('Route optimization error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [context]);

  const assignDrivers = useCallback(async (
    vehicles: any[],
    drivers: any[],
    jobs: any[]
  ): Promise<DriverAssignment[] | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Set context if provided
      if (context) {
        await fleetManagementAgent.setContext(context);
      }

      const result = await fleetManagementAgent.assignDrivers(vehicles, drivers, jobs);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to assign drivers';
      setError(errorMessage);
      console.error('Driver assignment error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [context]);

  const predictMaintenance = useCallback(async (
    vehicle: any
  ): Promise<MaintenancePrediction | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Set context if provided
      if (context) {
        await fleetManagementAgent.setContext(context);
      }

      const result = await fleetManagementAgent.predictMaintenance(vehicle);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to predict maintenance';
      setError(errorMessage);
      console.error('Maintenance prediction error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [context]);

  const analyzeFuelEfficiency = useCallback(async (
    vehicles: any[],
    timeRange: { start: string; end: string }
  ): Promise<any | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Set context if provided
      if (context) {
        await fleetManagementAgent.setContext(context);
      }

      const result = await fleetManagementAgent.analyzeFuelEfficiency(vehicles, timeRange);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze fuel efficiency';
      setError(errorMessage);
      console.error('Fuel efficiency analysis error:', err);
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
    optimizeRoutes,
    assignDrivers,
    predictMaintenance,
    analyzeFuelEfficiency,
    clearError,
    
    // Utility
    hasError: !!error,
  };
};



