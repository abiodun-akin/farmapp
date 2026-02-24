/**
 * API error handling utilities for frontend
 * Standardizes error extraction and message formatting
 */

/**
 * Error codes mapping for better error handling
 */
const ErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  DUPLICATE_ERROR: 'DUPLICATE_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  JWT_ERROR: 'JWT_ERROR',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  NETWORK_ERROR: 'NETWORK_ERROR',
};

/**
 * Extract error information from API response or error object
 */
export const getApiError = (error) => {
  // Network/timeout error
  if (!error.response) {
    return {
      message: error.message || 'Network error. Please check your connection.',
      code: ErrorCodes.NETWORK_ERROR,
      field: null,
      status: null,
    };
  }

  const { data, status } = error.response;

  // Validation error with field info
  if (data?.field) {
    return {
      message: data.error || 'Validation failed',
      code: data.code || ErrorCodes.VALIDATION_ERROR,
      field: data.field,
      status,
    };
  }

  // Standard API error
  return {
    message: data?.error || error.message || 'An error occurred',
    code: data?.code || 'UNKNOWN_ERROR',
    field: null,
    status,
  };
};

/**
 * Format error message for display to user
 */
export const formatErrorMessage = (error) => {
  const errorInfo = getApiError(error);

  // Token expired - user should re-login
  if (errorInfo.code === ErrorCodes.TOKEN_EXPIRED) {
    return 'Your session has expired. Please login again.';
  }

  // Authorization denied
  if (errorInfo.code === ErrorCodes.AUTHORIZATION_ERROR) {
    return 'You do not have permission to perform this action.';
  }

  // Not found
  if (errorInfo.code === ErrorCodes.NOT_FOUND) {
    return 'The requested resource was not found.';
  }

  // Duplicate
  if (errorInfo.code === ErrorCodes.DUPLICATE_ERROR) {
    return errorInfo.message;
  }

  // Return the error message as-is
  return errorInfo.message;
};

/**
 * Check if error is authentication-related
 */
export const isAuthError = (error) => {
  const errorInfo = getApiError(error);
  return [
    ErrorCodes.AUTH_ERROR,
    ErrorCodes.JWT_ERROR,
    ErrorCodes.TOKEN_EXPIRED,
  ].includes(errorInfo.code);
};

/**
 * Check if error is validation-related
 */
export const isValidationError = (error) => {
  const errorInfo = getApiError(error);
  return errorInfo.code === ErrorCodes.VALIDATION_ERROR;
};

/**
 * Get field-specific error message
 */
export const getFieldError = (error, fieldName) => {
  const errorInfo = getApiError(error);
  if (errorInfo.field === fieldName) {
    return errorInfo.message;
  }
  return null;
};

export default {
  ErrorCodes,
  getApiError,
  formatErrorMessage,
  isAuthError,
  isValidationError,
  getFieldError,
};
