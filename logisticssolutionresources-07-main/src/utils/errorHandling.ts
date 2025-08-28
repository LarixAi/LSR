// Standardized error handling utilities

export class AppError extends Error {
  constructor(
    public message: string,
    public code: string,
    public statusCode: number = 400,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// Common error types
export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', 400, details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 'AUTHENTICATION_ERROR', 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 'AUTHORIZATION_ERROR', 403);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 'NOT_FOUND', 404);
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 'RATE_LIMIT_ERROR', 429);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'DATABASE_ERROR', 500, details);
  }
}

// Error response helper
export const createErrorResponse = (error: AppError | Error): Response => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Content-Type': 'application/json'
  };

  if (error instanceof AppError) {
    return new Response(
      JSON.stringify({
        error: error.message,
        code: error.code,
        details: error.details
      }),
      {
        status: error.statusCode,
        headers: corsHeaders
      }
    );
  }

  // Generic error
  console.error('Unexpected error:', error);
  return new Response(
    JSON.stringify({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    }),
    {
      status: 500,
      headers: corsHeaders
    }
  );
};

// Async operation wrapper with error handling
export const withErrorHandling = async <T>(
  operation: () => Promise<T>,
  context: string = 'operation'
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    console.error(`Error in ${context}:`, error);
    
    if (error instanceof AppError) {
      throw error;
    }
    
    // Convert database errors to AppErrors
    if (error && typeof error === 'object' && 'code' in error) {
      const dbError = error as any;
      if (dbError.code === '23505') {
        throw new ValidationError('Duplicate entry - record already exists');
      }
      if (dbError.code === '23503') {
        throw new ValidationError('Invalid reference - related record not found');
      }
      if (dbError.code === '42501') {
        throw new AuthorizationError('Database permission denied');
      }
    }
    
    throw new AppError(`${context} failed`, 'OPERATION_FAILED', 500);
  }
};

// Success response helper
export const createSuccessResponse = (data: any, status: number = 200): Response => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Content-Type': 'application/json'
  };

  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: corsHeaders
    }
  );
};

// CORS preflight response
export const createCorsResponse = (): Response => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  };

  return new Response(null, {
    status: 200,
    headers: corsHeaders
  });
};