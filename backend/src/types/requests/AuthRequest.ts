import { Request } from 'express';
import { IUser } from '../models/User';

/**
 * Extended Request interface that includes user information
 * 
 * This interface is used for authenticated routes where the user
 * information is attached to the request object by the auth middleware.
 */
export interface AuthRequest extends Request {
  /** The authenticated user object */
  user?: IUser;
  
  /** Data that has been validated (removed validation but keeping for compatibility) */
  validatedData?: any;
}
