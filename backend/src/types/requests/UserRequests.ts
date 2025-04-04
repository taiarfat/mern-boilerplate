/**
 * Interface for login request data
 */
export interface LoginRequest {
  /** User's email address */
  userEmail: string;

  /** User's password (plain text) */
  userPassword: string;
}

/**
 * Interface for user registration request data
 */
export interface RegisterRequest {
  /** User's full name */
  userName: string;

  /** User's email address */
  userEmail: string;

  /** User's password (plain text) */
  userPassword: string;

  /** User's gender (optional) */
  userGender?: string;

  /** User's role (defaults to 'user' if not provided) */
  userRole?: string;
}

/**
 * Interface for user update request data
 */
export interface UpdateUserRequest {
  /** User's full name (optional) */
  userName?: string;

  /** User's email address (optional) */
  userEmail?: string;

  /** User's password (plain text, optional) */
  userPassword?: string;

  /** User's gender (optional) */
  userGender?: string;

  /** User's role (optional) */
  userRole?: string;

  /** User's date of birth (optional) */
  userDob?: Date;

  /** User ID for route params */
  id?: string;

  /** Any additional properties */
  [key: string]: any;
}
