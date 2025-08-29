
export type QueryFilter = Record<string, any>;

export class QueryBuilder {
  private filters: QueryFilter = {};
  private sortField?: string;
  private sortOrder?: 'asc' | 'desc';
  private limitValue?: number;

  filter(field: string, value: any) {
    this.filters[field] = value;
    return this;
  }

  sort(field: string, order: 'asc' | 'desc' = 'asc') {
    this.sortField = field;
    this.sortOrder = order;
    return this;
  }

  limit(count: number) {
    this.limitValue = count;
    return this;
  }

  build() {
    return {
      filters: this.filters,
      sort: this.sortField ? { field: this.sortField, order: this.sortOrder } : undefined,
      limit: this.limitValue
    };
  }
}

export const createQuery = () => new QueryBuilder();

// Simplified type for database operations
export type DatabaseOperation = {
  filters?: QueryFilter;
  sort?: { field: string; order: 'asc' | 'desc' };
  limit?: number;
};

// Helper function for building select queries
export const buildSelectQuery = (operation: DatabaseOperation) => {
  let query = '';
  
  if (operation.filters) {
    const filterParts = Object.entries(operation.filters)
      .map(([key, value]) => `${key}.eq.${value}`)
      .join('&');
    if (filterParts) {
      query += filterParts;
    }
  }
  
  if (operation.sort) {
    query += query ? '&' : '';
    query += `order=${operation.sort.field}.${operation.sort.order}`;
  }
  
  if (operation.limit) {
    query += query ? '&' : '';
    query += `limit=${operation.limit}`;
  }
  
  return query;
};
