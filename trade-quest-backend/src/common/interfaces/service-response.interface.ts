import { ApiResponse } from './api-response.interface';

/**
 * Service response interface that matches the API response format
 * @template T The type of data returned by the service
 */
export type ServiceResponse<T = any> = ApiResponse<T>;
