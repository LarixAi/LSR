import { useState, useCallback } from 'react';
import { 
  autonomousOperationsAgent, 
  AutonomousDecision, 
  PredictiveAnalytics, 
  AutomatedWorkflow, 
  FleetOptimization, 
  RealTimeMonitoring 
} from '@/services/ai/agents/AutonomousOperationsAgent';
import { TMSContext } from '@/services/ai/AIService';
import { useAuth } from '@/contexts/AuthContext';

interface UseAutonomousOperationsAIProps {
  context?: TMSContext;
}

export const useAutonomousOperationsAI = ({ context }: UseAutonomousOperationsAIProps = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const setContext = useCallback(async (newContext: TMSContext) => {
    try {
      await autonomousOperationsAgent.setContext(newContext);
    } catch (error) {
      console.error('Error setting autonomous operations AI context:', error);
      setError('Failed to set context');
    }
  }, []);

  const makeAutonomousDecision = useCallback(async (
    scenario: any,
    constraints?: any
  ): Promise<AutonomousDecision | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (context) {
        await autonomousOperationsAgent.setContext(context);
      }
      
      const result = await autonomousOperationsAgent.makeAutonomousDecision(scenario, constraints);
      return result;
    } catch (error) {
      console.error('Error making autonomous decision:', error);
      setError('Failed to make autonomous decision');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [context]);

  const generatePredictiveAnalytics = useCallback(async (
    timeRange: { start: string; end: string },
    metrics: string[]
  ): Promise<PredictiveAnalytics | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (context) {
        await autonomousOperationsAgent.setContext(context);
      }
      
      const result = await autonomousOperationsAgent.generatePredictiveAnalytics(timeRange, metrics);
      return result;
    } catch (error) {
      console.error('Error generating predictive analytics:', error);
      setError('Failed to generate predictive analytics');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [context]);

  const createAutomatedWorkflow = useCallback(async (
    workflow: Omit<AutomatedWorkflow, 'id' | 'status' | 'lastExecuted' | 'executionCount' | 'successRate'>
  ): Promise<AutomatedWorkflow | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (context) {
        await autonomousOperationsAgent.setContext(context);
      }
      
      const result = await autonomousOperationsAgent.createAutomatedWorkflow(workflow);
      return result;
    } catch (error) {
      console.error('Error creating automated workflow:', error);
      setError('Failed to create automated workflow');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [context]);

  const optimizeFleet = useCallback(async (
    currentState: any,
    objectives: string[]
  ): Promise<FleetOptimization | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (context) {
        await autonomousOperationsAgent.setContext(context);
      }
      
      const result = await autonomousOperationsAgent.optimizeFleet(currentState, objectives);
      return result;
    } catch (error) {
      console.error('Error optimizing fleet:', error);
      setError('Failed to optimize fleet');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [context]);

  const monitorRealTime = useCallback(async (
    currentData: any
  ): Promise<RealTimeMonitoring | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (context) {
        await autonomousOperationsAgent.setContext(context);
      }
      
      const result = await autonomousOperationsAgent.monitorRealTime(currentData);
      return result;
    } catch (error) {
      console.error('Error monitoring real-time data:', error);
      setError('Failed to monitor real-time data');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [context]);

  const executeWorkflow = useCallback(async (
    workflowId: string,
    data: any
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await autonomousOperationsAgent.executeWorkflow(workflowId, data);
      return result;
    } catch (error) {
      console.error('Error executing workflow:', error);
      setError('Failed to execute workflow');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    setContext,
    makeAutonomousDecision,
    generatePredictiveAnalytics,
    createAutomatedWorkflow,
    optimizeFleet,
    monitorRealTime,
    executeWorkflow,
    clearError,
    hasError: !!error,
  };
};


