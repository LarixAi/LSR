import { useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface SearchFilter {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike' | 'in';
  value: any;
}

interface SearchOptions {
  table: string;
  columns?: string;
  filters?: SearchFilter[];
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
  textSearch?: {
    query: string;
    columns: string[];
  };
}

export const useAdvancedSearch = (options: SearchOptions) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [additionalFilters, setAdditionalFilters] = useState<SearchFilter[]>([]);

  const finalFilters = useMemo(() => {
    return [...(options.filters || []), ...additionalFilters];
  }, [options.filters, additionalFilters]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['advanced-search', options.table, searchQuery, finalFilters, options.orderBy],
    queryFn: async () => {
      let query = supabase
        .from(options.table as any)
        .select(options.columns || '*');

      // Apply filters
      finalFilters.forEach(filter => {
        switch (filter.operator) {
          case 'eq':
            query = query.eq(filter.field, filter.value);
            break;
          case 'neq':
            query = query.neq(filter.field, filter.value);
            break;
          case 'gt':
            query = query.gt(filter.field, filter.value);
            break;
          case 'gte':
            query = query.gte(filter.field, filter.value);
            break;
          case 'lt':
            query = query.lt(filter.field, filter.value);
            break;
          case 'lte':
            query = query.lte(filter.field, filter.value);
            break;
          case 'like':
            query = query.like(filter.field, filter.value);
            break;
          case 'ilike':
            query = query.ilike(filter.field, filter.value);
            break;
          case 'in':
            query = query.in(filter.field, filter.value);
            break;
        }
      });

      // Apply text search
      if (searchQuery && options.textSearch) {
        const searchColumns = options.textSearch.columns;
        const searchConditions = searchColumns.map(col => 
          `${col}.ilike.%${searchQuery}%`
        ).join(',');
        query = query.or(searchConditions);
      }

      // Apply ordering
      if (options.orderBy) {
        query = query.order(options.orderBy.column, { 
          ascending: options.orderBy.ascending !== false 
        });
      }

      // Apply limit
      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const addFilter = (filter: SearchFilter) => {
    setAdditionalFilters(prev => [...prev, filter]);
  };

  const removeFilter = (index: number) => {
    setAdditionalFilters(prev => prev.filter((_, i) => i !== index));
  };

  const clearFilters = () => {
    setAdditionalFilters([]);
    setSearchQuery('');
  };

  const updateFilter = (index: number, filter: SearchFilter) => {
    setAdditionalFilters(prev => 
      prev.map((f, i) => i === index ? filter : f)
    );
  };

  return {
    data,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    filters: finalFilters,
    addFilter,
    removeFilter,
    clearFilters,
    updateFilter,
    refetch
  };
};

// Helper hook for fuzzy search
export const useFuzzySearch = <T>(
  items: T[], 
  searchQuery: string, 
  searchFields: (keyof T)[]
) => {
  return useMemo(() => {
    if (!searchQuery) return items;

    const query = searchQuery.toLowerCase();
    
    return items.filter(item => {
      return searchFields.some(field => {
        const value = item[field];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(query);
        }
        if (typeof value === 'number') {
          return value.toString().includes(query);
        }
        return false;
      });
    });
  }, [items, searchQuery, searchFields]);
};

// Advanced search with scoring
export const useSearchWithScoring = <T>(
  items: T[],
  searchQuery: string,
  searchConfig: {
    field: keyof T;
    weight: number;
  }[]
) => {
  return useMemo(() => {
    if (!searchQuery) return items;

    const query = searchQuery.toLowerCase();
    
    const scoredItems = items.map(item => {
      let score = 0;
      
      searchConfig.forEach(({ field, weight }) => {
        const value = item[field];
        if (typeof value === 'string') {
          const text = value.toLowerCase();
          if (text.includes(query)) {
            // Exact match gets higher score
            if (text === query) {
              score += weight * 2;
            } else if (text.startsWith(query)) {
              score += weight * 1.5;
            } else {
              score += weight;
            }
          }
        }
      });
      
      return { item, score };
    });

    return scoredItems
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ item }) => item);
  }, [items, searchQuery, searchConfig]);
};