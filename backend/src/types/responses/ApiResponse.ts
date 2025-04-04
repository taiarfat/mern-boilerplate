/**
 * Generic API response interface
 * 
 * This interface defines the standard structure for all API responses
 * in the application.
 */
export interface ApiResponse<T = any> {
  /** Status of the response (SUCCESS or ERROR) */
  status: string;
  
  /** HTTP status code */
  statuscode: number;
  
  /** Description of the operation performed */
  operation?: string;
  
  /** Response data (generic type) */
  data?: T;
  
  /** Error message (only for error responses) */
  message?: string;
}
