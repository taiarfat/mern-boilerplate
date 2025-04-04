/**
 * Main application file
 *
 * This file sets up the Express application with all middleware,
 * routes, and error handlers. It's the entry point for the backend API.
 */

// External dependencies
import express, { Request, Response, NextFunction } from "express";
import logger from "morgan";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "node:path";

// Internal imports
import indexRoute from "./modules/index";
import { CustomError, httpStatusCodes } from "./constants/constants";
import { errResponse } from "./helpers/response";
import connectMongo from "./databases/connectMongo";
import { corsOptions, limiter } from "./constants/config";

/**
 * Initialize Express application
 */
const app = express();

/**
 * Middleware Setup
 */
// Enable CORS with configured options
app.use(cors(corsOptions));

// Rate limiting to prevent abuse
// app.use(limiter);

// Secure HTTP headers
app.use(helmet());

// Parse cookies from request headers
app.use(cookieParser());

// Parse JSON request bodies
app.use(express.json());

// Parse URL-encoded request bodies (form data)
app.use(express.urlencoded({ extended: true }));

// HTTP request logging
app.use(logger("dev"));

// Serve static files from public directory
app.use(express.static(path.resolve(__dirname, "../../public")));

/**
 * Database Connection
 * Establish connection to MongoDB database
 */
connectMongo().then(() => {
  console.log('MongoDB connected successfully');
}).catch(err => {
  console.error('MongoDB connection error:', err);
  throw new Error(err);
});

/**
 * Routes Setup
 */
// Mount API routes under /api path
app.use("/api", indexRoute);

// Root route - simple welcome message
app.get("/", (_req: Request, res: Response) => {
  res.send("Welcome to Express App");
});

/**
 * Error Handling
 */
// Catch-all route for undefined routes (404 handler)
app.use("*", (_req: Request, _res: Response, next: NextFunction) => {
  next(new CustomError(httpStatusCodes["Not Found"], "Not found"));
});

// Global error handler middleware
app.use(errResponse as any);

/**
 * Export the configured Express app
 */
export default app;