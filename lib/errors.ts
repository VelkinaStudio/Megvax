/**
 * Centralized Error Handling Utility
 * 
 * Provides consistent error handling across the application
 * with proper typing, logging, and user-friendly messages.
 */

/**
 * Custom application error class
 */
export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
    
    // Maintains proper stack trace for where error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}

/**
 * Common error codes
 */
export const ErrorCodes = {
  // Authentication
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  
  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  
  // Resources
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  CONFLICT: 'CONFLICT',
  
  // External APIs
  META_API_ERROR: 'META_API_ERROR',
  STRIPE_API_ERROR: 'STRIPE_API_ERROR',
  EXTERNAL_API_ERROR: 'EXTERNAL_API_ERROR',
  
  // Rate Limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  
  // Server
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR: 'DATABASE_ERROR',
} as const;

/**
 * Toast notification function type
 */
type ToastFn = {
  success: (message: string, options?: unknown) => void;
  error: (message: string, options?: unknown) => void;
  info: (message: string, options?: unknown) => void;
  warning: (message: string, options?: unknown) => void;
};

/**
 * Handle API errors and show appropriate toast messages
 */
export function handleApiError(error: unknown, toast: ToastFn): void {
  // Log error to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('API Error:', error);
  }
  
  // Handle AppError instances
  if (error instanceof AppError) {
    toast.error(error.message);
    return;
  }
  
  // Handle fetch errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    toast.error('Connection error. Please check your internet connection.');
    return;
  }
  
  // Handle standard Error instances
  if (error instanceof Error) {
    toast.error(error.message || 'An unexpected error occurred');
    return;
  }
  
  // Handle unknown errors
  toast.error('An unexpected error occurred. Please try again.');
}

/**
 * Parse API error response
 */
export async function parseApiError(response: Response): Promise<AppError> {
  let errorData: { error?: { code?: string; message?: string; details?: unknown } } = {};
  
  try {
    errorData = await response.json();
  } catch {
    // If response is not JSON, use status text
    return new AppError(
      'UNKNOWN_ERROR',
      response.statusText || 'An error occurred',
      response.status
    );
  }
  
  const error = errorData.error;
  
  return new AppError(
    error?.code || 'UNKNOWN_ERROR',
    error?.message || 'An error occurred',
    response.status,
    error?.details
  );
}

/**
 * Retry failed API calls with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | undefined;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Don't retry on client errors (4xx)
      if (error instanceof AppError && error.statusCode >= 400 && error.statusCode < 500) {
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      if (i < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new Error('Max retries exceeded');
}

/**
 * Validate required environment variables
 */
export function validateEnvVars(requiredVars: string[]): void {
  const missing: string[] = [];
  
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }
  
  if (missing.length > 0) {
    throw new AppError(
      'MISSING_ENV_VARS',
      `Missing required environment variables: ${missing.join(', ')}`,
      500,
      { missing }
    );
  }
}

/**
 * Safe JSON parse with error handling
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

/**
 * Assert that a value is defined (not null or undefined)
 */
export function assertDefined<T>(
  value: T | null | undefined,
  message: string = 'Value is required'
): asserts value is T {
  if (value === null || value === undefined) {
    throw new AppError('ASSERTION_ERROR', message, 400);
  }
}

/**
 * Create a user-friendly error message from validation errors
 */
export function formatValidationErrors(errors: Record<string, string[]>): string {
  const messages = Object.entries(errors)
    .map(([field, fieldErrors]) => `${field}: ${fieldErrors.join(', ')}`)
    .join('; ');
  
  return messages || 'Validation error';
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  return (
    error instanceof TypeError &&
    (error.message.includes('fetch') || error.message.includes('network'))
  );
}

/**
 * Check if error is an authentication error
 */
export function isAuthError(error: unknown): boolean {
  return (
    error instanceof AppError &&
    (error.statusCode === 401 || error.code === ErrorCodes.UNAUTHORIZED)
  );
}

/**
 * Log error to external service (e.g., Sentry)
 */
export function logError(error: unknown, context?: Record<string, unknown>): void {
  // In development, just log to console
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', error, 'Context:', context);
    return;
  }
  
  // In production, send to error tracking service
  // Example: Sentry.captureException(error, { extra: context });
  
  // For now, just log to console
  console.error('Error:', error, 'Context:', context);
}

/**
 * Create a standardized error response for API routes
 */
export function createErrorResponse(error: unknown): {
  status: number;
  body: { error: { code: string; message: string; details?: unknown } };
} {
  if (error instanceof AppError) {
    return {
      status: error.statusCode,
      body: {
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      },
    };
  }
  
  if (error instanceof Error) {
    return {
      status: 500,
      body: {
        error: {
          code: ErrorCodes.INTERNAL_ERROR,
          message: process.env.NODE_ENV === 'development' 
            ? error.message 
            : 'An error occurred',
        },
      },
    };
  }
  
  return {
    status: 500,
    body: {
      error: {
        code: ErrorCodes.INTERNAL_ERROR,
        message: 'An unexpected error occurred',
      },
    },
  };
}
