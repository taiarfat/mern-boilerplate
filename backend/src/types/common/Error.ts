/**
 * Interface for custom error type
 * 
 * This interface extends the standard Error interface to include
 * an HTTP status code.
 */
export interface CustomErrorType extends Error {
  /** HTTP status code for the error */
  status: number;
}
