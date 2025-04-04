import { Types } from 'mongoose';

/**
 * Interface for token user data
 * 
 * This interface defines the user data that is stored in JWT tokens.
 */
export interface TokenUser {
  /** User's MongoDB ID */
  _id?: string | Types.ObjectId;
  
  /** User's email address */
  userEmail: string;
  
  /** User's role */
  userRole: string;
  
  /** Any additional properties */
  [key: string]: any;
}

/**
 * Interface for decoded token data
 * 
 * This interface defines the structure of a decoded JWT token.
 */
export interface TokenData {
  /** User data stored in the token */
  data: TokenUser;
  
  /** Issued at timestamp */
  iat: number;
  
  /** Expiration timestamp */
  exp: number;
}
