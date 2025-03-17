/**
 * Standard API response interface
 * @template T The type of data returned in the response
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}
