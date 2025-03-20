import { ServiceResponse } from '../interfaces/service-response.interface';

/**
 * Creates a success response
 * @param message Optional success message
 * @param data Optional data to include in the response
 * @returns A standardized success response
 */
export function successResponse<T>(
  message?: string,
  data?: T,
): ServiceResponse<T> {
  return {
    success: true,
    ...(message && { message }),
    ...(data !== undefined && { data }),
  };
}

/**
 * Creates an error response
 * @param message Error message
 * @param data Optional data to include in the response
 * @returns A standardized error response
 */
export function errorResponse<T>(
  message: string,
  data?: T,
): ServiceResponse<T> {
  return {
    success: false,
    message,
    ...(data !== undefined && { data }),
  };
}
