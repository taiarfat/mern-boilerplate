// /**
//  * Interface for application configuration
//  * 
//  * This interface defines the structure of the application configuration
//  * loaded from environment variables.
//  */
// export interface Config {
//   /** Port the server will listen on */
//   PORT?: string | number;
  
//   /** MongoDB connection URI */
//   MONGO_URI: string;
  
//   /** Number of salt rounds for password hashing */
//   SALT_ROUND: string;
  
//   /** Rate limit time window in minutes */
//   RATE_LIMIT_TIME: string;
  
//   /** Maximum number of requests in the rate limit window */
//   RATE_LIMIT_REQUEST: string;
  
//   /** Secret for signing access tokens */
//   ACCESS_TOKEN_SECRET: string;
  
//   /** Access token expiration time */
//   ACCESS_TOKEN_EXPIRES: string;
  
//   /** Access token cookie expiration time in minutes */
//   ACCESS_TOKEN_COOKIE_EXPIRE_TIME: string;
  
//   /** Secret for signing refresh tokens */
//   REFRESH_TOKEN_SECRET: string;
  
//   /** Refresh token expiration time */
//   REFRESH_TOKEN_EXPIRES: string;
  
//   /** Refresh token cookie expiration time in minutes */
//   REFRESH_TOKEN_COOKIE_EXPIRE_TIME: string;
  
//   /** Database token expiration time in minutes */
//   DB_TOKEN_EXPIRES: string;
// }
