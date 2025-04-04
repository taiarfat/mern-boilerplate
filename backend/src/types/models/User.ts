import { Document, Types } from 'mongoose';

/**
 * Interface representing a User document in MongoDB
 * 
 * This interface extends the Mongoose Document interface and defines
 * the structure and types for the User model.
 */
export interface IUser extends Document {
  /** User's full name */
  userName: string;
  
  /** User's email address (unique) */
  userEmail: string;
  
  /** User's hashed password (not returned in queries by default) */
  userPassword: string;
  
  /** User's gender (optional) */
  userGender?: 'male' | 'female' | 'other';
  
  /** User's role (admin, user, etc.) */
  userRole: string;
  
  /** User's date of birth (optional) */
  userDob?: Date;
  
  /** Timestamp when the document was created */
  createdAt: Date;
  
  /** Timestamp when the document was last updated */
  updatedAt: Date;
}
