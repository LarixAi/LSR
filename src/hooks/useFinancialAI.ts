import { useState, useCallback } from 'react';
import { 
  financialAgent, 
  CostAnalysis, 
  BudgetOptimization, 
  FinancialForecast, 
  ExpenseManagement, 
  ProfitabilityAnalysis 
} from '@/services/ai/agents/FinancialAgent';
import { TMSContext } from '@/services/ai/AIService';
import { useAuth } from '@/contexts/AuthContext';

interface UseFinancialAIProps {
  context?: TMSContext;
}

export const useFinancialAI = ({ context }: UseFinancialAIProps = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const setContext = useCallback(async (newContext: TMSContext) => {
    try {
      await financialAgent.setContext(newContext);
    } catch (error) {
      console.error('Error setting financial AI context:', error);
      setError('Failed to set context');
    }
  }, []);

  const analyzeCosts = useCallback(async (
    timeRange: { start: string; end: string },
    vehicles: any[],
    expenses: any[]
  ): Promise<CostAnalysis | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (context) {
        await financialAgent.setContext(context);
      }
      
      const result = await financialAgent.analyzeCosts(timeRange, vehicles, expenses);
      return result;
    } catch (error) {
      console.error('Error analyzing costs:', error);
      setError('Failed to analyze costs');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [context]);

  const optimizeBudget = useCallback(async (
    currentBudget: any,
    historicalData: any[],
    constraints?: any
  ): Promise<BudgetOptimization | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (context) {
        await financialAgent.setContext(context);
      }
      
      const result = await financialAgent.optimizeBudget(currentBudget, historicalData, constraints);
      return result;
    } catch (error) {
      console.error('Error optimizing budget:', error);
      setError('Failed to optimize budget');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [context]);

  const generateFinancialForecast = useCallback(async (
    timeHorizon: { start: string; end: string },
    historicalData: any[],
    assumptions?: any
  ): Promise<FinancialForecast | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (context) {
        await financialAgent.setContext(context);
      }
      
      const result = await financialAgent.generateFinancialForecast(timeHorizon, historicalData, assumptions);
      return result;
    } catch (error) {
      console.error('Error generating financial forecast:', error);
      setError('Failed to generate financial forecast');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [context]);

  const manageExpenses = useCallback(async (
    expenses: any[],
    policies?: any
  ): Promise<ExpenseManagement | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (context) {
        await financialAgent.setContext(context);
      }
      
      const result = await financialAgent.manageExpenses(expenses, policies);
      return result;
    } catch (error) {
      console.error('Error managing expenses:', error);
      setError('Failed to manage expenses');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [context]);

  const analyzeProfitability = useCallback(async (
    timeRange: { start: string; end: string },
    financialData: any[]
  ): Promise<ProfitabilityAnalysis | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (context) {
        await financialAgent.setContext(context);
      }
      
      const result = await financialAgent.analyzeProfitability(timeRange, financialData);
      return result;
    } catch (error) {
      console.error('Error analyzing profitability:', error);
      setError('Failed to analyze profitability');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [context]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    setContext,
    analyzeCosts,
    optimizeBudget,
    generateFinancialForecast,
    manageExpenses,
    analyzeProfitability,
    clearError,
    hasError: !!error,
  };
};



