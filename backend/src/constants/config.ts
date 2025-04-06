/**
 * Application Configuration
 *
 * This file loads environment variables and exports configuration
 * settings used throughout the application.
 */

import dotenv from "dotenv";
import { rateLimit } from "express-rate-limit";
// import { Config } from "../types/common/Config";

// Load environment variables from .env file
dotenv.config();

/**
 * Application configuration object
 *
 * Contains all configuration settings with defaults for missing environment variables.
 */
const config = {
  // Server configuration
  PORT: process.env.PORT,

  // Database configuration
  MONGO_URI: process.env.MONGO_URI || "",

  // Security configuration
  SALT_ROUND: process.env.SALT_ROUND || "10",

  // Rate limiting configuration (in minutes)
  RATE_LIMIT_TIME: process.env.RATE_LIMIT_TIME || "15",
  RATE_LIMIT_REQUEST: process.env.RATE_LIMIT_REQUEST || "100",

  // Access token configuration
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET || "access_secret",
  ACCESS_TOKEN_EXPIRES: process.env.ACCESS_TOKEN_EXPIRES || "15m",
  ACCESS_TOKEN_COOKIE_EXPIRE_TIME:
    process.env.ACCESS_TOKEN_COOKIE_EXPIRE_TIME || "15", // In minutes

  // Refresh token configuration
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || "refresh_secret",
  REFRESH_TOKEN_EXPIRES: process.env.REFRESH_TOKEN_EXPIRES || "7d",
  REFRESH_TOKEN_COOKIE_EXPIRE_TIME:
    process.env.REFRESH_TOKEN_COOKIE_EXPIRE_TIME || "10080", // In minutes (7 days)

  // Database token expiration (in minutes)
  DB_TOKEN_EXPIRES: process.env.DB_TOKEN_EXPIRES || "10080", // 7 days

  AI_ENDPOINT: process.env.AI_ENDPOINT || "https://api.AI.com/v1/chat/completions",

  AI_MODEL: process.env.AI_MODEL || "gemma3:4b",
};

/**
 * CORS configuration options
 *
 * Controls Cross-Origin Resource Sharing settings.
 */
export const corsOptions = {
  // Allow requests from any origin
  // For production, this should be restricted to specific domains
  origin: "*",
};

/**
 * Rate limiter configuration
 *
 * Limits the number of requests a client can make in a given time window.
 * Helps prevent abuse and DoS attacks.
 */
export const limiter = rateLimit({
  // Time window in milliseconds
  windowMs: 60 * 1000 * parseInt(config.RATE_LIMIT_TIME),
  // Maximum number of requests per window
  max: parseInt(config.RATE_LIMIT_REQUEST),
});

export default config;
