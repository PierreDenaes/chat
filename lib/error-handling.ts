// Error handling utilities for meal photo upload and AI analysis

export interface AppError {
  type: 'network' | 'auth' | 'rate_limit' | 'quota' | 'validation' | 'ai_service' | 'unknown';
  message: string;
  userMessage: string;
  originalError?: Error;
  statusCode?: number;
}

export function createAppError(error: unknown, context?: string): AppError {
  // Handle Response errors (fetch failures)
  if (error instanceof Response) {
    const statusCode = error.status;
    
    switch (statusCode) {
      case 401:
        return {
          type: 'auth',
          message: `Authentication failed${context ? ` in ${context}` : ''}`,
          userMessage: 'Please log in again to continue.',
          statusCode
        };
      case 429:
        return {
          type: 'rate_limit',
          message: `Rate limit exceeded${context ? ` in ${context}` : ''}`,
          userMessage: 'Too many requests. Please wait a moment and try again.',
          statusCode
        };
      case 503:
        return {
          type: 'ai_service',
          message: `AI service unavailable${context ? ` in ${context}` : ''}`,
          userMessage: 'AI service is temporarily busy. Please try again in a few moments.',
          statusCode
        };
      default:
        return {
          type: 'network',
          message: `HTTP ${statusCode} error${context ? ` in ${context}` : ''}`,
          userMessage: 'Network error occurred. Please check your connection and try again.',
          statusCode
        };
    }
  }

  // Handle Error objects
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    // Rate limiting errors
    if (message.includes('rate limit') || message.includes('too many requests')) {
      return {
        type: 'rate_limit',
        message: error.message,
        userMessage: 'Too many requests. Please wait a moment and try again.',
        originalError: error
      };
    }
    
    // Quota errors
    if (message.includes('quota') || message.includes('billing') || message.includes('credits')) {
      return {
        type: 'quota',
        message: error.message,
        userMessage: 'AI service quota exceeded. Please contact support or try again later.',
        originalError: error
      };
    }
    
    // Authentication errors
    if (message.includes('auth') || message.includes('token') || message.includes('unauthorized')) {
      return {
        type: 'auth',
        message: error.message,
        userMessage: 'Authentication expired. Please log in again.',
        originalError: error
      };
    }
    
    // Network/connectivity errors
    if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
      return {
        type: 'network',
        message: error.message,
        userMessage: 'Network connection failed. Please check your internet and try again.',
        originalError: error
      };
    }
    
    // Validation errors
    if (message.includes('validation') || message.includes('invalid')) {
      return {
        type: 'validation',
        message: error.message,
        userMessage: 'Invalid data provided. Please check your input and try again.',
        originalError: error
      };
    }
    
    // AI service specific errors
    if (message.includes('ai') || message.includes('analysis') || message.includes('vision')) {
      return {
        type: 'ai_service',
        message: error.message,
        userMessage: 'AI analysis failed. Please try capturing a clearer photo.',
        originalError: error
      };
    }

    // Generic error
    return {
      type: 'unknown',
      message: error.message,
      userMessage: 'An unexpected error occurred. Please try again.',
      originalError: error
    };
  }

  // Handle string errors
  if (typeof error === 'string') {
    return {
      type: 'unknown',
      message: error,
      userMessage: 'An error occurred. Please try again.'
    };
  }

  // Handle unknown error types
  return {
    type: 'unknown',
    message: `Unknown error${context ? ` in ${context}` : ''}: ${String(error)}`,
    userMessage: 'An unexpected error occurred. Please try again.'
  };
}

export function logError(error: AppError, context?: string) {
  const logData = {
    type: error.type,
    message: error.message,
    userMessage: error.userMessage,
    context,
    statusCode: error.statusCode,
    timestamp: new Date().toISOString(),
    originalError: error.originalError?.stack || error.originalError?.message
  };
  
  console.error('App Error:', logData);
}

export async function handleApiCall<T>(
  apiCall: () => Promise<Response>,
  context: string
): Promise<T> {
  try {
    const response = await apiCall();
    
    if (!response.ok) {
      const error = createAppError(response, context);
      logError(error, context);
      throw error;
    }
    
    const data = await response.json();
    
    // Check for API-level errors in the response body
    if (data.success === false) {
      const error = createAppError(new Error(data.error || 'API request failed'), context);
      logError(error, context);
      throw error;
    }
    
    return data;
    
  } catch (error) {
    // If it's already an AppError, re-throw it
    if (error && typeof error === 'object' && 'type' in error) {
      throw error;
    }
    
    // Otherwise, convert it to an AppError
    const appError = createAppError(error, context);
    logError(appError, context);
    throw appError;
  }
}