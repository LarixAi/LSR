import { useState, useCallback } from 'react';
import { 
  enterpriseSearchAgent, 
  SearchQuery, 
  SearchResult, 
  KnowledgeBaseEntry, 
  SearchAnalytics 
} from '@/services/ai/agents/EnterpriseSearchAgent';
import { TMSContext } from '@/services/ai/AIService';
import { useAuth } from '@/contexts/AuthContext';

interface UseEnterpriseSearchAIProps {
  context?: TMSContext;
}

export const useEnterpriseSearchAI = ({ context }: UseEnterpriseSearchAIProps = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const setContext = useCallback(async (newContext: TMSContext) => {
    try {
      await enterpriseSearchAgent.setContext(newContext);
    } catch (err) {
      setError('Failed to set AI context');
      console.error('Context setting error:', err);
    }
  }, []);

  const search = useCallback(async (
    searchQuery: SearchQuery
  ): Promise<SearchResult[] | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Set context if provided
      if (context) {
        await enterpriseSearchAgent.setContext(context);
      }

      const result = await enterpriseSearchAgent.search(searchQuery);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to perform search';
      setError(errorMessage);
      console.error('Search error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [context]);

  const indexDocument = useCallback(async (
    document: {
      id: string;
      title: string;
      content: string;
      entityType: string;
      entityId: string;
      metadata?: Record<string, any>;
    }
  ): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Set context if provided
      if (context) {
        await enterpriseSearchAgent.setContext(context);
      }

      await enterpriseSearchAgent.indexDocument(document);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to index document';
      setError(errorMessage);
      console.error('Document indexing error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [context]);

  const createKnowledgeBaseEntry = useCallback(async (
    entry: {
      title: string;
      content: string;
      category: KnowledgeBaseEntry['category'];
      tags: string[];
      author: string;
    }
  ): Promise<KnowledgeBaseEntry | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Set context if provided
      if (context) {
        await enterpriseSearchAgent.setContext(context);
      }

      const result = await enterpriseSearchAgent.createKnowledgeBaseEntry(entry);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create knowledge base entry';
      setError(errorMessage);
      console.error('Knowledge base creation error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [context]);

  const updateKnowledgeBaseEntry = useCallback(async (
    entryId: string,
    updates: Partial<KnowledgeBaseEntry>
  ): Promise<KnowledgeBaseEntry | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Set context if provided
      if (context) {
        await enterpriseSearchAgent.setContext(context);
      }

      const result = await enterpriseSearchAgent.updateKnowledgeBaseEntry(entryId, updates);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update knowledge base entry';
      setError(errorMessage);
      console.error('Knowledge base update error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [context]);

  const getSearchAnalytics = useCallback(async (
    timeRange: { start: string; end: string }
  ): Promise<SearchAnalytics | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Set context if provided
      if (context) {
        await enterpriseSearchAgent.setContext(context);
      }

      const result = await enterpriseSearchAgent.getSearchAnalytics(timeRange);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get search analytics';
      setError(errorMessage);
      console.error('Search analytics error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [context]);

  const suggestRelatedContent = useCallback(async (
    content: string,
    entityType: string
  ): Promise<SearchResult[] | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Set context if provided
      if (context) {
        await enterpriseSearchAgent.setContext(context);
      }

      const result = await enterpriseSearchAgent.suggestRelatedContent(content, entityType);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to suggest related content';
      setError(errorMessage);
      console.error('Related content suggestion error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [context]);

  const generateSearchInsights = useCallback(async (
    searchHistory: Array<{ query: string; results: number; timestamp: string }>
  ): Promise<any | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Set context if provided
      if (context) {
        await enterpriseSearchAgent.setContext(context);
      }

      const result = await enterpriseSearchAgent.generateSearchInsights(searchHistory);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate search insights';
      setError(errorMessage);
      console.error('Search insights generation error:', err);
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
    search,
    indexDocument,
    createKnowledgeBaseEntry,
    updateKnowledgeBaseEntry,
    getSearchAnalytics,
    suggestRelatedContent,
    generateSearchInsights,
    clearError,
    
    // Utility
    hasError: !!error,
  };
};


