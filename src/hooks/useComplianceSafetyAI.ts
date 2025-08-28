import { useState, useCallback } from 'react';
import { 
  complianceSafetyAgent, 
  ComplianceCheck, 
  SafetyIncident, 
  DVSACompliance, 
  RegulatoryUpdate 
} from '@/services/ai/agents/ComplianceSafetyAgent';
import { TMSContext } from '@/services/ai/AIService';
import { useAuth } from '@/contexts/AuthContext';

interface UseComplianceSafetyAIProps {
  context?: TMSContext;
}

export const useComplianceSafetyAI = ({ context }: UseComplianceSafetyAIProps = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const setContext = useCallback(async (newContext: TMSContext) => {
    try {
      await complianceSafetyAgent.setContext(newContext);
    } catch (err) {
      setError('Failed to set AI context');
      console.error('Context setting error:', err);
    }
  }, []);

  const checkCompliance = useCallback(async (
    vehicles: any[],
    drivers: any[],
    inspections: any[]
  ): Promise<ComplianceCheck[] | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Set context if provided
      if (context) {
        await complianceSafetyAgent.setContext(context);
      }

      const result = await complianceSafetyAgent.checkCompliance(vehicles, drivers, inspections);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check compliance';
      setError(errorMessage);
      console.error('Compliance check error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [context]);

  const analyzeSafetyIncident = useCallback(async (
    incident: any,
    historicalIncidents: any[]
  ): Promise<SafetyIncident | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Set context if provided
      if (context) {
        await complianceSafetyAgent.setContext(context);
      }

      const result = await complianceSafetyAgent.analyzeSafetyIncident(incident, historicalIncidents);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze safety incident';
      setError(errorMessage);
      console.error('Safety incident analysis error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [context]);

  const checkDVSACompliance = useCallback(async (
    operatorData: any,
    vehicles: any[],
    drivers: any[]
  ): Promise<DVSACompliance | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Set context if provided
      if (context) {
        await complianceSafetyAgent.setContext(context);
      }

      const result = await complianceSafetyAgent.checkDVSACompliance(operatorData, vehicles, drivers);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check DVSA compliance';
      setError(errorMessage);
      console.error('DVSA compliance check error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [context]);

  const getRegulatoryUpdates = useCallback(async (
    currentRegulations: any[],
    industry: string = 'transport'
  ): Promise<RegulatoryUpdate[] | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Set context if provided
      if (context) {
        await complianceSafetyAgent.setContext(context);
      }

      const result = await complianceSafetyAgent.getRegulatoryUpdates(currentRegulations, industry);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get regulatory updates';
      setError(errorMessage);
      console.error('Regulatory updates error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [context]);

  const generateSafetyReport = useCallback(async (
    timeRange: { start: string; end: string },
    vehicles: any[],
    incidents: any[]
  ): Promise<any | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Set context if provided
      if (context) {
        await complianceSafetyAgent.setContext(context);
      }

      const result = await complianceSafetyAgent.generateSafetyReport(timeRange, vehicles, incidents);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate safety report';
      setError(errorMessage);
      console.error('Safety report generation error:', err);
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
    checkCompliance,
    analyzeSafetyIncident,
    checkDVSACompliance,
    getRegulatoryUpdates,
    generateSafetyReport,
    clearError,
    
    // Utility
    hasError: !!error,
  };
};



