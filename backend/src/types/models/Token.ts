import { Document, Types } from 'mongoose';

/**
 * Interface representing a Token document in MongoDB
 * 
 * This interface extends the Mongoose Document interface and defines
 * the structure and types for the Token model used for refresh tokens.
 */
export interface IToken extends Document {
  /** The refresh token string */
  refreshToken: string;
  
  /** Reference to the user this token belongs to */
  userId: Types.ObjectId;
  
  /** Timestamp when the document was created */
  createdAt: Date;
  
  /** Timestamp when the document was last updated */
  updatedAt: Date;
}
